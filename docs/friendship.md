# ft_transcendence
## Friendship
### Components:
[FindUser](../frontend/src/components/user/friends/FindUser.vue)  
- Has a form element which prompts for a *name* of type text.  
- On submit `findUser()` is called which calls `postFindUser(name)`.  
- Displays a message depending on the return, *found* or *not found*, This message has a timeout of 5 seconds.  
- Displays user details of user found and an `AddFriend` component. This message has a timeout of 10 seconds.  

[AddFriend](../frontend/src/components/user/friends/AddFriend.vue)  
- Has a button element, which toggles text and colour.  
- On click it calls `addFriend()` which calls `postAddFriend(friendName)` method from api.  
- Displays a message depending on the return. This message has a timeout of 5 seconds.  
- Emits `friendAdded` on success.

[FriendItem](../frontend/src/components/user/friends/FriendItem.vue)  
[FriendsList](../frontend/src/components/user/friends/FriendsList.vue)  

### Api:
-[Friendship Api](../frontend/src/components/user/friends/api/friendship.api.ts)
