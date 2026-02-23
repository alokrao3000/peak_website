/**
 * Shared Firebase Auth helpers for business pages.
 * Assumes firebase-config.js and Firebase SDK are loaded first.
 */
(function() {
  window.PeakAuth = {
    getAuth: function() {
      return typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null;
    },

    getCurrentUser: function() {
      const auth = this.getAuth();
      return auth ? auth.currentUser : null;
    },

    onAuthStateChanged: function(callback) {
      const auth = this.getAuth();
      if (auth) auth.onAuthStateChanged(callback);
      else callback(null);
    },

    signUp: function(email, password) {
      const auth = this.getAuth();
      if (!auth) return Promise.reject(new Error('Firebase not loaded'));
      return auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          var user = userCredential.user;
          if (user && typeof firebase !== 'undefined' && firebase.firestore) {
            var db = firebase.firestore();
            return db.collection('businessUsers').doc(user.uid).set({
              uid: user.uid,
              email: user.email || email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).then(function() {
              return userCredential;
            });
          }
          return userCredential;
        });
    },

    signIn: function(email, password) {
      const auth = this.getAuth();
      if (!auth) return Promise.reject(new Error('Firebase not loaded'));
      return auth.signInWithEmailAndPassword(email, password);
    },

    signOut: function() {
      const auth = this.getAuth();
      if (auth) return auth.signOut();
      return Promise.resolve();
    }
  };
})();
