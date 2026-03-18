"""Configuration management for OnGen."""

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_prefix": "ONGEN_"}

    flow2api_url: str = "http://localhost:38000"
    api_key: str = "han1234"
    output_dir: Path = Path("output")
    default_model: str = "veo_3_1_t2v_fast_landscape"
    default_aspect_ratio: str = "landscape"
    delay_between_requests: int = 10
    monthly_credit_budget: int = 1000
    request_timeout: int = 600

    def get_output_dir(self) -> Path:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        return self.output_dir


settings = Settings()
