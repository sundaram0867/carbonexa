def test_health_ok(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"data": {"status": "ok", "service": "carbonexa-api"}}


def test_health_db_ok(client):
    r = client.get("/api/v1/health/db")
    assert r.status_code == 200
    assert r.json()["data"]["database"] == "connected"


def test_unknown_route_uses_error_contract(client):
    r = client.get("/api/v1/nope")
    assert r.status_code == 404
    assert "error" in r.json()


def test_cors_allows_vite_origin(client):
    r = client.get("/api/v1/health", headers={"Origin": "http://localhost:5173"})
    assert r.headers["access-control-allow-origin"] == "http://localhost:5173"
