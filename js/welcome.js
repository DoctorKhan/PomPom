// Welcome Page Functionality
// Handles user input, session setup, and navigation from welcome to main app

(function() {
  'use strict';

  // Initialize welcome page functionality
  function initWelcome() {
    try {
      const userInput = document.getElementById('user-name-setup-input');
      const teamInput = document.getElementById('session-name-input');
      const startBtn = document.getElementById('start-session-btn');
      const welcomePage = document.getElementById('welcome-page');
      const sessionPage = document.getElementById('session-page');
      const sessionHeaderName = document.getElementById('session-header-name');
      const toastEl = document.getElementById('toast');

      // Simple toast notification function
      function showSimpleToast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.remove('hidden');
        toastEl.classList.add('show', 'fade-in');
        setTimeout(function() { 
          toastEl.classList.add('hidden');
          toastEl.classList.remove('show', 'fade-in');
        }, 3000);
      }

      // Handle Enter key press on inputs
      function onEnter(e) {
        if (e && e.key === 'Enter') {
          e.preventDefault();
          if (startBtn && typeof startBtn.click === 'function') {
            startBtn.click();
          }
          // Fallback if module click handler isn't running (e.g., jsdom tests)
          try {
            const nameVal = (userInput && userInput.value || '').trim();
            const teamVal = (teamInput && teamInput.value || '').trim();
            
            if (!nameVal) { 
              showSimpleToast('Please enter your name'); 
              return; 
            }
            
            if (welcomePage && sessionPage) {
              welcomePage.classList.add('hidden');
              sessionPage.classList.remove('hidden');
              sessionPage.classList.add('fade-in');
            }
            
            if (sessionHeaderName) {
              sessionHeaderName.textContent = 'Team: ' + (teamVal || 'Solo Session');
            }

            // Store values in localStorage for future use
            try {
              localStorage.setItem('pompom_username', nameVal);
              if (teamVal) {
                localStorage.setItem('pompom_team_name', teamVal);
              }
            } catch (e) {
              // Ignore localStorage errors
            }

            // Trigger custom event for app initialization
            const event = new CustomEvent('welcomeComplete', {
              detail: { userName: nameVal, teamName: teamVal }
            });
            document.dispatchEvent(event);

          } catch (err) {
            console.error('Error in welcome form submission:', err);
          }
        }
      }

      // Enhanced input validation and feedback
      function validateInput(input, minLength = 1) {
        const value = input.value.trim();
        const isValid = value.length >= minLength;
        
        if (isValid) {
          input.classList.remove('shake');
          input.classList.add('scale-in');
        } else {
          input.classList.add('shake');
          setTimeout(() => input.classList.remove('shake'), 500);
        }
        
        return isValid;
      }

      // Auto-populate user name from localStorage
      function autoPopulateUserName() {
        try {
          const storedUserName = localStorage.getItem('pompom_username');
          if (storedUserName && userInput && !userInput.value) {
            userInput.value = storedUserName;
            userInput.classList.add('fade-in');
          }
        } catch (e) {
          // Ignore localStorage errors in some environments
        }
      }

      // Auto-populate team name from localStorage
      function autoPopulateTeamName() {
        try {
          const storedTeamName = localStorage.getItem('pompom_team_name');
          if (storedTeamName && teamInput && !teamInput.value) {
            teamInput.value = storedTeamName;
            teamInput.classList.add('fade-in');
          }
        } catch (e) {
          // Ignore localStorage errors in some environments
        }
      }

      // Enhanced start session function
      function startSession() {
        const nameVal = (userInput && userInput.value || '').trim();
        const teamVal = (teamInput && teamInput.value || '').trim();

        if (!validateInput(userInput)) {
          showSimpleToast('Please enter your name to continue');
          userInput.focus();
          return false;
        }

        // Show loading state
        if (startBtn) {
          startBtn.disabled = true;
          startBtn.innerHTML = '<span class="spinner"></span> Starting...';
        }

        // Simulate brief loading for better UX
        setTimeout(() => {
          try {
            if (welcomePage && sessionPage) {
              welcomePage.classList.add('slide-out-left');
              setTimeout(() => {
                welcomePage.classList.add('hidden');
                sessionPage.classList.remove('hidden');
                sessionPage.classList.add('slide-in-right');
              }, 300);
            }

            if (sessionHeaderName) {
              sessionHeaderName.textContent = teamVal ? `Team: ${teamVal}` : 'Solo Session';
            }

            // Store values
            try {
              localStorage.setItem('pompom_username', nameVal);
              if (teamVal) {
                localStorage.setItem('pompom_team_name', teamVal);
              }
            } catch (e) {
              // Ignore localStorage errors
            }

            // Trigger app initialization
            const event = new CustomEvent('welcomeComplete', {
              detail: { userName: nameVal, teamName: teamVal }
            });
            document.dispatchEvent(event);

            showSimpleToast(`Welcome, ${nameVal}! 🎯`);

          } catch (err) {
            console.error('Error starting session:', err);
            showSimpleToast('Error starting session. Please try again.');
          } finally {
            // Reset button state
            if (startBtn) {
              startBtn.disabled = false;
              startBtn.innerHTML = 'Start Session';
            }
          }
        }, 500);

        return true;
      }

      // Add event listeners
      if (userInput) {
        userInput.addEventListener('keydown', onEnter);
        userInput.addEventListener('blur', () => validateInput(userInput));
      }
      
      if (teamInput) {
        teamInput.addEventListener('keydown', onEnter);
      }

      if (startBtn) {
        startBtn.addEventListener('click', startSession);
      }

      // Auto-populate on load
      autoPopulateUserName();
      autoPopulateTeamName();

      // Add welcome page animations
      const welcomeElements = document.querySelectorAll('#welcome-page .stagger-item');
      welcomeElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('fade-in');
      });

    } catch (err) {
      console.error('Error initializing welcome page:', err);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWelcome);
  } else {
    initWelcome();
  }

  // Export for testing
  if (typeof window !== 'undefined') {
    window.WelcomeModule = {
      init: initWelcome
    };
  }

})();
