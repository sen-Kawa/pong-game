# ft_transcendence
## Friendship
### Friends List
The [FriendsList.vue](../../../frontend/src/components/user/friends/FriendsList.vue) component is responsible for displaying a list of friends along with options for finding new friends. It utilizes child components such as [FriendItem](../../../frontend/src/components/user/friends/FriendItem.vue) and [FindUser](../../../frontend/src/components/user/friends/FindUser.vue) to manage friend interactions.  

### Usage
To use the `FriendsList` component, follow these steps:

1. **Import the component:**  
Import the `FriendsList` component in your Vue.js file:
```
<script>
import FriendsList from './path-to/FriendsList.vue';

export default {
  components: {
    FriendsList
  },
}
</script>
```
2. **Include the component in the template:**  
Place the `FriendsList` component within your template and provide the `friendName` prop:
```
<template>
  <div>
    <FriendsList />
  </div>
</template>
```

### Component Structure
The `FriendsList` component consists of the following elements:  
1. **Friend List Header:**  
Displays a header with the text "Friends".  

2. **Friend Items:**  
Renders a list of [FriendItem](../../../frontend/src/components/user/friends/FriendItem.vue) components for each friend. The [FriendItem](../../../frontend/src/components/user/friends/FriendItem.vue) components display friend details and allow friends to be removed.  

3. **No Friends Message:**  
If the length of the `friend` array is zero it displays a message indicating that the user doesn't have friend's yet.  

4. **Find User Button:**  
Renders a [ButtonApp](../../../frontend/src/components/ButtonApp.vue) component with the label "Find User". Clicking this button toggles the display of the [FindUser](../../../frontend/src/components/user/friends/FindUser.vue) component.  

5. **FindUser Component:**  
Displays the [FindUser](../../../frontend/src/components/user/friends/FindUser.vue) component when the "Find User" button is clicked. Allows the user to search for other existing users and add them as friends.  

### Data Properties
The `FriendsList` component has the following data properties:  

**showFindUser:**
- Type: Boolean  
- Description: Tracks whether the FindUser component should be shown or hidden.  

**friends:**
- Type: Array  
- Description: Stores the list of friends to be displayed.  

### Components
The `FriendsList` component utilizes the following child components:

**Friend:**  
- Description: Displays friend details and options for managing friend.  
- Usage: Rendered dynamically for each friend in the list.  

**FindUser:**  
- Description: Allows user to find other users and add them as friends.  
- Usage: Displayed when the "Find User" button is clicked.  

**ButtonApp:**  
- Description: A custom button component used for actions.  
- Usage: Used for the "Find User" button, toggle functionality.  

### Methods
The `FriendsList` component defines the following methods:

**toggleShowFindUser:**  
Toggles the visibility of the `FindUser` component.  

**onFriendAdded:**  
Called when a new friend is added.  
Usage: Updates the friend list after a friend is added using the `FindUser` component.  

**onFriendRemoved:**  
Called when a friend is removed.  
Usage: Updates the friend list after a friend is removed using the `FriendItem` component.  

**fetchFriendList:**  
Fetches the list of friends from the API.  
Usage: Called when the component is mounted or when friend-related actions are performed.  

### Dependencies
- This component relies on child components such as [ButtonApp](../../../frontend/src/components/ButtonApp.vue), [FriendItem](../../../frontend/src/components/user/friends/FriendItem.vue) and [FindUser](../../../frontend/src/components/user/friends/FindUser.vue).  
- Friend list retrieval is provided by the `getFriendList` function from the [friendship API](../../../frontend/src/components/user/friends/api/friendship.api.ts) module.  
