"""flow2api client for OnGen."""

from __future__ import annotations

import base64
import json
import re
import time
from pathlib import Path
from typing import Optional

import httpx
from rich.console import Console

from .config import settings
from .models import GenerationResult, PromptItem, resolve_model

console = Console()

# Credit cost estimates per generation type
CREDIT_COSTS = {
    "t2v": 5,
    "i2v": 5,
    "r2v": 5,
    "t2i": 1,
    "upscale": 5,
}


class Flow2APIClient:
    """Client for the flow2api OpenAI-compatible API."""

    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout: int | None = None,
    ):
        self.base_url = (base_url or settings.flow2api_url).rstrip("/")
        self.api_key = api_key or settings.api_key
        self.timeout = timeout or settings.request_timeout

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _build_messages(self, prompt: str, images: list[str] | None = None) -> list[dict]:
        """Build OpenAI-compatible messages array."""
        if not images:
            return [{"role": "user", "content": prompt}]

        content: list[dict] = [{"type": "text", "text": prompt}]
        for img_path in images:
            img_data = Path(img_path).read_bytes()
            b64 = base64.b64encode(img_data).decode()
            suffix = Path(img_path).suffix.lstrip(".").lower()
            mime = f"image/{'jpeg' if suffix in ('jpg', 'jpeg') else suffix}"
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{b64}"},
            })
        return [{"role": "user", "content": content}]

    async def health_check(self) -> dict:
        """Check if flow2api is reachable."""
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(self.base_url)
                return {"status": "ok", "code": resp.status_code}
            except httpx.ConnectError:
                return {"status": "unreachable", "error": "Cannot connect to flow2api"}

    async def generate(self, item: PromptItem, output_dir: Path | None = None) -> GenerationResult:
        """Generate a video/image from a prompt item. Streams the SSE response."""
        model = item.resolved_model()
        messages = self._build_messages(item.prompt, item.images or None)
        payload = {"model": model, "messages": messages, "stream": True}
        out_dir = output_dir or settings.get_output_dir()

        collected_text = ""
        media_url = None

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout, connect=30)) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/v1/chat/completions",
                    json=payload,
                    headers=self._headers(),
                ) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        return GenerationResult(
                            prompt=item.prompt,
                            model=model,
                            status="failed",
                            error=f"HTTP {resp.status_code}: {body.decode()[:500]}",
                        )

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                collected_text += content
                        except json.JSONDecodeError:
                            continue

            # Extract media URL from the response
            # Video: <video src='URL' ...>
            # Image: ![...](URL) or <img src='URL' ...>
            video_match = re.search(r"<video\s+src='([^']+)'", collected_text)
            img_match = re.search(r"!\[.*?\]\(([^)]+)\)", collected_text) or re.search(
                r"<img\s+src='([^']+)'", collected_text
            )

            if video_match:
                media_url = video_match.group(1)
            elif img_match:
                media_url = img_match.group(1)

            if not media_url:
                # Check if there's a raw URL in the text
                url_match = re.search(r"(https?://\S+\.(?:mp4|webm|png|jpg|jpeg|gif))", collected_text)
                if url_match:
                    media_url = url_match.group(1)

            if not media_url:
                return GenerationResult(
                    prompt=item.prompt,
                    model=model,
                    status="failed",
                    error=f"No media URL found in response. Raw: {collected_text[:300]}",
                )

            # Download the media file
            output_path = await self._download_media(media_url, item, out_dir)

            return GenerationResult(
                prompt=item.prompt,
                model=model,
                status="success",
                output_path=output_path,
                media_url=media_url,
                credits_used=CREDIT_COSTS.get(item.gen_type, 5),
            )

        except httpx.TimeoutException:
            return GenerationResult(
                prompt=item.prompt,
                model=model,
                status="failed",
                error="Request timed out",
            )
        except Exception as e:
            return GenerationResult(
                prompt=item.prompt,
                model=model,
                status="failed",
                error=str(e),
            )

    async def _download_media(self, url: str, item: PromptItem, out_dir: Path) -> Path:
        """Download media from URL to output directory."""
        is_video = any(ext in url.lower() for ext in (".mp4", ".webm")) or "video" in item.gen_type
        ext = ".mp4" if is_video else ".png"

        if item.output_name:
            filename = item.output_name if "." in item.output_name else f"{item.output_name}{ext}"
        else:
            safe_prompt = re.sub(r"[^\w\s-]", "", item.prompt[:50]).strip().replace(" ", "_")
            timestamp = int(time.time())
            filename = f"{safe_prompt}_{timestamp}{ext}"

        output_path = out_dir / filename

        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            output_path.write_bytes(resp.content)

        return output_path

    async def text_to_video(
        self,
        prompt: str,
        orientation: str = "landscape",
        model: str | None = None,
        output_name: str | None = None,
    ) -> GenerationResult:
        """Generate a video from text."""
        item = PromptItem(
            prompt=prompt,
            model=model,
            orientation=orientation,
            gen_type="t2v",
            output_name=output_name,
        )
        return await self.generate(item)

    async def image_to_video(
        self,
        prompt: str,
        images: list[str],
        orientation: str = "landscape",
        model: str | None = None,
        output_name: str | None = None,
    ) -> GenerationResult:
        """Generate a video from image(s) + prompt."""
        item = PromptItem(
            prompt=prompt,
            model=model,
            orientation=orientation,
            gen_type="i2v",
            images=images,
            output_name=output_name,
        )
        return await self.generate(item)

    async def text_to_image(
        self,
        prompt: str,
        orientation: str = "landscape",
        model: str | None = None,
        output_name: str | None = None,
    ) -> GenerationResult:
        """Generate an image from text."""
        item = PromptItem(
            prompt=prompt,
            model=model,
            orientation=orientation,
            gen_type="t2i",
            output_name=output_name,
        )
        return await self.generate(item)
