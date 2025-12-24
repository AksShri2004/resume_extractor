import os

def test_project_files_exist():
    """
    Test that the essential project configuration files exist.
    """
    assert os.path.exists("pyproject.toml"), "pyproject.toml should exist"
    assert os.path.exists("Dockerfile"), "Dockerfile should exist"
