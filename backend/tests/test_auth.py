from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_login_endpoint():
    payload = {'email': 'user@safesight.ai', 'password': 'Demo@1234'}
    response = client.post('/api/v1/auth/login', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert data['token_type'] == 'bearer'


def test_scan_endpoint():
    payload = {'url': 'https://company-demo.com'}
    response = client.post('/api/v1/scan', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['url'] == 'https://company-demo.com'
    assert 'score' in data
    assert 'risks' in data
    assert len(data['risks']) >= 3
    assert all(risk['recommendation'] for risk in data['risks'])


def test_admin_overview_endpoint():
    response = client.get('/api/v1/admin/overview')
    assert response.status_code == 200
    data = response.json()
    assert 'total_users' in data
    assert 'total_scans' in data
    assert 'system_status' in data
