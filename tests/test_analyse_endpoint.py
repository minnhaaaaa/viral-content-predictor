import os
import sys

import pytest
from fastapi.testclient import TestClient

# Dynamically add the 'backend' directory to the Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(BASE_DIR, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from main import app


@pytest.fixture
def client():
    """Fixture to provide a TestClient instance."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def sample_video_path():
    """Fixture to get the absolute path of the sample video."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(current_dir, "sample_uploads", "sample.mp4")
    if not os.path.exists(path):
        pytest.fail(f"Test video missing at: {path}")
    return path


def test_analyse_video_endpoint(client, sample_video_path):
    # Open the actual sample video file
    with open(sample_video_path, "rb") as video_file:
        files = {"video": ("sample.mp4", video_file, "video/mp4")}

        # Form fields matching routes.py Form parameters
        data = {
            "platform": "tiktok",
            "keywords": "fitness,workout,gym",
            "target_country": "US",
            "intended_posting_time": "18:30",
            "follower_count": "5000",
            "avg_views_last_10": "1200.5",  # Maps to your route parameters
            "days_since_last_post": "2",
        }

        # Execute POST request using multipart/form-data
        response = client.post("/analyse", data=data, files=files)

    # Assertions
    assert response.status_code == 200

    json_res = response.json()
    assert "composite_score" in json_res
    assert "platform_scores" in json_res
    assert "layer_scores" in json_res
    assert isinstance(json_res["attention_curve"], list)

    # Optional: Verify structural nested mock values from your service layer
    assert json_res["distribution"]["posting_time_recommendation"] == "Pending"
