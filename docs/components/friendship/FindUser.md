# ft_transcendence
## Friendship
### Find User
The [FindUser.vue](../../../frontend/src/components/user/friends/FindUser.vue) component is designed to facilitate the process of searching for a user and displaying details. This component integrates with the [AddFriend.vue](../../../frontend/src/components/user/friends/AddFriend.vue) component and relies on an [API](../../../frontend/src/components/user/friends/api/friendship.api.ts) for user search functionality. 

### Usage
To use the `FindUser` component, follow this steps:

1. **Import the component:**  
Import the `FindUser` component in your Vue.js file:
```
<script>
import FindUser from './path-to/FindUser.vue';

export default {
  components: {
    FindUser
  },
}
</script>
```
2. **Include the component in the template:**  
Place the `FindUser` component within your template:
```
<template>
  <div>
    <FindUser @onFriendAdded="handleFriendAdded" />
  </div>
</template>
```

### Component Structure
The `FindUser` component consists of the following sections:  
1. **User Search Form:**  
The component displays an input field where users can enter the name or username of the user they want to find. Upon submitting the form, the component triggers a search operation.  

2. **Search Results:**  
If the search return results, the component displays user details in a list. It also integrates the `AddFriend` component, allowing users to add the found user as a friend.  

3. **Status Messages:**  
The component provides status messages to inform users about the search outcome. Success and error messages are displayed based on the search result.

### Props
The `FindUser` component does not accept any props.

### Events
The `FindUser` component emits the following event:

**onFriendAdded:**  
- Triggered when a friend is succesfully added using the `AddFriend` component.  
- Usage: `<FindUser @onFriendAdded="handleFriendAdded" />`

### Methods
The `FindUser` component defines the following methods:

**findUser:**
- Initiates a user search based on the entered name.  
- Triggered when the search form is submitted.  
- Updates the `foundUser` array and displays appropiate status messages.  

**onFriendAdded:**
- Emits the `onFriendAdded` event when a friend is succesfully added.  
- Triggered when a friend is added using the `AddFriend` component.  

### Notes
- If no name is entered before initiating a search, an alert is shown to prompt the user.  
- Search results are displayed for a limited time. The message and results are cleared after a set time.  

### Dependencies
- This component relies on the [AddFriend](../../../frontend/src/components/user/friends/AddFriend.vue) component for adding friends.  
- The user search functionality is provided by the `postFindUser` function from the [friendship API](../../../frontend/src/components/user/friends/api/friendship.api.ts) module.  
