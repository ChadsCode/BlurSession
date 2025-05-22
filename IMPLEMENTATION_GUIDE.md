# BlurSession Implementation Guide

This comprehensive guide provides detailed instructions for implementing the BlurSession privacy solution in your web application. It covers everything from basic setup to advanced customization and troubleshooting.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Installation](#installation)
3. [Basic Setup](#basic-setup)
4. [Advanced Configuration](#advanced-configuration)
5. [Integration with Existing Projects](#integration-with-existing-projects)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Performance Considerations](#performance-considerations)
10. [Security Considerations](#security-considerations)

## Project Structure

The BlurSession package consists of the following files:

```
blursession/
├── index.html                  # Example implementation
├── demo.html                   # Interactive demo
├── download.html               # Download page
├── css/
│   ├── styles.css              # Main stylesheet
│   └── blur-effect.css         # Blur effect styles
├── js/
│   └── blursession.js          # Core functionality
├── README.md                   # Documentation
├── LICENSE.md                  # MIT License
└── IMPLEMENTATION_GUIDE.md     # This guide
```

## Installation

### Option 1: GitHub Repository

1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/username/blursession.git
   ```
   
2. Integrate the necessary files into your project

### Option 2: Direct Download

1. Download the full package from the project website
2. Extract the files to your project directory
3. Include the necessary files in your HTML

### Option 3: Manual File Integration

1. Create the necessary directories in your project structure
2. Copy the CSS and JS files to their respective directories
3. Include them in your HTML file

## Basic Setup

### 1. Include Required Files

Add these lines to the `<head>` section of your HTML:

```html
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/blur-effect.css">
<script src="js/blursession.js" defer></script>
```

### 2. HTML Structure

Ensure your HTML has the following structure:

```html
<!-- Your header (will remain visible) -->
<header>
  <!-- Your header content -->
</header>

<!-- The main content area that will be blurred -->
<main id="sensitive-area">
  <!-- Your sensitive content here -->
</main>

<!-- Your footer (will remain visible) -->
<footer>
  <!-- Your footer content -->
</footer>

<!-- Required overlay element -->
<div id="blur-overlay"></div>

<!-- Optional status banner -->
<div id="status-banner">
  <div class="container">
    <span id="status-message">BlurSession active - content is protected</span>
  </div>
</div>
```

### 3. Test the Default Configuration

With the files included and HTML structure in place, the default configuration will:
- Blur the content after 5 seconds of inactivity
- Remove the blur when the user moves the mouse or touches the screen
- Show a status banner when blur is activated/deactivated

## Advanced Configuration

### Customizing Inactivity Time

Add this script after including the blursession.js file:

```html
<script>
  // Change inactivity time to 10 seconds
  window.addEventListener('DOMContentLoaded', () => {
    window.blurSession.setInactivityTime(10); // in seconds
  });
</script>
```

### Customizing Blur Intensity

```html
<script>
  // Change blur intensity to 15 pixels
  window.addEventListener('DOMContentLoaded', () => {
    window.blurSession.setBlurIntensity(15);
  });
</script>
```

### Full Custom Configuration

```html
<script>
  window.addEventListener('DOMContentLoaded', () => {
    // Replace the default instance with a custom one
    window.blurSession = new BlurSession({
      inactivityTime: 8000,       // 8 seconds
      blurIntensity: 12,          // 12px blur
      sensitiveSelector: '#my-custom-area',
      showStatusBanner: false,    // Don't show status banner
      onActivate: function() {
        console.log('Blur activated');
        // You can add custom actions here
      },
      onDeactivate: function() {
        console.log('Blur deactivated');
        // You can add custom actions here
      },
      debug: true                 // Enable debugging output
    });
  });
</script>
```

## Integration with Existing Projects

### React Integration

```jsx
import { useEffect } from 'react';

// Import styles in your main application file
import './css/styles.css';
import './css/blur-effect.css';

function App() {
  useEffect(() => {
    // Import blursession.js dynamically
    const script = document.createElement('script');
    script.src = '/js/blursession.js';
    script.async = true;
    script.onload = () => {
      // Initialize BlurSession after script loads
      window.blurSession = new window.BlurSession({
        inactivityTime: 10000,
        sensitiveSelector: '#app-sensitive-content'
      });
    };
    document.body.appendChild(script);
    
    // Add the required overlay elements
    const overlay = document.createElement('div');
    overlay.id = 'blur-overlay';
    document.body.appendChild(overlay);
    
    const statusBanner = document.createElement('div');
    statusBanner.id = 'status-banner';
    statusBanner.innerHTML = `
      <div class="container">
        <span id="status-message">BlurSession active - content is protected</span>
      </div>
    `;
    document.body.appendChild(statusBanner);
    
    // Cleanup on component unmount
    return () => {
      if (window.blurSession) {
        window.blurSession.cleanup();
      }
      document.body.removeChild(script);
      document.body.removeChild(overlay);
      document.body.removeChild(statusBanner);
    };
  }, []);
  
  return (
    <div className="App">
      <header>
        {/* Header content */}
      </header>
      
      <main id="app-sensitive-content">
        {/* Your sensitive content here */}
      </main>
      
      <footer>
        {/* Footer content */}
      </footer>
    </div>
  );
}

export default App;
```

### WordPress Integration

1. Upload the CSS and JS files to your theme directory
2. Add this to your theme's functions.php:

```php
function enqueue_blur_session() {
    wp_enqueue_style('blur-session-styles', get_template_directory_uri() . '/css/styles.css');
    wp_enqueue_style('blur-session-blur', get_template_directory_uri() . '/css/blur-effect.css');
    wp_enqueue_script('blur-session-js', get_template_directory_uri() . '/js/blursession.js', array(), '1.0.1', true);
}
add_action('wp_enqueue_scripts', 'enqueue_blur_session');
```

3. Make sure your theme has the blur overlay element:

```php
function add_blur_overlay() {
    echo '<div id="blur-overlay"></div>';
    echo '<div id="status-banner"><div class="container"><span id="status-message">BlurSession active</span></div></div>';
}
add_action('wp_footer', 'add_blur_overlay');
```

4. Optional: Add configuration to your footer

```php
function add_blur_session_config() {
    ?>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (window.blurSession) {
                window.blurSession.setInactivityTime(10);
                window.blurSession.setBlurIntensity(8);
            }
        });
    </script>
    <?php
}
add_action('wp_footer', 'add_blur_session_config', 100);
```

### PHP Application Integration

For a PHP application:

1. Upload the CSS and JS files to your project directory
2. Include the files in your PHP template:

```php
<head>
    <!-- Other head elements -->
    <link rel="stylesheet" href="<?php echo $base_url; ?>/css/styles.css">
    <link rel="stylesheet" href="<?php echo $base_url; ?>/css/blur-effect.css">
    <script src="<?php echo $base_url; ?>/js/blursession.js" defer></script>
</head>
```

3. Add the overlay elements at the end of your body:

```php
<div id="blur-overlay"></div>
<div id="status-banner">
  <div class="container">
    <span id="status-message">BlurSession active - content is protected</span>
  </div>
</div>
```

### ASP.NET Integration

For an ASP.NET application:

1. Add the CSS and JS files to your project
2. Add the CSS references in your layout file:

```html
<link rel="stylesheet" href="~/css/styles.css">
<link rel="stylesheet" href="~/css/blur-effect.css">
<script src="~/js/blursession.js" defer></script>
```

3. Add the overlay elements to your layout file:

```html
<div id="blur-overlay"></div>
<div id="status-banner">
  <div class="container">
    <span id="status-message">BlurSession active - content is protected</span>
  </div>
</div>
```

## Customization

### Custom CSS

You can override the default styles by adding your own CSS after including the blur-effect.css file:

```css
/* Custom blur intensity */
#blur-overlay {
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  background-color: rgba(255, 255, 255, 0.2);
}

/* Custom status banner */
#status-banner {
  background-color: #34495e;
  color: white;
  font-weight: bold;
}

/* Custom message in blur overlay */
#blur-overlay::after {
  content: 'Custom message here';
  font-size: 1.2rem;
  /* Other styles */
}
```

### Custom Protected Areas

You can specify multiple areas to protect:

```javascript
// Protect multiple areas
document.addEventListener('DOMContentLoaded', () => {
  const areas = [
    document.querySelector('#account-info'),
    document.querySelector('#payment-details'),
    document.querySelector('#personal-data')
  ];
  
  // Add a class to all areas you want to protect
  areas.forEach(area => {
    if (area) area.classList.add('protected-area');
  });
  
  // Initialize with custom selector
  window.blurSession = new BlurSession({
    sensitiveSelector: '.protected-area'
  });
});
```

### Custom Callbacks

You can use the callback functions to integrate with other systems:

```javascript
window.blurSession = new BlurSession({
  onActivate: function() {
    // Log the event
    if (window.analytics) {
      window.analytics.track('privacy_mode_activated');
    }
    
    // Pause any video playback
    const videos = document.querySelectorAll('video');
    videos.forEach(video => video.pause());
    
    // Notify other components
    document.dispatchEvent(new CustomEvent('blur-activated'));
  },
  onDeactivate: function() {
    // Log the deactivation
    if (window.analytics) {
      window.analytics.track('privacy_mode_deactivated');
    }
    
    // Notify other components
    document.dispatchEvent(new CustomEvent('blur-deactivated'));
  }
});
```

## Troubleshooting

### Blur Not Working

If the blur effect isn't working:

1. Check if `backdrop-filter` is supported in the user's browser
2. Verify that the overlay element exists in the DOM
3. Make sure the z-index values are correct for your layout
4. Check console for any JavaScript errors

Solution:

```javascript
// Add this to check for browser support
document.addEventListener('DOMContentLoaded', () => {
  const isBackdropFilterSupported = CSS.supports('backdrop-filter', 'blur(10px)') ||
                                  CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
  
  if (!isBackdropFilterSupported) {
    console.warn('Backdrop filter not supported - falling back to opacity');
    
    // Add a class to use an alternative approach
    document.body.classList.add('no-backdrop-filter');
    
    // Apply a fallback style in your CSS
    // .no-backdrop-filter #blur-overlay { background-color: rgba(255,255,255,0.9); }
  }
});
```

### Content Still Visible on Older Browsers

For older browsers, add this CSS fallback:

```css
/* Fallback for browsers without backdrop-filter support */
.no-backdrop-filter #blur-overlay {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background-color: rgba(245, 245, 245, 0.9); /* Opaque background as fallback */
}
```

### Mobile Touch Events Not Responding

If mobile touch events aren't properly removing the blur:

```javascript
// Enhance mobile touch handling
document.addEventListener('DOMContentLoaded', () => {
  // Add explicit touch handlers for mobile
  document.addEventListener('touchstart', () => {
    if (window.blurSession && window.blurSession.isBlurActive) {
      window.blurSession.deactivateBlur();
    }
  }, { passive: true });
  
  // Improve touch target sizes
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.style.minHeight = '44px'; // Apple's recommended minimum
  });
});
```

### Status Banner Not Appearing

If the status banner doesn't appear:

1. Verify the elements exist in the DOM
2. Check that the CSS styles are correctly loaded
3. Ensure the showStatusBanner option is set to true

```javascript
// Debug the status banner
const statusBanner = document.getElementById('status-banner');
const statusMessage = document.getElementById('status-message');

