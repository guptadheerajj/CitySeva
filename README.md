# CitySeva

## Project Structure

```
CITYSEVA/
├── src/
│   ├── assets/                 # Static assets (images, icons, etc.)
│   │   ├── logo.png
│   │   ├── signin_google_neutral.png
│   │   ├── email.svg
│   │   ├── password.svg
│   │   └── ...
│   ├── pages/                  # Separate folder for different pages/views
│   │   ├── landing/            # Landing page and its tabs
│   │   │   ├── template.html   # Landing page HTML template
│   │   │   ├── index.js        # Entry point for landing page
│   │   │   ├── home.js         # Home tab logic
│   │   │   ├── about.js        # About tab logic
│   │   │   ├── features.js     # Features tab logic
│   │   │   ├── contact.js      # Contact tab logic
│   │   │   ├── login.js        # Login tab logic
│   │   │   ├── register.js     # Register tab logic
│   │   │   └── style.css       # Styles for landing page
│   │   └── dashboard/          # Dashboard page
│   │       ├── dashboard.html  # HTML template for the dashboard
│   │       ├── dashboard.js    # Logic for the dashboard
│   │       └── dashboard.css   # Styles specific to the dashboard
│   ├── firebase.js             # Firebase configuration
│   └── main.js                 # Optional: Main entry point to decide which page to load
├── dist/                       # Output folder
├── package.json                # Dependencies
├── package-lock.json           # Dependency lock file
├── webpack.config.js           # Webpack configuration
└── .gitignore                  # Git ignore file
```
