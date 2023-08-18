# ft_transcendence
## Friendship
### Add Friend
The [AddFriend.vue](../../frontend/src/components/user/friends/AddFriend.vue) component is designed to provide a button interface for adding friends. This component uses the [ButtonC](../../frontend/src/components/Button.vue) component for the button display and integrates with an [API](../../frontend/src/components/user/friends/api/friendship.api.ts) for adding friends.  

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
2. **Status Messages:**  
The component provides status messages to inform users about the  

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
The `AddFriend` component defines the following methods:

**addFriend:**
- Initiates the friend addition process.  
- Triggered when .....  

### Notes

### Dependencies
- This component relies on the [ButtonC](../../frontend/src/components/Button.vue) component for rendering the button.  
- Friend addition functionality is provided by the `postAddFriend` function from the [friendship API](../../frontend/src/components/user/friends/api/friendship.api.ts) module.  
