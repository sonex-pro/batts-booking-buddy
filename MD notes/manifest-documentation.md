# Web App Manifest Documentation for Batt's Booking Buddy

## Overview

The `manifest.json` file enables Progressive Web App (PWA) functionality for the Batt's Booking Buddy website. It allows users to add the site to their mobile home screen with a proper app icon instead of showing the browser's logo alongside the site icon.

## How It Works

1. When a user visits the website, the browser reads the manifest file (linked in the HTML)
2. The manifest provides information about the app name, icons, colors, and display mode
3. When a user adds the site to their home screen, the browser uses this information to create an app-like experience

## Key Components

- **name**: The full name of the application shown in app stores and install prompts
- **short_name**: A shorter name used on home screens where space is limited
- **description**: Explains what the app does (shown in install prompts)
- **start_url**: The URL that loads when the app is launched from the home screen
- **display**: How the app should display (standalone removes browser UI elements)
- **background_color**: The color shown during app launch
- **theme_color**: The color of the browser UI elements when the app is running
- **icons**: Different sized icons for various devices and screen resolutions
  - The 32x32 icon is used for favicon/browser tabs
  - The 180x180 icon is used by iOS devices
  - The 192x192 icon is the standard for Android devices
  - The 512x512 icon is used for high-resolution displays
  - The "maskable" purpose allows the icon to be displayed in different shapes on Android

## Implementation in HTML

The manifest file works in conjunction with the following tags in the HTML head section of each page:

```html
<!-- Link to manifest file -->
<link rel="manifest" href="manifest.json">

<!-- iOS specific meta tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Batt's Booking">
<link rel="apple-touch-icon" href="images/webclip.png">

<!-- Theme color for browser UI -->
<meta name="theme-color" content="#0e43ca">
```

## Benefits

1. **Better User Experience**: Users can access your site directly from their home screen
2. **App-like Feel**: The standalone display mode removes browser UI elements
3. **Brand Recognition**: Your logo appears cleanly on the user's device
4. **Offline Capabilities**: Can be extended with service workers for offline functionality
5. **Improved Engagement**: Home screen presence increases return visits

## Testing

To test if the manifest is working properly:
1. Visit the website on a mobile device
2. Add the site to your home screen
3. Verify that the correct icon appears without browser branding
4. Launch the app from the home screen and check that it loads properly
