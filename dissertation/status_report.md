
## *Ctrl-Mac Simulator*
#### *Edoardo Luciani*
#### *2575597L*

## Proposal
### Motivation
[//]: <> (Clearly motivate the purpose of your project; why someone would care about what you are doing)
Ctrl-Mac is a network protocol specifically created for low-power, wide-area network communications, between multiple sensors and a single gateway. Its main focus is dealing with network congestion, making sure that each sensor gets an allocated timeslot for transmitting its data, given strict restrictions on request slot availability.

Currently, Ctrl-Mac is a relatively new protocol, with limited implementation and presence in the real world, as of now, only present in academic literature. Additional and more easily accesible support resources on the protocol workings are needed.

### Aims
[//]: <> (Clearly state what the project is intended to do. This should be something which is measurable; it should be possible to tell if you succeeded)
This project main aim is to implement a visual simulator for the network protocol Ctrl-Mac, providing an easy to access online tool to simulate network congestion scenerios, visually understanding how congestion occurs and ultimately how the protocol deals with the scheduling of the data transmissions.

The tool need to be able to visually present each step of the protocol, how each sensor reacts to different gateway message transmissions and how the request slots status changes between the cycles.

Additionally the simulator needs to be able to simulate different scenarios, with changing dictated user parameters for example, number of sensors, cycle time and changes in data packet sizes.

The project is also tasked that the simulator aids in understanding of the protocol, by interviewing multiple undergraduate students about their interactions with the simulator and testing their understanding.

## Progress
[//]: <> (Briefly state your progress so far, as a bulleted list)
Backend:
- Implemented core logic of the protocol with a python real time event simulator.
- Allowed the simulation in python to accept and behave correctly with different input parameters.
- Computation of various statistics of the simulation computed in the python component for eventual plotting
- Unit and integration test coverage for the simulation component.
- Exposed the simulation logic via a REST api, allowing for frontend integration.
- Unified command line interface for performing both a local simulation and for starting a web worker serving simulation requests via the REST api.

Frontend:
- Built two core visualization logic systems.



## Problems and risks
### Problems
[//]: <> (What problems have you had so far, that have held up the project?)
- Understanding of the protocol
- Initial simulation was in manim
- Two different prototypes of the visual simulation in Javascript, that had different codebases and were hard to maintain.

### Risks
[//]: <> (What problems do you foresee in the future and how will you mitigate them?)


## Plan
[//]: <> (Time plan, in roughly weekly to monthly blocks, up until submission week)
