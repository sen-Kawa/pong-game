# ft_transcendence
## SPA for playing online multiplayer pong

[Installation instructions](docs/install.md)  
[Technical Documentation](docs/documentation.md)  
[Subject](docs/transcendence.pdf)  

### Overview
- **Backend:** NestJs
- **Frontend:** Vue.js
- **Database:** PostgreSQL

### Extended Commit Comment For the Chat
Added delay to popup, placed all Endpoints behind JWT, All frontend fetch()-es now making use of browser cookies.


IMPORTANT NOTE: Despite the fact that all frontend fetch()-es from the Chat now makes use of browser cookies, the chat's frontend still doesn't work with the current JWT interceptor yet. This means when the JWT token/cookies needs a refresh, the chat will start malfunctioning until you click on a link on the webpage that works with JWT interceptor in order to refresh.

NOTE about the createUser() function in users.service.ts
So, I found a way to extract the base64 image encoding without changing too much of the previous code.

### Additional Comment
I believe all the basic requirements for the Chats part has been met. Will be switching to 'maintenance' and optimazations tasks henceforths. Anyone who wants to contribute, improve or add suggestions to the Chat can do so freely.

BLOCKING 
There is an API endpoint that handles blocking/unblocking at the Chat level. 
The idea behind the current 'Blocking' implementation is to have a Block at the Chat level,
and a Super Block at the Friendship level. Thus, when a user is blocked inside the chat, the block is only enforced within the Chat App. External Blockings initiated at the Friendship level can be extended into the Chat level by calling the Chat Block/Unblocking API Endpoint.

SETTING UP A MATCH THROUGH THE CHAT INTERFACE
At the moment, there is a 'dead' INVITE-THIS-USER-TO-PLAY-A-GAME when you click on the user's profile inside the Chat, and select the drop down located on the top right. Ideally the link should call a Matchmaking API endpoint implemented by the Team member working on the Matchmaking Aspect of the project. Ideally this Matchmaking API endpoint should take the user Id of the Inviter and Invitee, then implement whatever logic required to set up a match between these two users.

Additions/Corrections/Improvements/ are welcome.


