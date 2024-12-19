from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)
default_params = {
    "data_channels": "2",
    "data_slots_per_channel": "3",
    "request_slots": "4",
    "rrm_period": "0.3",
    "max_cycles": "3",
    "sensor_count": "4",
    "sensors_measurement_chance": "0.8",
    "log_level": "info",
    "seed": "12345"
}

def test_with_parameters():
    """Test simulation with parameters"""
    response = client.get("/api/simulate", params=default_params)
    assert response.status_code == 200
    data = response.json()

    # Verify seed was used
    assert data["seed"] == "12345"

    # Check if all expected keys are present
    assert "log" in data
    assert "ftr_values" in data
    assert "measurement_latencies" in data
    assert "statistics" in data
    assert "seed" in data

    # Check statistics structure
    stats = data["statistics"]
    assert "median_ftr" in stats
    assert "cycles_to_ftr_equilibrium" in stats
    assert "measurement_latency_1_percentile" in stats
    assert "measurement_latency_25_percentile" in stats
    assert "measurement_latency_50_percentile" in stats
    assert "measurement_latency_75_percentile" in stats
    assert "measurement_latency_99_percentile" in stats

def test_without_parameters():
    """Test simulation without parameters"""
    response = client.get("/api/simulate")
    data = response.json()
    assert response.status_code == 400
    assert "8 validation errors for SimulationParams" in data["detail"]

def test_with_some_parameters():
    """Test simulation without parameters"""
    response = client.get("/api/simulate", params={"sensor_count" : 10})
    data = response.json()
    assert response.status_code == 400
    assert "7 validation errors for SimulationParams" in data["detail"]

def test_without_seed():
    """Test simulation without seed"""
    new_params = default_params.copy()
    del new_params["seed"]
    response = client.get("/api/simulate", params=new_params)
    assert response.status_code == 200

def test_invalid_parameters():
    """Test simulation with invalid parameters"""
    # Test negative values
    new_params = default_params.copy()
    new_params["sensor_count"] = "-1"
    response = client.get("/api/simulate", params=new_params)
    assert response.status_code == 400

def test_reproducibility():
    """Test if same seed produces same results"""

    # Run simulation twice with same seed
    response1 = client.get("/api/simulate", params=default_params)
    response2 = client.get("/api/simulate", params=default_params)

    assert response1.status_code == 200
    assert response2.status_code == 200

    data1 = response1.json()
    data2 = response2.json()

    # Check if results are identical
    assert data1["ftr_values"] == data2["ftr_values"]
    assert data1["measurement_latencies"] == data2["measurement_latencies"]
    assert data1["statistics"] == data2["statistics"]

def test_performance_bounds():
    """Test simulation performance metrics are within reasonable bounds"""
    response = client.get("/api/simulate", params=default_params)
    assert response.status_code == 200
    data = response.json()

    stats = data["statistics"]

    # FTR should be between 0 and 1
    assert 0 <= stats["median_ftr"] <= 1

    # Latencies should be positive
    assert stats["measurement_latency_1_percentile"] >= 0
    assert stats["measurement_latency_99_percentile"] >= stats["measurement_latency_1_percentile"]
