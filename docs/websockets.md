# ft_transcendence
## Websockets
This Document explains how to use the centralized Websocket Modules. The authorization is handled 'automagically'.
### Frontend
The frontend-module lives at src/sockets/sockets.ts. You can import and use the exported socket. To listen to events use the 'on' method. Messages can be sent with the 'emit' method. Other functionalites mentioned in the [documentation](https://socket.io/docs/v4/client-api/).

### Backend
In the backend messages can be listened to by creating a [Gateway](https://docs.nestjs.com/websockets/gateways) and sent by using the socket provided by the injectable SocketService class which provides a [raw socket](https://socket.io/docs/v4/server-api/) that can be used. 
