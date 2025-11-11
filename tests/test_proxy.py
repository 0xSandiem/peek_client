import pytest
from unittest.mock import Mock, patch
from django.test import RequestFactory
from backend.views import proxy_to_flask


@pytest.mark.django_db
class TestProxyToFlask:
    def setup_method(self):
        """Setup test fixtures"""
        self.factory = RequestFactory()

    @patch('backend.views.requests.get')
    def test_proxy_get_request(self, mock_get):
        """Test proxy handles GET requests correctly"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'status': 'ok'}
        mock_response.headers = {'content-type': 'application/json'}
        mock_get.return_value = mock_response

        request = self.factory.get('/api/health')
        response = proxy_to_flask(request, 'health')

        assert response.status_code == 200
        assert mock_get.called

    @patch('backend.views.requests.post')
    def test_proxy_post_request(self, mock_post):
        """Test proxy handles POST requests correctly"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'id': 1, 'status': 'processing'}
        mock_response.headers = {'content-type': 'application/json'}
        mock_post.return_value = mock_response

        request = self.factory.post('/api/analyze', data={'test': 'data'})
        response = proxy_to_flask(request, 'analyze')

        assert response.status_code == 200
        assert mock_post.called

    @patch('backend.views.requests.get')
    def test_proxy_handles_timeout(self, mock_get):
        """Test proxy handles timeout errors"""
        mock_get.side_effect = Exception('Connection timeout')

        request = self.factory.get('/api/test')
        response = proxy_to_flask(request, 'test')

        assert response.status_code == 500
        data = response.json()
        assert 'error' in data

    def test_proxy_unsupported_method(self):
        """Test proxy rejects unsupported HTTP methods"""
        request = self.factory.patch('/api/test')
        response = proxy_to_flask(request, 'test')

        assert response.status_code == 405
        data = response.json()
        assert data['error'] == 'Method not allowed'
