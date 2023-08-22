# ft_transcendence
## Friendship
### Add Friend
The [AddFriend.vue](../../../frontend/src/components/user/friends/AddFriend.vue) component is designed to provide a button interface for adding friends. This component uses the [ButtonApp](../../../frontend/src/components/ButtonApp.vue) component for the button display and integrates with an [API](../../../frontend/src/components/user/friends/api/friendship.api.ts) for adding friends.  

### Usage
To use the `AddFriend` component, follow these steps:

1. **Import the component:**  
Import the `AddFriend` component in your Vue.js file:
```
<script>
import AddFriend from './path-to/AddFriend.vue';

export default {
  components: {
    AddFriend
  },
}
</script>
```
2. **Include the component in the template:**  
Place the `AddFriend` component within your template and provide the `friendName` prop:
```
<template>
  <div>
    <AddFriend :friendName="friendName" @friendAdded="handleFriendAdded" />
  </div>
</template>
```

### Component Structure
The `AddFriend` component consists of the following sections:  
1. **Button:**  
The component renders a button that allows users to add a friend. The button's text and colour change based on whether the friend has been added or not.

2. **Status Messages:**  
The component provides status messages to inform users about the outcome of the friend addition operation. Success and error messages are displayed based on the API response.  

### Props
The `AddFriend` component accepts the following prop:  

**friendName:**
- Type: String  
- Required: Yes  
- Description: The name of the friend to be added.  

### Events
The `AddFriend` component emits the following event:

**friendAdded:**  
- Triggered when a friend is succesfully added.  
- Usage: `<AddFriend :friendName="friendName" @friendAdded="handleFriendAdded" />`

### Methods
The `AddFriend` component defines the following method:

**addFriend:**
- Initiates the friend addition process.  
- Triggered when the "Add Friend" button is clicked.  
- Side effects: Updates the `isAdded` status, displays appropriate status messages and emits the `friendAdded` event upon success.  

### Notes
- The component uses the `ButtonApp` component for rendering the button. The button text and color are determined by the `isAdded` status.  
- Messages about the friend addition outcome are displayed temporarily and then cleared after a set time.  

### Dependencies
- This component relies on the [ButtonApp](../../../frontend/src/components/ButtonApp.vue) component for rendering the button.  
- Friend addition functionality is provided by the `postAddFriend` function from the [friendship API](../../../frontend/src/components/user/friends/api/friendship.api.ts) module.  
