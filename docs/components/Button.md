# ft_transcendence
## Components
### Button App
The [ButtonApp.vue](../../frontend/src/components/ButtonApp.vue) component is a reusable button component that allows customization of text content and background colour. It emits an event when clicked, providing a simple way to handle user interactions.  

### Usage
To use the `ButtonApp` component, follow these steps:

1. **Import the component:**  
Import the `ButtonApp` component in your Vue.js file:
```
<script>
import ButtonApp from './path-to/ButtonApp.vue';

export default {
  components: {
    ButtonApp
  },
}
</script>
```
2. **Include the component in the template:**  
Place the `ButtonApp` component within your template and provide the text and colour props:
```
<template>
  <div>
    <ButtonApp :text="atext" :color="acolor" @btn-click="handleButtonClick" />
  </div>
</template>
```

### Component Structure
The `ButtonApp` component consists of a single HTML button element that can be customized with text and background colour. When clicked, the button emits a custom event.  

### Props
The `ButtonApp` component accepts the following props:  

**text:**
- Type: String  
- Description: The text content to be displayed on the button.  

**color:**
- Type: String  
- Description: The background colour of the button.  

### Events
The `ButtonApp` component emits the following event:

**btn-click:**  
- Triggered when the button is clicked.  
- Usage: `<ButtonApp :text="atext" :color="acolor" @btn-click="handleButtonClick" />`

### Methods
The `ButtonApp` component defines the following method:

**onClick:**
- Emits the `btn-click` event when the button is clicked.  
- Usage: Automatically triggered when the button is clicked.  

### Notes
- The event emitted by the button can be used to handle user interactions in the parent component.  
