## 24 Sep 2024
Attendees: Edoardo Luciani, Ivaylo Valkov

### Achieved in previous week
- Read relevant papers: Ivaylo's PhD and "Control Communication Co-Design for Wide Area
Cyber-Physical Systems"
- Gained an understanding of the protocol
- Set up repository
- Initial implementation of the protocol using SimPy, set up RRM messaging from gateway to sensors
- Airtime computation and implementation
- Set up messagging from sensors to gateway
- Sensor's messages collision detection

### Issues discussed and solutions agreed
- Meeting schedule -> Tuesday@10
- Project is engineering based? -> Yes
- Clarity on subdivisions of channels between uplink and downlink -> x data channels, 2 channels for data transmission request and gateway downlink
- Requirements on simulation of duty cycle? -> No
- Simulation of actuators? -> Not needed right now, maybe in the future
- Variable parameters in the simulation -> request_slots, sensors

### Objectives for the next week
- Implement Transmission Request message
- Allocation of channels and slots in RRM
- Sensor logic to transmit data
- Gateway logic to detect collisions


## 1 Oct 2024
Attendees: Edoardo Luciani, Ivaylo Valkov

### Achieved in previous week
- Implemented Transmission Request message
- Implemented Request Slot channel and slot subdivision
- Implemented logic for slot allocation
- Initial proof of concept for visualization with manim
- Deterministic runs

### Issues discussed and solutions agreed
- Stat visualization -> ftr trend (on video), distribution of of latency time in cycles for sensors measurements first cycle
- Cloud deployment -> Good
- Does 0th slot mean send imeediately? Yes
- Is a slot chosen randomly regardless of it current state? Yes

### Objectives for the next week
- Fix bugs on the simulation
- Hook up the simulation event loop to the manim frontend


## 8 Oct 2024
Attendees: Edoardo Luciani, Ivaylo Valkov

### Achieved in previous week
- Implemented script argument to modify executions before runtime
- Send transmission request on current period if 0th rrm
- Hooked up simpy simulation to manim rendering system
- Implemented stat tracker for latency and ftr values over time

### Issues discussed and solutions agreed
- Video rendering is slow, around 1-2 mins per 5 cycles. Maybe not good for deployment. Investigate a browser native solution
- Does the ftr plot look correct? -> Yes

### Objectives for the next week
- Stats for the FTR value
- Investigate framework for web animation
- Web interface
