document.addEventListener('DOMContentLoaded', function() {
  var venuesGrid = document.getElementById('venues-grid');
  var venuesLoading = document.getElementById('venues-loading');
  var venuesError = document.getElementById('venues-error');
  var stepVenue = document.getElementById('step-venue');
  var eventForm = document.getElementById('event-form');
  var selectedVenueEl = document.getElementById('selected-venue');
  var btnBackVenue = document.getElementById('btn-back-venue');
  var createError = document.getElementById('create-error');

  var selectedVenue = null;

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }

  window.PeakAuth.onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    loadVenues();
  });

  function loadVenues() {
    venuesLoading.style.display = 'block';
    venuesError.style.display = 'none';
    venuesGrid.querySelectorAll('.venue-card').forEach(function(el) { el.remove(); });

    window.PeakDb.getVenues().then(function(venues) {
      venuesLoading.style.display = 'none';
      if (!venues || venues.length === 0) {
        venuesError.textContent = 'No venues found. Add venues in Firebase to get started.';
        venuesError.style.display = 'block';
        return;
      }
      venues.forEach(function(v) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'venue-card';
        card.setAttribute('data-venue-id', v.id);
        card.innerHTML =
          '<div class="venue-card-image" style="background-image:url(\'' + (v.image || v.venueImage || '') + '\')"></div>' +
          '<div class="venue-card-body">' +
            '<h3>' + (v.name || v.venueName || 'Venue') + '</h3>' +
            (v.address || v.addr ? '<p>' + (v.address || v.addr) + '</p>' : '') +
          '</div>';
        card.addEventListener('click', function() {
          selectVenue({
            id: v.id,
            name: v.name || v.venueName,
            image: v.image || v.venueImage,
            addr: v.address || v.addr
          });
        });
        venuesGrid.appendChild(card);
      });
    }).catch(function(err) {
      venuesLoading.style.display = 'none';
      venuesError.textContent = err.message || 'Failed to load venues.';
      venuesError.style.display = 'block';
    });
  }

  function selectVenue(venue) {
    selectedVenue = venue;
    document.getElementById('venue-id').value = venue.id || '';
    document.getElementById('venue-name').value = venue.name || '';
    document.getElementById('venue-image').value = venue.image || '';
    document.getElementById('venue-addr').value = venue.addr || '';
    selectedVenueEl.innerHTML =
      '<div class="selected-venue-image" style="background-image:url(\'' + (venue.image || '') + '\')"></div>' +
      '<div><strong>' + (venue.name || 'Venue') + '</strong>' +
      (venue.addr ? '<br><span class="addr">' + venue.addr + '</span>' : '') + '</div>';
    stepVenue.style.display = 'none';
    eventForm.style.display = 'block';
    var dateInput = document.getElementById('event-date');
    if (dateInput && !dateInput.value) {
      var d = new Date();
      d.setDate(d.getDate() + 1);
      dateInput.value = d.toISOString().slice(0, 10);
    }
  }

  btnBackVenue.addEventListener('click', function() {
    selectedVenue = null;
    eventForm.style.display = 'none';
    stepVenue.style.display = 'block';
    eventForm.reset();
    document.getElementById('venue-id').value = '';
    document.getElementById('venue-name').value = '';
    document.getElementById('venue-image').value = '';
    document.getElementById('venue-addr').value = '';
    selectedVenueEl.innerHTML = '';
  });

  eventForm.addEventListener('submit', function(e) {
    e.preventDefault();
    showError(createError, '');
    var user = window.PeakAuth.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    var dateVal = document.getElementById('event-date').value;
    var dateToStore = dateVal ? new Date(dateVal + 'T00:00:00') : null;
    var data = {
      venueId: document.getElementById('venue-id').value,
      venueName: document.getElementById('venue-name').value,
      venueImage: document.getElementById('venue-image').value,
      addr: document.getElementById('venue-addr').value,
      date: dateToStore,
      priceGirls: document.getElementById('price-girls').value,
      priceBoys: document.getElementById('price-boys').value
    };
    var btn = eventForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating…';
    window.PeakDb.createEvent(user.uid, data)
      .then(function() {
        window.location.href = 'dashboard.html';
      })
      .catch(function(err) {
        showError(createError, err.message || 'Failed to create event.');
        btn.disabled = false;
        btn.textContent = 'Create event';
      });
  });
});
