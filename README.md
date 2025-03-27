# Ctrl-Mac Simulator

Ctrl-Mac Simulator is a visual simulator simulator for the [Ctrl-Mac](http://arxiv.org/abs/2008.07492) protocol, which deals with avoiding network collisions in a LPWAN network. It has been developed as part of my dissertation at the University of Glasgow.

The simulator is freely available to use at [ctrl-mac-simulator.com](https://ctrl-mac-simulator.com), complete with the protocol explanation and a user guide.

## Local Setup

Note: The simulator is already available at [ctrl-mac-simulator.com](https://ctrl-mac-simulator.com), so you don't need to run it locally unless you want to make changes to the code.

### Backend

To run the simulator locally, you need to have the [uv package manager](https://github.com/astral-sh/uv) installed. Then, you can install the required dependencies by running:
```
cd backend && uv sync
```
Finally, you can run a sample simulation by running:
```
python src/main.py
```
Parameters of the simulation can be tweaked by passing them as a command line. For the list of all the customizable parameters run:
```
python src/main.py --help
```
Additionally, a web server, which can serve simulation requests via http, can be started by running:
```
python src/main.py --server
```

### Frontend

If you want to also run the frontend locally, you need to have Node.js installed. You can install the required packages by running:
```
cd frontend && npm install
```
Then, you can start the frontend by running:
```
npm run dev
```
Now if you navigate to `http://localhost:5173` in your browser, you should see the simulator. Make sure that the backend was also started in web server mode!

### Testing Suite
To run the test suits, follow the instructions below:

#### Backend
```
cd backend && uv run pytest tests
```

#### Frontend
```
cd frontend && npm test
```

#### End-to-End
```
cd frontend && npx playwright install chromium firefox && npm run e2e
```
