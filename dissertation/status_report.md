
# *Ctrl-Mac Simulator*
#### *Edoardo Luciani*
#### *2575597L*

## Proposal
### Motivation
[//]: <> (Clearly motivate the purpose of your project; why someone would care about what you are doing)
Ctrl-Mac is a network protocol specifically created for low-power, wide-area network communications, between multiple sensors and a single gateway. Its main focus is dealing with network congestion, making sure that each sensor gets an allocated timeslot for transmitting its data, given strict restrictions on request slot availability.


Currently, Ctrl-Mac is a relatively new protocol, with limited implementation and presence in the real world, as of now, only present in academic literature. Additional and more easily accesible support resources on the protocol workings are needed.

### Aims
[//]: <> (Clearly state what the project is intended to do. This should be something which is measurable; it should be possible to tell if you succeeded)
This project main aim is to implement a visual simulator for the network protocol Ctrl-Mac, providing an easy to access online tool to simulate network congestion scenarios, visually understanding how congestion occurs and ultimately how the protocol deals with the scheduling of the data transmissions.


The tool need to be able to visually present each step of the protocol, how each sensor reacts to different gateway message transmissions and how the request slots status changes between the cycles.


Additionally the simulator needs to be able to simulate different scenarios, with changing dictated user parameters for example, number of sensors, cycle time and changes in data packet sizes.


The project is also tasked that the simulator actually aids in understanding of the protocol, by interviewing multiple undergraduate students about their interactions with the simulator and testing their understanding.

## Progress
[//]: <> (Briefly state your progress so far, as a bulleted list)
#### Backend:

- Implemented core logic of the protocol with a Python real time event simulator.
- Allowed the simulation in Python to accept and behave correctly with differentinput parameters.
- Computation of various statistics of the simulation computed in the Python component for eventual plotting.
- Unit and integration test coverage for the simulation component.
- Exposed the simulation logic via a REST api, allowing for frontend integration.
- Unified command line interface for performing both a local simulation and for starting a web worker serving simulation requests via the REST api.

#### Frontend:

- Added an internal interface for constructing visual animations, allowing fast-forward, rollback, pause, start, restart and arbitrary jump between cycles.
- Built two core visualization logic systems in the frontend, one focusing on the global state of the network and the other more sensor centric.
- Interviewed 4 different participants, on how they interacted with the different visualizations, asking questions on difficulties and preferences.
- Ended up choosing the simulation that focuses on the global state, and discarding the other one.
- Added parsing of the simulation events from the backend component, along with web form for changing the input parameters.
- Presented the logs of the simulation in a default summarised way, as well as a more verbose one depending on user choice.
- Rendering of the simulation stat graphs in the frontend, as well as summary statistics.
- Stylized the whole webpage such that is it visually pleasing.
- Added multipage logic for "About", "Protocol Information", "Instructions" allowing users to inform themselves more about the project and protocol.

## Problems and risks
### Problems
[//]: <> (What problems have you had so far, that have held up the project?)
- Initial explanation of the protocol was hard to understand, due to the limited literature available. After more careful reading and discussion with the supervisor, managed to get a good grasp of the logic.
- Initial visual simulation was via the Python manim video rendering framework, however due to the very high rendering times (around 5 minutes for a short and simple animation) such logic was scrapped in order to be rebuilt in native, web-served, Javascript.
- Setting up the animation queue to allow fast-forward, rollback, pause, start, restart and arbitrary jump between cycles, was hard especially given that the tool provided for rendering by the browser are primitive. After multiple iterations and extensive testing, managed to get working logic and internal guidelines for scheduling animations.
- Initially, two different prototypes of the visual simulation were built in Javascript, that had different codebases and were hard to maintain, however after performing the interviews, the best version was chosen and the other version discountinued development.

### Risks
[//]: <> (What problems do you foresee in the future and how will you mitigate them?)
- Difficulty in recruiting undergraduate participants for testing the improvement in understanding of the simulator. **Mitigation:** eventual settling to a lower number of participants.
- Project does not aid in helping people understand the protocol more, hence failing in its main aim. **Mitigation:** project can still be useful for quickly testing and gathering statistics about different protocol scenarios, effectively targeting more advanced users.
- Slow simulation computation on server due to Python based logic. **Mitigation:** Unlikely, but adopt vertical scalability (more powerful instances) to allow faster processing.
- Deployment costs might be high. **Mitigation:** Unlikely, but use alternative services or option for deployment, i.e. Heroku, PythonAnywhere or even self-hosting.

## Plan
[//]: <> (Time plan, in roughly weekly to monthly blocks, up until submission week)
Due to the imbalance of courses in the 2nd semester, with semester 2 having more courses than semester 1, (i.e. 3 vs 5) the plan reflects that more work has been done in the 1st semester.

Week 0 (9th December - 15th December):
**Deliverable:** Status report, eventual bug fixing and implementation of the rrm cycle length based on message transmission.

Week 1 (15th December - 21th December):
**Deliverable:** More unit and integration tests for the backend, as well as tests for the frontend.

Week 2 (22th December - 28th December):
**Deliverable:** Gunicorn config file for production server start, Docker script for containerizing the application such that it can deployed.

Week 3 (29th December - 4th January):
**Deliverable:** Initial manual prototype deployment on google cloud via google cloud run, CI/CD for creation of the docker artifacts, such that the cloud can point to them.

Week 4 (5th January - 11th January):
**Deliverable:** Implementation of terraform code for automated setting up of the environment, test that deployments are successful from GitHub.

Week 5 (12th January - 18th January):
**Deliverable:** Develop interview script.

Week 6 (19th January - 25th January):
**Deliverable:** Review of interview script with the supervisor, ethical approval and start of the participant recruiting.

Week 7 (26th January - 1st February):
**Deliverable:** Initial outline of the dissertation.

Week 8 (2nd February - 8th February):
**Deliverable:** Proceed with interviews and confirm outline with supervisor.

Week 9 (9th February - 15th February):
**Deliverable:** Proceed with more interviews.

Week 10 (16th February - 22nd February):
**Deliverable:** Collection of results and drawing of conclusions.

Week 11/12/13/14/15 (23rd February - 28th March):
**Deliverable:** Dissertation write up
