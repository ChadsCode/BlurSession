/**
 * BlurSession.js
 * Enterprise-grade privacy solution for web applications
 * 
 * BlurSession.com
 * Created by: Chad Wigington
 * Version: 1.0.1
 * 
 * Features:
 * - Automatically blurs sensitive content after a period of inactivity
 * - Configurable timeout and blur intensity
 * - Responsive to user interaction (mouse, keyboard, touch)
 * - Mobile-friendly with touch event support
 * - Compatible with modern browsers and PHP 8.2+
 * - Enterprise-ready implementation
 * - Zero dependencies - pure vanilla JavaScript
 */

/**
 * BlurSession - Main class to handle privacy protection
 * @class
 */
class BlurSession {
  /**
   * Create a new BlurSession instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default configuration
    this.config = {
      // Time in milliseconds before content is blurred (default: 5 seconds)
      inactivityTime: options.inactivityTime || 5000,
      
      // Selector for the area to protect (default: #sensitive-area)
      sensitiveSelector: options.sensitiveSelector || '#sensitive-area',
      
      // Selector for the blur overlay element
      overlaySelector: options.overlaySelector || '#blur-overlay',
      
      // Blur intensity (pixels)
      blurIntensity: options.blurIntensity || 10,
      
      // Status banner message element
      statusMessageSelector: options.statusMessageSelector || '#status-message',
      
      // Whether to show the status banner
      showStatusBanner: options.showStatusBanner !== undefined ? options.showStatusBanner : true,
      
      // Callback when privacy mode activates
      onActivate: options.onActivate || null,
      
      // Callback when privacy mode deactivates
      onDeactivate: options.onDeactivate || null,
      
      // Debug mode
      debug: options.debug || false
    };

    // Internal properties
    this.inactivityTimer = null;
    this.isBlurActive = false;
    this.lastActivity = Date.now();
    this.isInitialized = false;
    
    // DOM elements
    this.sensitiveArea = null;
    this.overlay = null;
    this.statusMessage = null;
    
    // Initialize only after the DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the BlurSession
   * @private
   */
  init() {
    if (this.isInitialized) return;
    
    // Get DOM elements
    this.sensitiveArea = document.querySelector(this.config.sensitiveSelector);
    this.overlay = document.querySelector(this.config.overlaySelector);
    this.statusMessage = document.querySelector(this.config.statusMessageSelector);
    
    // Validate required elements
    if (!this.sensitiveArea) {
      this.logError(`Sensitive area not found: ${this.config.sensitiveSelector}`);
      return;
    }
    
    if (!this.overlay) {
      this.logError(`Overlay element not found: ${this.config.overlaySelector}`);
      return;
    }
    
    // Set blur intensity
    this.setBlurIntensity(this.config.blurIntensity);
    
    // Bind event listeners
    this.bindEvents();
    
    // Start monitoring for inactivity
    this.startActivityMonitoring();
    
    // Setup demo controls if they exist
    this.setupDemoControls();
    
    this.isInitialized = true;
    this.log('BlurSession initialized successfully');
  }

  /**
   * Bind all necessary event listeners
   * @private
   */
  bindEvents() {
    // Activity events - any user interaction resets the timer
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'touchstart', 'touchmove', 'touchend', 'scroll', 'click'
    ];
    
    // Add listeners for each activity event
    activityEvents.forEach(eventType => {
      document.addEventListener(eventType, () => this.handleUserActivity(), { passive: true });
    });
    
    // Special handling for the overlay to remove blur on interaction
    this.overlay.addEventListener('click', () => this.deactivateBlur());
    this.overlay.addEventListener('touchend', () => this.deactivateBlur(), { passive: true });
    
