import pytest
from django.test import RequestFactory
from backend.views import health_check, serve_react


@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check_returns_ok(self, client):
        """Test health check endpoint returns OK status"""
        response = client.get('/health/')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['service'] == 'peek_client'


class TestServeReact:
    def test_serve_react_without_build(self):
        """Test serve_react returns build required page when no build exists"""
        factory = RequestFactory()
        request = factory.get('/')
        response = serve_react(request)
        assert response.status_code == 200
        assert b'Build Required' in response.content or b'index.html' in response.content

    def test_serve_react_index_path(self):
        """Test serve_react handles index path"""
        factory = RequestFactory()
        request = factory.get('/')
        response = serve_react(request, path='')
        assert response.status_code == 200
        assert response['Content-Type'] == 'text/html'
