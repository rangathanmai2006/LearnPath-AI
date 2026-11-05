"""Run the isolated roadmap and student journey integration suite."""

from pathlib import Path
import pytest


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    raise SystemExit(pytest.main(["-q", str(project_root / "backend" / "tests" / "test_paths.py"), str(project_root / "backend" / "tests" / "test_student_journey.py")]))