    // Listen for visibility change to handle tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.activateBlur(); // Blur when tab is not visible
      } else {
        this.handleUserActivity(); // Reset timer when tab becomes visible
      }
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Start monitoring for user inactivity
   * @private
   */
  startActivityMonitoring() {
    // Initial state - assume user is active
    this.lastActivity = Date.now();
    
    // Start the inactivity check interval (checks every second)
    this.inactivityInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastActivity;
      
      // If user has been inactive longer than the threshold, activate privacy
      if (elapsed >= this.config.inactivityTime && !this.isBlurActive) {
        this.activateBlur();
      }
    }, 1000);
  }

  /**
   * Handle user activity events
   * @private
   */
  handleUserActivity() {
    // Update the last activity timestamp
    this.lastActivity = Date.now();
    
    // If blur is active, deactivate it
    if (this.isBlurActive) {
      this.deactivateBlur();
    }
    
    // If we're on mobile, make sure we remove any touch event lag
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      // Force a small delay on mobile to ensure touch events are processed smoothly
      setTimeout(() => {
        // This additional check helps prevent unintentional deactivation
        if (this.isBlurActive) {
          this.deactivateBlur();
        }
      }, 50);
    }
  }

  /**
   * Activate blur mode (blur content)
   * @public
   */
  activateBlur() {
    if (this.isBlurActive) return;
    
    // Add blur-active class to body
    document.body.classList.add('blur-active');
    document.body.classList.remove('blur-inactive');
    
    // Update status message if it exists
    if (this.statusMessage && this.config.showStatusBanner) {
      this.statusMessage.textContent = 'BlurSession active - content is protected';
      document.getElementById('status-banner').classList.add('active');
    }
    
    this.isBlurActive = true;
    
    // Call the onActivate callback if provided
    if (typeof this.config.onActivate === 'function') {
      this.config.onActivate();
    }
    
    this.log('Blur mode activated');
  }

  /**
   * Deactivate blur mode (remove blur)
   * @public
   */
  deactivateBlur() {
    if (!this.isBlurActive) return;
    
    // Remove blur-active class from body
    document.body.classList.remove('blur-active');
    document.body.classList.add('blur-inactive');
    
    // Update status message if it exists
    if (this.statusMessage && this.config.showStatusBanner) {
      this.statusMessage.textContent = 'BlurSession inactive - content is visible';
      document.getElementById('status-banner').classList.add('active');
      
      // Hide the status banner after 2 seconds (increased from 1 second)
      setTimeout(() => {
        document.getElementById('status-banner').classList.remove('active');
        // Also remove the inactive class after the timeout
        document.body.classList.remove('blur-inactive');
      }, 2000);
    }
    
    this.isBlurActive = false;
    
    // Call the onDeactivate callback if provided
    if (typeof this.config.onDeactivate === 'function') {
      this.config.onDeactivate();
    }
    
    this.log('Blur mode deactivated');
    
    // Reset last activity time
    this.lastActivity = Date.now();
  }

  /**
   * Set the inactivity time (in seconds)
   * @param {number} seconds - Number of seconds of inactivity before blur
   * @public
   */
  setInactivityTime(seconds) {
    const milliseconds = Math.max(1, seconds) * 1000;
    this.config.inactivityTime = milliseconds;
    this.log(`Inactivity time set to ${seconds} seconds`);
    
    // Reset the last activity time
    this.lastActivity = Date.now();
    
    return this;
  }

  /**
   * Set the blur intensity
   * @param {number} pixels - Blur intensity in pixels
   * @public
   */
  setBlurIntensity(pixels) {
    const intensity = Math.max(1, Math.min(20, pixels));
    this.config.blurIntensity = intensity;
    
    // Update the overlay blur filter
    this.overlay.style.backdropFilter = `blur(${intensity}px)`;
    this.overlay.style.webkitBackdropFilter = `blur(${intensity}px)`;
    
    this.log(`Blur intensity set to ${intensity}px`);
    return this;
  }

  /**
   * Setup the demo controls if they exist in the DOM
   * @private
   */
  setupDemoControls() {
    // Timer control
    const timerInput = document.getElementById('inactivity-timer');
    const applyTimerBtn = document.getElementById('apply-timer');
    
    if (timerInput && applyTimerBtn) {
      // Set initial value
      timerInput.value = this.config.inactivityTime / 1000;
      
      // Apply button event
      applyTimerBtn.addEventListener('click', () => {
        const seconds = parseInt(timerInput.value, 10);
        if (!isNaN(seconds) && seconds > 0) {
          this.setInactivityTime(seconds);
        }
      });
    }
    
    // Blur intensity control
    const blurInput = document.getElementById('blur-intensity');
    const applyBlurBtn = document.getElementById('apply-blur');
    
    if (blurInput && applyBlurBtn) {
      // Set initial value
      blurInput.value = this.config.blurIntensity;
      
      // Apply button event
      applyBlurBtn.addEventListener('click', () => {
        const intensity = parseInt(blurInput.value, 10);
        if (!isNaN(intensity)) {
          this.setBlurIntensity(intensity);
        }
      });
    }
    
    // Force blur button
    const forceBlurBtn = document.getElementById('force-blur');
    if (forceBlurBtn) {
      forceBlurBtn.addEventListener('click', () => {
        this.activateBlur();
      });
    }
    
    // Clear blur button
    const clearBlurBtn = document.getElementById('clear-blur');
    if (clearBlurBtn) {
      clearBlurBtn.addEventListener('click', () => {
        this.deactivateBlur();
      });
    }
  }

  /**
   * Clean up event listeners and timers
   * @public
   */
  cleanup() {
    // Clear the inactivity interval
    if (this.inactivityInterval) {
      clearInterval(this.inactivityInterval);
    }
    
    this.log('BlurSession cleaned up');
  }

  /**
   * Log a message to the console (if debug mode is enabled)
   * @param {string} message - Message to log
   * @private
   */
  log(message) {
    if (this.config.debug) {
      console.log(`[BlurSession] ${message}`);
    }
  }

  /**
   * Log an error message to the console
   * @param {string} message - Error message to log
   * @private
   */
  logError(message) {
    console.error(`[BlurSession] ERROR: ${message}`);
  }
}

// Create a global instance of BlurSession
window.blurSession = new BlurSession({
  // Default configuration
  inactivityTime: 5000,  // 5 seconds
  blurIntensity: 10,     // 10px blur
  debug: false           // Set to true to enable debug logging
});

// Export the class for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlurSession;
}