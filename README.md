# Welcome to your FoodGuard  app 👋
# FoodGuard - Food Expiry & Management App

## Overview
FoodGuard is a mobile application designed to help users track the expiration dates of their food items and minimize waste. Additionally, the app provides location-based suggestions for nearby food banks where users can donate excess food.

## Features
- **User Authentication:** Sign up, log in, and log out securely.
- **Food Tracking:** Add food items with expiration dates.
- **Notifications:** Receive reminders before food items expire.
- **Food Bank Suggestions:** Uses location services to suggest nearby food banks for donations.
- **Map Integration:** Displays a map with food banks based on the user's location.
- **API Integration:** Securely fetch and manage food data via an API.

## Getting Started
### Prerequisites
- Node.js installed on your system.
- React Native development environment set up.
- An API running at `http://192.168.2.56:8080`.
- Device location services enabled for food bank suggestions.
- Grant the app permission to access your camera


### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/igorganch/FoodGuard.git
   cd FoodGuard
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```

## User Guide
### Authentication
1. **Sign Up:**
   - Open the app and click "Sign Up."
   - Enter your name, email, and password.
   - Submit the form to create an account.
2. **Login:**
   - Enter your email and password.
   - Tap "Login" to access your dashboard.
3. **Logout:**
   - Tap the logout .

### Managing Food Items
1. **Add a Food Item:**
   - Click "Add Food Item."
   - Enter the name, category, and expiration date.
   - Tap "Save."
2. **View Food Items:**
   - Navigate to the "My Food" section.
   - See a list of all stored food items.
3. **Edit or Delete:**
   - Tap on an item to edit or remove it.

### Finding Nearby Food Banks
1. **Enable Location Services:**
   - Grant the app permission to access your location.
2. **View Suggested Food Banks:**
   - Navigate to the "Food Donation" section.
   - See a list of nearby food banks and their addresses.
3. **View on Map:**
   - Tap on a food bank to open its location in a map view.

### API Endpoints Used
- **Login:** `POST /api/auth/login`
- **Sign Up:** `POST /api/auth/register`
- **Fetch Products:** `GET /api/products/?userId=1`
- **Get Nearby Food Banks:** `GET /api/foodbanks?lat={latitude}&lng={longitude}`

## Troubleshooting
- **Cannot Log In?** Ensure the API server is running and the correct credentials are used.
- **Location Not Detected?** Ensure that location services are enabled on your device.
- **App Crashes?** Check console logs and ensure dependencies are up to date.

## License
---------
