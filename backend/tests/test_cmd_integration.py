import sys
import subprocess
from pathlib import Path

# Get the path to the main.py script
MAIN_SCRIPT = str(Path(__file__).parent.parent / "src" / "main.py")

def test_cmd_simulation_no_server():
    """
    Test that running the application without --server flag:
    1. Executes the simulation directly
    2. Prints logs to stdout
    3. Doesn't start the uvicorn server
    """
    # Run the script as a subprocess and capture output
    process = subprocess.Popen(
        [sys.executable, MAIN_SCRIPT],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Get output and error streams
    stdout, stderr = process.communicate()
    return_code = process.returncode

    # Check that the process completed successfully
    assert return_code == 0

    # Check that we get simulation output in stdout
    assert "INFO: Gateway: Time 0.00: Started RequestReplyMessage transmission" in stdout

    # Verify that uvicorn server messages are not present
    assert "Uvicorn running on" not in stdout
    assert "Uvicorn running on" not in stderr

def test_cmd_simulation_with_server():
    """
    Test that running the application with --server flag starts the uvicorn server
    """

    # Start the process
    process = subprocess.Popen(
        [sys.executable, MAIN_SCRIPT, "--server"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    import time
    time.sleep(3)

    process.terminate()
    outs, errs = process.communicate()

    # Dont know why the log is in stderr
    assert "Uvicorn running on" in errs

def test_cmd_simulation_with_custom_params():
    """
    Test that custom parameters are properly handled in command-line mode
    """
    process = subprocess.Popen(
        [
            sys.executable,
            MAIN_SCRIPT,
            "--sensor-count", "16",
            "--log-level", "debug",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout, stderr = process.communicate(timeout=3)

    assert process.returncode == 0

    # Check that DEBUG level logs are present
    assert "DEBUG" in stdout

    # Check that simulation parameters are reflected in the output
    assert "Sensor-15:" in stdout

def test_cmd_simulation_invalid_params():
    """
    Test that invalid parameters are properly handled in command-line mode
    """
    process = subprocess.Popen(
        [
            sys.executable,
            MAIN_SCRIPT,
            "--data-channels", "-1"  # Invalid negative value
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout, stderr = process.communicate()
    return_code = process.returncode

    # Should exit with non-zero status
    assert return_code != 0
