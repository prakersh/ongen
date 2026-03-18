"""Simple scheduler for spreading credit usage across the month."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from rich.console import Console

from .batch import process_batch, print_manifest_summary
from .config import settings

console = Console()


def daily_budget(monthly_budget: int | None = None) -> int:
    """Calculate how many credits to use today to spread evenly across the month."""
    budget = monthly_budget or settings.monthly_credit_budget
    now = datetime.now()
    # Days remaining in the month (including today)
    if now.month == 12:
        days_in_month = 31
    else:
        from calendar import monthrange
        _, days_in_month = monthrange(now.year, now.month)
    days_remaining = days_in_month - now.day + 1
    return max(1, budget // days_remaining)


async def run_daily_batch(
    batch_file: Path,
    max_credits: int | None = None,
    delay: int | None = None,
) -> None:
    """Run a batch limited to today's credit budget.

    Useful for cron: `0 9 * * * ongen schedule prompts.json`
    """
    budget = max_credits or daily_budget()
    console.print(f"[cyan]Daily credit budget: {budget}[/cyan]")

    manifest = await process_batch(batch_file, delay=delay)
    total_credits = sum(r.credits_used for r in manifest.results if r.status == "success")

    console.print(f"\n[bold]Credits used today: {total_credits}/{budget}[/bold]")
    print_manifest_summary(manifest)
