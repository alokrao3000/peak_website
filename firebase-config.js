/**
 * Firebase config for business pages (login.html, dashboard.html, create-event.html).
 * Get these values from Firebase Console > Project settings > General > Your apps.
 * If you have a Web app, click it and copy the config; otherwise create a Web app first.
 */
(function() {
  var firebaseConfig = {
    apiKey: "AIzaSyBV5wDXdCQsoQ-_wheLs970YZdOqJCNKMI",
    authDomain: "moves-d63b1.firebaseapp.com",
    projectId: "moves-d63b1",
    storageBucket: "moves-d63b1.firebasestorage.app",
    messagingSenderId: "195768536655",
    appId: "1:195768536655:ios:d4b0cb88806bb29164a43a"
  };

  // Initialize Firebase (compat SDK)
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
  }
})();
