# ft_transcendence
## Friendship
### Friends List
The [FriendsList.vue](../../frontend/src/components/user/friends/FriendsList.vue) component is responsible for displaying a list of friends along with options for finding new friends. It utilizes child components such as [FriendItem](../../frontend/src/components/user/friends/FriendItem.vue) and [FindUser](../../frontend/src/components/user/friends/FindUser.vue) to manage friend interactions.  

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
Renders a list of [FriendItem](../../frontend/src/components/user/friends/FriendItem.vue) components for each friend. The [FriendItem](../../frontend/src/components/user/friends/FriendItem.vue) components display friend details and allow friends to be removed.  
3. **No Friends Message:**  
If the length of the `friend` array is zero it displays a message indicating that the user doesn't have friend's yet.  
4. **Find User Button:**  
Renders a [ButtonC](../../frontend/src/components/Button.vue) component with the label "Find User". Clicking this button toggles the display of the [FindUser](../../frontend/src/components/user/friends/FindUser.vue) component.  
5. **FindUser Component:**  
Displays the [FindUser](../../frontend/src/components/user/friends/FindUser.vue) component when the "Find User" button is clicked. Allows the user to search for other existing users and add them as friends.  

### Data Properties
The `FriendsList` component has the following data properties:  
**showFindUser:**
- Type: Boolean  
- Description: .  

**friends:**
- Type: Array  
- Description: .  

### Components
The `FriendsList` component utilizes the following child components:

**Friend:**  
- Description: .  
- Usage: 

**FindUser:**  
- Description: .  
- Usage: 

**ButtonC:**  
- Description: .  
- Usage: 

### Methods
The `FriendsList` component defines the following methods:

**toggleShowFindUser:**
**onFriendAdded:**
**onFriendRemoved:**
**fetchFriendList:**

### Dependencies
- This component relies on child components such as [ButtonC](../../frontend/src/components/Button.vue), [FriendItem](../../frontend/src/components/user/friends/FriendItem.vue) and [FindUser](../../frontend/src/components/user/friends/FindUser.vue).  
- Friend list retrieval is provided by the `getFriendList` function from the [friendship API](../../frontend/src/components/user/friends/api/friendship.api.ts) module.  
