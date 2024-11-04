## Interview protocol

### Before observation
- Introduction of interviewer
- Research briefing: Exploratory study to gather information on how different participants interacts with a network protocol simulator. Each participant will be asked some general questions, quickly brought up to speed about the protocol, observed on how they interact with the two different versions of the simulator then a semi-structured interview will follow. The interviewer will ask questions about the participants experiences, challenges and suggestions for the finished product. Wireframes will also be shown to gather feedback on possible design variations. The interviewer will take notes during the observation, audio record the interview and screen record the interactions with the simulator. Participation is optional, identity will be kept anonymous, consent can be withdrawn at any time and if so all data recorded will be destroyed. The research will entirely take place on the interviewer computer, no material is necessary
- Ask for consent of participation
- Set up voice recorder
- Note down date, time and place

### Interview
#### General section:
- How old are you?
- Where are you from?
- Have you completed our degree?
- What is your degree in?

#### Explanation of the protocol
In the next stage you will see different designs about a network protocol simulator. The network protocol in question is named ctrl-mac and is concerned with solving collisions during radio communications in a network. The network is made up of a gateway and a variable number of sensors, and there is a limited number of channels that the sensors can use to transmit their messages, which is typically much lower than the number of sensors. As an example think of 25 sensors and 6 request slots, meaning that only 6 radio communications can happen at the same time.
Here's how it works:
- The gateway sends a message, called rrm, to all sensors, which contains the status of the 6 slots, indicating if each slot was free (no sensor picked it), had no contention (only 1 sensor picked it) and had a contention (more than 1 sensor picked it)
- The sensors then receive this rrm message and randomly pick a slot, by sending a transmission request message to the gateway, indicating the slot they chose. This is basically booking that slot, similar to a restaurant reservation (we assume that due to the small size and quick transmission time, this message does not collide).
- Once a certain time has passed, the gateway analyses all the transmission request messages received and sends another rrm containing the status of the slots: free, no contention or contention.
- The sensors read the rrm message received and if their picked slot had no collision then they actually send their data on the requested separate channel. If instead their slot had a collision, they backoff for a certain number of periods based on some computation of the number of the other collisions before trying asking for a slot again. This is basically to avoid network congestion.
- The cycle then repeat

#### Start of the demo
- Was the protocol clear to you? Any questions? (Answer whichever questions come up)
- I'm going to show you one of the visualization for this protocol. Feel free to play around with the animation. Also feel free to ask any questions if you have any doubts. Let me know once you are done.

#### Interview on demo
- Did the animation help you to understand the protocol better?
- Was there any aspects of it you found confusing?
- How easy is it to follow the sequence of events?
- Which aspects of the protocol were easier to understand through the visualization?
- What additional information would you like to see displayed?
- Were there any moments where you felt lost or confused?
- How could it be improved?

#### Showing wireframes for the respective demo
Now I'm going to show you different design variations for the animation you just saw.

- Which one do you think is more visually appealing?
- What do you think about the layout of information?
- What would you change about the user interface?

#### Repeat the demo section for the 2nd animation to be shown.

#### After both demos have been shown
- What was your overall experience with both versions of the simulator?
- Which version would you prefer to use for learning purposes?
- Do you have any other suggestions for improving the simulator?


#### After Interview
- Debriefing: Interviewer says that the interview is finished, asks if they have any questions, thanks the participant, and provides contact information for future questions.
