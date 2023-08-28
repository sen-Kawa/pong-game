# ft_transcendence
## Two Factor Authentication
### TwoFactor
The [TwoFactor.vue] (../../frontend/src/components/user/Validate2FA.vue) component is for switching on or off the Two Factor Authentication for a User.  

### Usage
Import the `TwoFactor` component in your Vue.js file like any other Component.


### Component Structure
The `TwoFactor` component consists of the following sections:  
1. **A Button:**  to toggel the Two Factor Authentication
2. **QR-Code with input Mask:** for scanning and validating your Auth App 


### Methods
The `TwoFactor` component defines the following method:

**change2fa:**
- Initiates the change on 2FA or not.    
- Side effects: If turned on it triggers the validation process of your App.
- Side effects: If turned off it triggers the removal of the Two Factor Authentication.

**verify2FA:**
- Initiates the validation of your app with the Database.  


### Notes
- The Validation is done via an QR-Code to scan with your Smartphone

### Dependencies
- needs the auth Store for activating the Two Factor Authentication in the backend
