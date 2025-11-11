import pytest
from django.test import Client


@pytest.fixture
def client():
    """Django test client fixture"""
    return Client()


@pytest.fixture
def mock_flask_response():
    """Mock Flask API response fixture"""
    return {
        "id": 1,
        "status": "processing",
        "message": "Image uploaded successfully"
    }
