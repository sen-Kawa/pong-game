# ft_transcendence
## Two Factor Authentication
### Validate2FA
The [Validate2FA.vue] (../../frontend/src/components/user/Validate2FA.vue) component is for the 2nd Step of logging in. It provides and input mask for the code and send it to the backend for validation.   

### Usage
Import the `Validate2FA` component in your Vue.js file like any other Component


### Component Structure
The `Validate2FA` component consists of the following sections:  
1. **Input Mask:**  For the Code from your Atuh app
2. **Submit Button:**  To submit the Code

### Methods
The `Validate2FA` component defines the following method:

**onSubmit:**
- Initiates the validation process on the backend.  
- Effects: If the code is valid you get redirect to the User Preference Page.  
- Effects: If the code is in valid, an error is shown and you stay on the page.  
### Notes
- If you take to longer then the Access Token is valid, the Component redirect you to the Home page, with an alert shown
- If something went wront in the backend an alert is shown and you get redirect to the Home Page

### Dependencies
- the Component calls functions of the auth store, as its part of the login process
