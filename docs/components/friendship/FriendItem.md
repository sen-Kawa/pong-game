# ft_transcendence
## Friendship
### Friend Item
The [FriendItem.vue](../../../frontend/src/components/user/friends/FriendItem.vue) component represents an item displaying a friend's details and actions for managing such friend. This component is designed to render the friend's name along with buttons for checking the status and removing the friend. It integrates with an [API](../../../frontend/src/components/user/friends/api/friendship.api.ts) for removing friends.  

### Usage
To use the `FriendItem` component, follow these steps:

1. **Import the component:**  
Import the `FriendItem` component in your Vue.js file:
```
<script>
import FriendItem from './path-to/FriendItem.vue';

export default {
  components: {
    FriendItem
  },
}
</script>
```
2. **Include the component in the template:**  
Place the `FriendItem` component within your template and provide the `friend` prop:
```
<template>
  <div>
    <FriendItem :friend="friend" @friendRemoved="handleFriendRemoved" />
  </div>
</template>
```

### Component Structure
The `FriendItem` component consists of the following elements:  

1. **Friend Details:**  
Displays the friend's name within a `div` with the class `friend-item`.  

2. **Status Button:**  
Renders a button labeled "Status" for checking the friend's status.  

3. **Remove Friend Button:**  
Renders a button labeled "Remove Friend". When clicked, it triggers the removal of the friend from the friend list.  

### Props
The `FriendItem` component accepts the following prop:  

**friend:**
- Type: Object  
- Required: Yes  
- Description: An object representing the friend's details.  

### Events
The `FriendItem` component emits the following event:

**friendRemoved:**  
- Triggered when a friend is succesfully removed.  
- Usage: `<FriendItem :friend="friend" @friendRemoved="handleFriendRemoved" />`

### Methods
The `FriendItem` component defines the following method:

**removeFriend:**
- Initiates the process of removing the friend.  
- Triggered when the "Remove Friend" button is clicked.  
- Side effects: Calls the `deleteFriend` API function to remove the friend. Emits the `friendRemoved` event upon success.  

### Dependencies
- Friend deletion functionality is provided by the `deleteFriend` function from the [friendship API](../../../frontend/src/components/user/friends/api/friendship.api.ts) module.  
