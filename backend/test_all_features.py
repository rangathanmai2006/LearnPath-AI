"""Run the isolated full integration suite without touching student records."""

from pathlib import Path
import pytest


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    raise SystemExit(pytest.main(["-q", str(project_root / "backend" / "tests")]))
