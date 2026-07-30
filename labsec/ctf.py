"""Local command orchestration for CTF and training labs."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import subprocess


def run_command(name: str, command: str, output_directory: Path) -> tuple[int, Path]:
    """Run a locally supplied lab command and persist its combined output."""
    output_directory.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    safe_name = "".join(char if char.isalnum() or char in "-_" else "_" for char in name)
    output_path = output_directory / f"{safe_name}-{timestamp}.log"

    completed = subprocess.run(
        command,
        shell=True,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    output_path.write_text(completed.stdout + completed.stderr, encoding="utf-8")
    return completed.returncode, output_path
