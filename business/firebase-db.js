
/**
 * Firestore helpers for business dashboard and events.
 * Collections: venues (read), events (read/write with ownerId), events/{id}/attendees (subcollection).
 */
(function() {
  function getFirestore() {
    return typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null;
  }

  window.PeakDb = {
    getVenues: function() {
      const db = getFirestore();
      if (!db) return Promise.resolve([]);
      return db.collection('venues').get().then(function(snap) {
        return snap.docs.map(function(d) {
          return { id: d.id, ...d.data() };
        });
      });
    },

    getEventsForUser: function(uid) {
      const db = getFirestore();
      if (!db || !uid) return Promise.resolve([]);
      // Firestore: ensure composite index exists for events (ownerId + date) or create via console link in error
      return db.collection('events')
        .where('ownerId', '==', uid)
        .orderBy('date', 'desc')
        .get()
        .then(function(snap) {
          return snap.docs.map(function(d) {
            return { id: d.id, ...d.data() };
          });
        });
    },

    createEvent: function(uid, data) {
      const db = getFirestore();
      if (!db || !uid) return Promise.reject(new Error('Firestore or user not available'));
      var eventData = {
        ownerId: uid,
        venueId: data.venueId,
        date: data.date,
        priceGirls: Number(data.priceGirls) || 0,
        priceBoys: Number(data.priceBoys) || 0,
        total: 0,
        revenue: 0,
        venueName: data.venueName || '',
        venueImage: data.venueImage || '',
        addr: data.addr || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      return db.collection('events').add(eventData).then(function(ref) {
        return ref.id;
      });
    }
  };
})();
