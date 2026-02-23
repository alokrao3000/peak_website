document.addEventListener('DOMContentLoaded', function() {
  var userEmailEl = document.getElementById('user-email');
  var btnCreate = document.getElementById('btn-create-event');
  var btnLogout = document.getElementById('btn-logout');
  var analyticsSection = document.getElementById('analytics-section');
  var onboardingTooltip = document.getElementById('onboarding-tooltip');
  var tooltipPointer = document.getElementById('tooltip-pointer');
  var dismissOnboarding = document.getElementById('dismiss-onboarding');
  var eventsList = document.getElementById('events-list');
  var eventsEmpty = document.getElementById('events-empty');
  var analyticsCards = document.getElementById('analytics-cards');

  var onboardingDismissed = localStorage.getItem('peak-business-onboarding') === 'true';

  function showOnboarding() {
    if (onboardingDismissed) {
      onboardingTooltip.style.display = 'none';
      tooltipPointer.style.display = 'none';
      return;
    }
    onboardingTooltip.style.display = 'block';
    tooltipPointer.style.display = 'flex';
    tooltipPointer.style.position = 'absolute';
    var btn = document.getElementById('btn-create-event');
    if (btn && btn.offsetParent) {
      var rect = btn.getBoundingClientRect();
      tooltipPointer.style.top = (rect.top + window.scrollY - 50) + 'px';
      tooltipPointer.style.left = (rect.left + window.scrollX - 220) + 'px';
    }
  }

  function hideOnboarding() {
    onboardingTooltip.style.display = 'none';
    tooltipPointer.style.display = 'none';
    localStorage.setItem('peak-business-onboarding', 'true');
  }

  dismissOnboarding.addEventListener('click', function() {
    hideOnboarding();
  });

  btnLogout.addEventListener('click', function() {
    window.PeakAuth.signOut().then(function() {
      window.location.href = 'login.html';
    });
  });

  btnCreate.addEventListener('click', function() {
    window.location.href = 'create-event.html';
  });

  function formatDate(val) {
    if (!val) return '—';
    if (val.toDate && typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
    if (val instanceof Date) return val.toLocaleDateString();
    if (typeof val === 'string') return new Date(val).toLocaleDateString();
    return String(val);
  }

  function renderEvents(events) {
    eventsList.querySelectorAll('.event-card').forEach(function(el) { el.remove(); });
    eventsEmpty.style.display = events.length ? 'none' : 'block';
    if (events.length === 0) return;
    var html = events.map(function(ev) {
      return (
        '<article class="event-card" data-id="' + (ev.id || '') + '">' +
          '<div class="event-card-image" style="background-image:url(\'' + (ev.venueImage || '') + '\')"></div>' +
          '<div class="event-card-body">' +
            '<h3>' + (ev.venueName || 'Event') + '</h3>' +
            '<p class="event-meta">' + formatDate(ev.date) + (ev.addr ? ' · ' + ev.addr : '') + '</p>' +
            '<div class="event-stats">' +
              '<span><strong>' + (ev.total || 0) + '</strong> attendees</span>' +
              '<span><strong>$' + (ev.revenue || 0) + '</strong> revenue</span>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
    eventsList.insertAdjacentHTML('beforeend', html);
  }

  function renderAnalytics(events) {
    analyticsCards.innerHTML = '';
    if (events.length === 0) return;
    var totalAttendees = events.reduce(function(sum, e) { return sum + (e.total || 0); }, 0);
    var totalRevenue = events.reduce(function(sum, e) { return sum + (e.revenue || 0); }, 0);
    var cards = [
      { label: 'Total events', value: events.length, icon: 'fa-calendar' },
      { label: 'Total attendees', value: totalAttendees, icon: 'fa-users' },
      { label: 'Total revenue', value: '$' + totalRevenue, icon: 'fa-dollar-sign' }
    ];
    cards.forEach(function(c) {
      var div = document.createElement('div');
      div.className = 'analytics-card';
      div.innerHTML = '<i class="fas ' + c.icon + '"></i><span class="value">' + c.value + '</span><span class="label">' + c.label + '</span>';
      analyticsCards.appendChild(div);
    });
    analyticsCards.style.display = 'grid';
  }

  function clearEventsList() {
    eventsList.querySelectorAll('.event-card').forEach(function(el) { el.remove(); });
    eventsEmpty.style.display = 'block';
  }

  window.PeakAuth.onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    userEmailEl.textContent = user.email || '';

    window.PeakDb.getEventsForUser(user.uid).then(function(events) {
      clearEventsList();
      renderEvents(events);
      renderAnalytics(events);
      showOnboarding();
    }).catch(function() {
      clearEventsList();
      showOnboarding();
    });
  });
});
