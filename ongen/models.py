"""Data models for OnGen."""

from __future__ import annotations

from enum import Enum
from pathlib import Path
from typing import Optional

from pydantic import BaseModel


class Orientation(str, Enum):
    LANDSCAPE = "landscape"
    PORTRAIT = "portrait"


class GenerationType(str, Enum):
    TEXT_TO_VIDEO = "t2v"
    IMAGE_TO_VIDEO = "i2v"
    REF_TO_VIDEO = "r2v"
    TEXT_TO_IMAGE = "t2i"
    UPSCALE = "upscale"


# Model name mappings keyed by (generation_type, orientation)
VIDEO_MODELS = {
    # Text-to-video
    ("t2v", "landscape"): "veo_3_1_t2v_fast_landscape",
    ("t2v", "portrait"): "veo_3_1_t2v_fast_portrait",
    # Image-to-video (first/last frame)
    ("i2v", "landscape"): "veo_3_1_i2v_s_fast_fl",
    ("i2v", "portrait"): "veo_3_1_i2v_s_fast_portrait_fl",
    # Reference images to video
    ("r2v", "landscape"): "veo_3_1_r2v_fast",
    ("r2v", "portrait"): "veo_3_1_r2v_fast_portrait",
    # Upscale (4K)
    ("upscale_t2v", "landscape"): "veo_3_1_t2v_fast_4k",
    ("upscale_t2v", "portrait"): "veo_3_1_t2v_fast_portrait_4k",
    ("upscale_i2v", "landscape"): "veo_3_1_i2v_s_fast_ultra_fl_4k",
    ("upscale_i2v", "portrait"): "veo_3_1_i2v_s_fast_portrait_ultra_fl_4k",
}

IMAGE_MODELS = {
    ("t2i", "landscape"): "gemini-3.1-flash-image-landscape",
    ("t2i", "portrait"): "gemini-3.1-flash-image-portrait",
    ("t2i", "square"): "gemini-3.1-flash-image-square",
}


def resolve_model(model: Optional[str], gen_type: str, orientation: str) -> str:
    """Resolve a model name from explicit model or type+orientation."""
    if model:
        return model
    key = (gen_type, orientation)
    if gen_type == "t2i":
        return IMAGE_MODELS.get(key, IMAGE_MODELS[("t2i", "landscape")])
    return VIDEO_MODELS.get(key, VIDEO_MODELS[("t2v", "landscape")])


class PromptItem(BaseModel):
    """A single generation prompt with configuration."""
    prompt: str
    model: Optional[str] = None
    orientation: str = "landscape"
    gen_type: str = "t2v"
    output_name: Optional[str] = None
    images: list[str] = []  # file paths for i2v/r2v

    def resolved_model(self) -> str:
        return resolve_model(self.model, self.gen_type, self.orientation)


class GenerationResult(BaseModel):
    """Result of a single generation."""
    prompt: str
    model: str
    status: str  # "success", "failed", "skipped"
    output_path: Optional[Path] = None
    media_url: Optional[str] = None
    error: Optional[str] = None
    credits_used: int = 0


class BatchManifest(BaseModel):
    """Tracks batch processing progress."""
    total: int = 0
    completed: int = 0
    failed: int = 0
    results: list[GenerationResult] = []

    @property
    def pending(self) -> int:
        return self.total - self.completed - self.failed
