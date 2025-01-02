import pytest
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
    "sensors_measurement_chance": "1",
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
    data = response.json()

    assert response.status_code == 400
    assert "1 validation error for SimulationParams\nsensor_count\n  Input should be greater than 0" in data["detail"]

def test_too_many_request_slots():
    """Test simulation with too many request slots parameters"""
    # Test negative values
    new_params = default_params.copy()
    new_params["request_slots"] = "200"
    response = client.get("/api/simulate", params=new_params)
    data = response.json()

    assert response.status_code == 400
    assert "Not enough data channels or data slots to fill all the rrm request slots" in data["detail"]

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

    new_params = {
        "data_channels": "2",
        "data_slots_per_channel": "3",
        "request_slots": "6",
        "rrm_period": "0.5",
        "max_cycles": "15",
        "sensor_count": "20",
        "sensors_measurement_chance": "1",
        "log_level": "info",
        "seed": "12345"
    }

    response = client.get("/api/simulate", params=new_params)
    assert response.status_code == 200
    data = response.json()

    assert data["ftr_values"] == [0, 0, 0, 5, 5, 4, 3, 2, 3, 4, 5, 4, 4, 4, 5]

    expected_latencies = [2.1239, 2.2905, 2.8215, 2.9882, 3.1858, 3.3525, 3.3525, 3.5191, 3.5191, 3.8834, 4.0501, 1.0619, 4.4144, 1.0619, 1.3952, 2.6548, 5.4764, 1.2286, 1.3952, 5.8407, 1.3952, 3.5191, 6.902, 1.3952, 7.4336, 3.7168, 4.0501]
    assert data["measurement_latencies"] == pytest.approx(expected_latencies, rel=1e-4)

    expected_stats = {
        'median_ftr': 4.0,
        'cycles_to_ftr_equilibrium': 3,
        'measurement_latency_1_percentile': 1.062,
        'measurement_latency_25_percentile': 1.76,
        'measurement_latency_50_percentile': 3.353,
        'measurement_latency_75_percentile': 3.967,
        'measurement_latency_99_percentile': 7.296
    }
    assert data["statistics"] == pytest.approx(expected_stats, rel=1e-3)
