"""CLI interface for OnGen."""

from __future__ import annotations

import asyncio
from pathlib import Path

import click
from rich.console import Console

from .config import settings

console = Console()


def run_async(coro):
    """Run an async function from sync context."""
    return asyncio.run(coro)


@click.group()
@click.version_option(package_name="ongen")
def cli():
    """OnGen — Google AI Pro video generation automation."""
    pass


@cli.command()
@click.argument("prompt")
@click.option("-o", "--orientation", default="landscape", type=click.Choice(["landscape", "portrait"]), help="Video orientation")
@click.option("-m", "--model", default=None, help="Model name override")
@click.option("-n", "--name", default=None, help="Output filename")
@click.option("--output-dir", default=None, type=click.Path(), help="Output directory")
def generate(prompt: str, orientation: str, model: str | None, name: str | None, output_dir: str | None):
    """Generate a single video from a text prompt."""
    from .client import Flow2APIClient

    client = Flow2APIClient()
    out = Path(output_dir) if output_dir else None

    console.print(f"[cyan]Generating video:[/cyan] {prompt[:80]}")
    console.print(f"[dim]Model: {model or settings.default_model} | Orientation: {orientation}[/dim]")

    result = run_async(client.text_to_video(prompt, orientation=orientation, model=model, output_name=name))

    if result.status == "success":
        console.print(f"[green]✓ Saved to:[/green] {result.output_path}")
    else:
        console.print(f"[red]✗ Failed:[/red] {result.error}")
        raise SystemExit(1)


@cli.command()
@click.argument("file", type=click.Path(exists=True, path_type=Path))
@click.option("-d", "--delay", default=None, type=int, help="Seconds between requests")
@click.option("--no-resume", is_flag=True, help="Start fresh, ignore previous progress")
@click.option("--output-dir", default=None, type=click.Path(), help="Output directory")
def batch(file: Path, delay: int | None, no_resume: bool, output_dir: str | None):
    """Process a batch of prompts from a CSV or JSON file."""
    from .batch import process_batch, print_manifest_summary

    out = Path(output_dir) if output_dir else None
    console.print(f"[cyan]Processing batch:[/cyan] {file}")

    manifest = run_async(process_batch(file, delay=delay, resume=not no_resume, output_dir=out))
    print_manifest_summary(manifest)

    if manifest.failed > 0:
        raise SystemExit(1)


@cli.command()
@click.argument("prompt")
@click.argument("images", nargs=-1, required=True, type=click.Path(exists=True))
@click.option("-o", "--orientation", default="landscape", type=click.Choice(["landscape", "portrait"]))
@click.option("-m", "--model", default=None, help="Model name override")
@click.option("-n", "--name", default=None, help="Output filename")
def i2v(prompt: str, images: tuple[str, ...], orientation: str, model: str | None, name: str | None):
    """Generate a video from image(s) and a motion prompt."""
    from .client import Flow2APIClient

    client = Flow2APIClient()
    console.print(f"[cyan]Image-to-video:[/cyan] {len(images)} image(s)")

    result = run_async(client.image_to_video(prompt, list(images), orientation=orientation, model=model, output_name=name))

    if result.status == "success":
        console.print(f"[green]✓ Saved to:[/green] {result.output_path}")
    else:
        console.print(f"[red]✗ Failed:[/red] {result.error}")
        raise SystemExit(1)


@cli.command()
@click.argument("prompt")
@click.option("-o", "--orientation", default="landscape", type=click.Choice(["landscape", "portrait", "square"]))
@click.option("-m", "--model", default=None, help="Model name override")
@click.option("-n", "--name", default=None, help="Output filename")
def image(prompt: str, orientation: str, model: str | None, name: str | None):
    """Generate an image from a text prompt."""
    from .client import Flow2APIClient

    client = Flow2APIClient()
    console.print(f"[cyan]Generating image:[/cyan] {prompt[:80]}")

    result = run_async(client.text_to_image(prompt, orientation=orientation, model=model, output_name=name))

    if result.status == "success":
        console.print(f"[green]✓ Saved to:[/green] {result.output_path}")
    else:
        console.print(f"[red]✗ Failed:[/red] {result.error}")
        raise SystemExit(1)


@cli.command()
def status():
    """Check flow2api health and show configuration."""
    from .client import Flow2APIClient

    client = Flow2APIClient()
    health = run_async(client.health_check())

    if health["status"] == "ok":
        console.print(f"[green]✓ flow2api is reachable[/green] at {settings.flow2api_url}")
    else:
        console.print(f"[red]✗ flow2api unreachable:[/red] {health.get('error', 'unknown')}")

    console.print(f"\n[bold]Configuration:[/bold]")
    console.print(f"  API URL:        {settings.flow2api_url}")
    console.print(f"  Output dir:     {settings.output_dir}")
    console.print(f"  Default model:  {settings.default_model}")
    console.print(f"  Request delay:  {settings.delay_between_requests}s")
    console.print(f"  Monthly budget: {settings.monthly_credit_budget} credits")


@cli.command()
@click.argument("file", type=click.Path(exists=True, path_type=Path))
@click.option("--max-credits", default=None, type=int, help="Override daily credit limit")
@click.option("-d", "--delay", default=None, type=int, help="Seconds between requests")
def schedule(file: Path, max_credits: int | None, delay: int | None):
    """Run a daily batch limited by credit budget. Use with cron."""
    from .scheduler import run_daily_batch

    run_async(run_daily_batch(file, max_credits=max_credits, delay=delay))
