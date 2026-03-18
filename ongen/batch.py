"""Batch processing for OnGen."""

from __future__ import annotations

import asyncio
import csv
import json
import time
from pathlib import Path
from typing import Optional

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table

from .client import Flow2APIClient
from .config import settings
from .models import BatchManifest, GenerationResult, PromptItem

console = Console()


def load_prompts_csv(path: Path) -> list[PromptItem]:
    """Load prompts from a CSV file.

    Expected columns: prompt, orientation, model, output_name
    Only 'prompt' is required.
    """
    items = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prompt = row.get("prompt", "").strip()
            if not prompt:
                continue
            items.append(PromptItem(
                prompt=prompt,
                orientation=row.get("orientation", "landscape").strip() or "landscape",
                model=row.get("model", "").strip() or None,
                gen_type=row.get("gen_type", "t2v").strip() or "t2v",
                output_name=row.get("output_name", "").strip() or None,
            ))
    return items


def load_prompts_json(path: Path) -> list[PromptItem]:
    """Load prompts from a JSON file.

    Expected format: array of objects with at minimum a 'prompt' field.
    """
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        data = [data]
    return [PromptItem(**item) for item in data]


def load_prompts(path: Path) -> list[PromptItem]:
    """Load prompts from CSV or JSON based on file extension."""
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return load_prompts_csv(path)
    elif suffix == ".json":
        return load_prompts_json(path)
    else:
        raise ValueError(f"Unsupported file format: {suffix}. Use .csv or .json")


def _manifest_path(batch_file: Path) -> Path:
    """Path for the manifest file tracking batch progress."""
    return batch_file.with_suffix(".manifest.json")


def load_manifest(batch_file: Path) -> BatchManifest | None:
    """Load existing manifest for resumable processing."""
    mp = _manifest_path(batch_file)
    if mp.exists():
        return BatchManifest.model_validate_json(mp.read_text())
    return None


def save_manifest(batch_file: Path, manifest: BatchManifest) -> None:
    """Save manifest to disk."""
    mp = _manifest_path(batch_file)
    mp.write_text(manifest.model_dump_json(indent=2))


async def process_batch(
    batch_file: Path,
    delay: int | None = None,
    resume: bool = True,
    output_dir: Path | None = None,
) -> BatchManifest:
    """Process a batch of prompts from a file.

    Args:
        batch_file: Path to CSV or JSON prompt file.
        delay: Seconds between requests (default from settings).
        resume: If True, skip already-completed prompts from prior run.
        output_dir: Override output directory.
    """
    delay = delay if delay is not None else settings.delay_between_requests
    out_dir = output_dir or settings.get_output_dir()
    client = Flow2APIClient()

    prompts = load_prompts(batch_file)
    if not prompts:
        console.print("[yellow]No prompts found in file.[/yellow]")
        return BatchManifest()

    # Resume support: load existing manifest and skip completed prompts
    manifest = load_manifest(batch_file) if resume else None
    completed_prompts: set[str] = set()
    if manifest:
        completed_prompts = {r.prompt for r in manifest.results if r.status == "success"}
        console.print(f"[cyan]Resuming: {len(completed_prompts)}/{len(prompts)} already completed[/cyan]")
    else:
        manifest = BatchManifest(total=len(prompts))

    manifest.total = len(prompts)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("Processing batch", total=len(prompts), completed=len(completed_prompts))

        for i, item in enumerate(prompts):
            if item.prompt in completed_prompts:
                continue

            desc = f"[{i+1}/{len(prompts)}] {item.prompt[:60]}..."
            progress.update(task, description=desc)

            result = await client.generate(item, output_dir=out_dir)
            manifest.results.append(result)

            if result.status == "success":
                manifest.completed += 1
                console.print(f"  [green]✓[/green] {result.output_path}")
            else:
                manifest.failed += 1
                console.print(f"  [red]✗[/red] {result.error}")

            progress.advance(task)
            save_manifest(batch_file, manifest)

            # Delay between requests (skip after last)
            if delay > 0 and i < len(prompts) - 1 and item.prompt not in completed_prompts:
                await asyncio.sleep(delay)

    return manifest


def print_manifest_summary(manifest: BatchManifest) -> None:
    """Print a summary table of batch results."""
    table = Table(title="Batch Results")
    table.add_column("Status", style="bold")
    table.add_column("Count")
    table.add_row("[green]Completed[/green]", str(manifest.completed))
    table.add_row("[red]Failed[/red]", str(manifest.failed))
    table.add_row("Pending", str(manifest.pending))
    table.add_row("[bold]Total[/bold]", str(manifest.total))
    console.print(table)