if (!statusBanner) {
  console.error('Status banner element not found');
} else if (!statusMessage) {
  console.error('Status message element not found');
} else {
  console.log('Status elements found');
  
  // Force display for testing
  statusBanner.classList.add('active');
  statusMessage.textContent = 'Testing status banner';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusBanner.classList.remove('active');
  }, 3000);
}
```

## Best Practices

1. **Security Consideration**: Remember that this is a visual privacy layer only. Always implement proper session timeouts and server-side security measures.

2. **Performance**: The blur effect can be resource-intensive on older devices. Consider using a lower blur intensity (5-8px) for better performance on low-end devices.

3. **Testing**: Test the implementation on various devices and browsers to ensure consistent behavior, especially on mobile devices and tablets.

4. **Accessibility**: Make sure the blur effect doesn't interfere with screen readers and that the status messages are accessible to all users.

5. **User Experience**: Set an appropriate inactivity time for your application - too short can frustrate users, too long reduces security benefits.

6. **Brand Consistency**: Adjust the colors and styling to match your brand's visual identity for a seamless experience.

7. **Clear Indicators**: Always provide clear visual and textual indicators when blur mode is active or inactive.

8. **Touch Optimization**: Ensure touch targets are at least 44×44 pixels for mobile users.

9. **Documentation**: Keep this documentation available for any future developers working on the project.

10. **Data Protection**: Consider how this tool fits into your broader strategy for protecting personal identifiable information.

## Performance Considerations

To optimize performance, especially on mobile devices:

1. **Appropriate Blur Intensity**: Use a moderate blur value (5-8px) that provides security without excessive GPU usage.

2. **Debounce Events**: The implementation already includes debouncing, but if you customize it, make sure to maintain this pattern.

3. **Minimize DOM Queries**: Cache DOM elements rather than repeatedly querying them.

4. **Reduce Animation Complexity**: Keep CSS transitions simple for smoother performance.

5. **Monitor Performance**: Use browser dev tools to check for any performance issues during blur transitions.

## Security Considerations

While BlurSession provides excellent visual privacy protection, it should be part of a comprehensive security strategy:

1. **Session Timeouts**: Implement proper server-side session timeouts to fully log users out after extended inactivity.

2. **Multi-Factor Authentication**: For highly sensitive applications, consider requiring re-authentication after extended inactivity.

3. **Data Minimization**: Only display sensitive information when absolutely necessary.

4. **Security Headers**: Implement appropriate security headers in your application.

5. **Regular Security Audits**: Regularly audit your application for security vulnerabilities.

## Need Help?

For further assistance, questions or issues:

- Refer to the README.md file for additional information
- Check the example implementations in the provided HTML files
- Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/chadwigington/) with any questions about implementing BlurSession

---

© 2025 Chad Wigington | MIT License