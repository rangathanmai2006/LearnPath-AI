"""Run the isolated integration suite; never mutate the configured student database."""

from pathlib import Path
import pytest


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    tests_dir = project_root / "backend" / "tests"
    return int(pytest.main(["-q", str(tests_dir)]))


if __name__ == "__main__":
    raise SystemExit(main())
