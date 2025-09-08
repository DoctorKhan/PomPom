// PWA Installation and Management
// Handles service worker registration, app installation, and PWA features

(function() {
  'use strict';

  let deferredPrompt = null;
  let isInstalled = false;

  // Check if app is installed
  function checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled = true;
      return true;
    }
    
    // Check if running as PWA on mobile
    if (window.navigator.standalone === true) {
      isInstalled = true;
      return true;
    }
    
    return false;
  }

  // Register service worker
  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              showUpdateAvailableNotification();
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // Show update available notification
  function showUpdateAvailableNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner glass-card';
    updateBanner.innerHTML = `
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔄</span>
          <div>
            <div class="font-semibold text-white">Update Available</div>
            <div class="text-sm text-gray-300">A new version of PomPom is ready</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="update-later-btn" class="btn-secondary btn-sm">Later</button>
          <button id="update-now-btn" class="btn-primary btn-sm">Update</button>
        </div>
      </div>
    `;
    
    updateBanner.style.cssText = `
      position: fixed;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      z-index: 1000;
      border-radius: 1rem;
      animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(updateBanner);
    
    // Handle update actions
    document.getElementById('update-now-btn').addEventListener('click', () => {
      updateServiceWorker();
      updateBanner.remove();
    });
    
    document.getElementById('update-later-btn').addEventListener('click', () => {
      updateBanner.remove();
    });
  }

  // Update service worker
  function updateServiceWorker() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Handle beforeinstallprompt event
  function handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event for later use
      deferredPrompt = e;
      
      // Show custom install button
      showInstallButton();
    });
  }

  // Show install button
  function showInstallButton() {
    let installBtn = document.getElementById('pwa-install-btn');
    
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.className = 'btn-primary-teal btn-sm fixed bottom-4 right-4 z-50 shadow-xl';
      installBtn.innerHTML = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Install App
      `;
      
      document.body.appendChild(installBtn);
      installBtn.classList.add('slide-in-right');
    }
    
    installBtn.style.display = 'flex';
    installBtn.addEventListener('click', installApp);
  }

  // Hide install button
  function hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  // Install the app
  async function installApp() {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available');
      return;
    }
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt outcome:', outcome);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        hideInstallButton();
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      deferredPrompt = null;
      
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  }

  // Handle app installed event
  function handleAppInstalled() {
    window.addEventListener('appinstalled', (e) => {
      console.log('PWA: App was installed successfully');
      isInstalled = true;
      hideInstallButton();
      
      // Show success message
      if (typeof window.showToast === 'function') {
        window.showToast('PomPom installed successfully! 🎉');
      }
      
      // Track installation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed'
        });
      }
    });
  }

  // Handle URL parameters for shortcuts
  function handleShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const view = urlParams.get('view');
    
    if (mode && typeof window.TimerModule !== 'undefined') {
      setTimeout(() => {
        if (mode === 'focus') {
          window.TimerModule.setMode('pomodoro25');
        } else if (mode === 'break') {
          window.TimerModule.setMode('shortBreak');
        }
      }, 1000);
    }
    
    if (view && typeof window.UIModule !== 'undefined') {
      setTimeout(() => {
        if (view === 'tasks') {
          window.UIModule.switchToTasksView();
        }
      }, 1000);
    }
  }

  // Setup offline detection
  function setupOfflineDetection() {
    function updateOnlineStatus() {
      const isOnline = navigator.onLine;
      const statusIndicator = document.getElementById('online-status');
      
      if (!statusIndicator) {
        const indicator = document.createElement('div');
        indicator.id = 'online-status';
        indicator.className = 'fixed top-4 left-4 z-50 px-3 py-1 rounded-full text-sm font-medium';
        document.body.appendChild(indicator);
      }
      
      const indicator = document.getElementById('online-status');
      
      if (isOnline) {
        indicator.textContent = '';
        indicator.style.display = 'none';
      } else {
        indicator.textContent = '📡 Offline';
        indicator.className = 'fixed top-4 left-4 z-50 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-black';
        indicator.style.display = 'block';
      }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  // Initialize PWA features
  async function initPWA() {
    console.log('PWA: Initializing...');
    
    // Check if already installed
    isInstalled = checkIfInstalled();
    
    // Register service worker
    await registerServiceWorker();
    
    // Setup install prompt handling
    if (!isInstalled) {
      handleInstallPrompt();
    }
    
    // Handle app installed event
    handleAppInstalled();
    
    // Handle URL shortcuts
    handleShortcuts();
    
    // Setup offline detection
    setupOfflineDetection();
    
    console.log('PWA: Initialized successfully');
  }

  // Export PWA module
  if (typeof window !== 'undefined') {
    window.PWAModule = {
      init: initPWA,
      install: installApp,
      isInstalled: () => isInstalled,
      registerServiceWorker,
      updateServiceWorker
    };
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWA);
  } else {
    initPWA();
  }

})();
