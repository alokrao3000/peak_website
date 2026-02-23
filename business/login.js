document.addEventListener('DOMContentLoaded', function() {
  var signinForm = document.getElementById('signin-form');
  var signupForm = document.getElementById('signup-form');
  var signinError = document.getElementById('signin-error');
  var signupError = document.getElementById('signup-error');
  var tabs = document.querySelectorAll('.auth-tabs .tab');
  var forms = document.querySelectorAll('.auth-form');

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }

  function setTab(tabName) {
    tabs.forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });
    forms.forEach(function(f) {
      f.classList.toggle('active', f.id === tabName + '-form');
    });
    showError(signinError, '');
    showError(signupError, '');
  }

  tabs.forEach(function(t) {
    t.addEventListener('click', function() {
      setTab(this.getAttribute('data-tab'));
    });
  });

  signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    showError(signinError, '');
    var email = document.getElementById('signin-email').value.trim();
    var password = document.getElementById('signin-password').value;
    if (!email || !password) {
      showError(signinError, 'Please enter email and password.');
      return;
    }
    var btn = signinForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    window.PeakAuth.signIn(email, password)
      .then(function() {
        window.location.href = 'dashboard.html';
      })
      .catch(function(err) {
        showError(signinError, err.message || 'Sign in failed.');
        btn.disabled = false;
        btn.textContent = 'Log in';
      });
  });

  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    showError(signupError, '');
    var email = document.getElementById('signup-email').value.trim();
    var password = document.getElementById('signup-password').value;
    if (!email || !password) {
      showError(signupError, 'Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      showError(signupError, 'Password must be at least 6 characters.');
      return;
    }
    var btn = signupForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating account…';
    window.PeakAuth.signUp(email, password)
      .then(function() {
        window.location.href = 'dashboard.html';
      })
      .catch(function(err) {
        showError(signupError, err.message || 'Sign up failed.');
        btn.disabled = false;
        btn.textContent = 'Create account';
      });
  });

  // If already logged in, redirect to dashboard
  window.PeakAuth.onAuthStateChanged(function(user) {
    if (user) window.location.href = 'dashboard.html';
  });
});
