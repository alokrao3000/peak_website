'use client';
import React from 'react';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, getCurrentUser, signOut } from '../../../lib/firebase-auth';
import PeakLogo from '@/components/PeakLogo';
import {
  getEventsForUser,
  getEventGuestsWithUsers,
  getActiveVenues,
  getVenues,
  deleteEvent,
  type EventData,
  type EventGuestWithUser,
  type ActiveVenue,
  type Venue,
} from '../../../lib/firebase-db';

function formatDate(val: EventData['date']): string {
  if (!val) return '—';
  if (val && typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (val instanceof Date) return val.toLocaleDateString();
  if (typeof val === 'string') return new Date(val).toLocaleDateString();
  return String(val);
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<EventGuestWithUser[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeVenues, setActiveVenues] = useState<ActiveVenue[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        router.replace('/business/login');
        return;
      }
      setUserEmail(user.email ?? '');
      setCurrentUserId(user.uid);
      setEventsError(null);
      Promise.all([getEventsForUser(user.uid), getActiveVenues(), getVenues()])
        .then(([list, activeVenuesList, venuesList]) => {
          setEvents(list);
          setActiveVenues(activeVenuesList);
          setVenues(venuesList);
          setEventsError(null);
        })
        .catch((err) => {
          setEvents([]);
          const msg = err instanceof Error ? err.message : 'Failed to load events.';
          setEventsError(msg);
        });
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    setOnboardingDismissed(typeof window !== 'undefined' && localStorage.getItem('peak-business-onboarding') === 'true');
  }, []);

  useEffect(() => {
    setShowOnboarding(!onboardingDismissed && events.length === 0);
  }, [onboardingDismissed, events.length]);

  useEffect(() => {
    if (!selectedEvent?.id) {
      setGuests([]);
      return;
    }
    setGuestsLoading(true);
    getEventGuestsWithUsers(selectedEvent.id)
      .then(setGuests)
      .catch(() => setGuests([]))
      .finally(() => setGuestsLoading(false));
  }, [selectedEvent?.id]);

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id || !currentUserId) return;
    setDeleteLoading(true);
    try {
      await deleteEvent(selectedEvent.id, currentUserId);
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setSelectedEvent(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete event.';
      setEventsError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const dismissOnboarding = () => {
    if (typeof window !== 'undefined') localStorage.setItem('peak-business-onboarding', 'true');
    setOnboardingDismissed(true);
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/business/login');
  };

  const totalAttendees = events.reduce((sum, e) => sum + (e.total ?? 0), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue ?? 0), 0);

  const activeVenuesById = Object.fromEntries(
    activeVenues.map((av) => [av.id, av])
  );
  const venuesById = Object.fromEntries(
    venues.map((v) => [v.id, v])
  );
  const getEventVenueImage = (ev: EventData): string => {
    const stored = (ev as { venueImage?: string }).venueImage ?? ev.venueImage;
    if (stored && typeof stored === 'string' && stored.trim()) return stored.trim();
    const fromActive = ev.activeVenueId ? activeVenuesById[ev.activeVenueId]?.primaryPhotoURL : undefined;
    if (fromActive && typeof fromActive === 'string' && fromActive.trim()) return fromActive.trim();
    const fromVenue = ev.venueId ? (venuesById[ev.venueId]?.image ?? venuesById[ev.venueId]?.venueImage) : undefined;
    if (fromVenue && typeof fromVenue === 'string' && fromVenue.trim()) return fromVenue.trim();
    return '';
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="container">
          <PeakLogo href="/" size={40} showWordmark={true} />
          <div className="header-actions">
            <span className="user-email">{userEmail}</span>
            <Link href="/business/create-event" className="btn-primary">Create event</Link>
            <button type="button" onClick={handleLogout} className="btn-ghost">Log out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main container">
        <section className="analytics-section">
          <h2>Event analytics</h2>
          <p className="section-desc">Overview of your events and performance.</p>
          <div className="analytics-placeholder">
            {showOnboarding && (
              <div className="onboarding-tooltip">
                <p><strong>Here is where you will see your event analytics.</strong> Your total attendees, revenue, and event stats will appear here once you have events.</p>
                <div className="tooltip-pointer">
                  <i className="fas fa-hand-point-right" />
                  <span>Click <strong>Create event</strong> to get started</span>
                </div>
                <button type="button" onClick={dismissOnboarding} className="btn-ghost btn-sm">Got it</button>
              </div>
            )}
            {events.length > 0 && (
              <div className="analytics-cards visible">
                <div className="analytics-card">
                  <i className="fas fa-calendar" />
                  <span className="value">{events.length}</span>
                  <span className="label">Total events</span>
                </div>
                <div className="analytics-card">
                  <i className="fas fa-users" />
                  <span className="value">{totalAttendees}</span>
                  <span className="label">Total attendees</span>
                </div>
                <div className="analytics-card">
                  <i className="fas fa-dollar-sign" />
                  <span className="value">${totalRevenue}</span>
                  <span className="label">Total revenue</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="events-section">
          <h2>Your events</h2>
          {eventsError && (
            <div className="error events-index-error" role="alert">
              {eventsError.includes('requires an index') && eventsError.includes('https://') ? (
                <>
                  <p>The events list needs a one-time Firestore index. Click the link below to create it (takes 1–2 minutes to build).</p>
                  <a
                    href={eventsError.match(/https:\/\/[^\s]+/)?.[0] ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Create index in Firebase Console
                  </a>
                </>
              ) : (
                <p>{eventsError}</p>
              )}
            </div>
          )}
          <div className="events-list">
            {events.length === 0 && !eventsError && (
              <p className="empty-state">No events yet. Create your first event to get started.</p>
            )}
            {events.map((ev) => {
              const venueImageUrl = getEventVenueImage(ev);
              return (
              <button
                key={ev.id}
                type="button"
                className="event-card"
                onClick={() => setSelectedEvent(ev)}
              >
                <div
                  className="event-card-image"
                  style={venueImageUrl ? { backgroundImage: `url(${venueImageUrl})` } : undefined}
                />
                <div className="event-card-body">
                  <h3>{ev.venueName ?? 'Event'}</h3>
                  <p className="event-meta">
                    {formatDate(ev.date)}
                    {ev.addr ? ` · ${ev.addr}` : ''}
                  </p>
                  <div className="event-stats">
                    <span><strong>{ev.total ?? 0}</strong> RSVPs / tickets</span>
                    <span><strong>${ev.revenue ?? 0}</strong> revenue</span>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </section>
      </main>

      {selectedEvent && (
        <div
          className="event-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="event-modal-header">
              <h2 id="event-modal-title">{selectedEvent.venueName ?? 'Event'}</h2>
              <button
                type="button"
                className="event-modal-close"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div
              className="event-modal-image"
              style={getEventVenueImage(selectedEvent) ? { backgroundImage: `url(${getEventVenueImage(selectedEvent)})` } : undefined}
            />
            <div className="event-modal-body">
              <dl className="event-modal-info">
                <dt>Date</dt>
                <dd>{formatDate(selectedEvent.date)}</dd>
                <dt>Address</dt>
                <dd>{selectedEvent.addr || '—'}</dd>
                <dt>Price (girls)</dt>
                <dd>${selectedEvent.priceGirls ?? 0}</dd>
                <dt>Price (boys)</dt>
                <dd>${selectedEvent.priceBoys ?? 0}</dd>
                <dt>Attendees (RSVPs)</dt>
                <dd>{guestsLoading ? '…' : guests.length}</dd>
                <dt>Revenue</dt>
                <dd>${selectedEvent.revenue ?? 0}</dd>
              </dl>
              <section className="event-modal-guests">
                <h3>Guest list / attendees</h3>
                {guestsLoading ? (
                  <p className="event-modal-loading">Loading guests…</p>
                ) : guests.length === 0 ? (
                  <p className="event-modal-empty">No guests yet.</p>
                ) : (
                  <ul>
                    {guests.map((g) => (
                      <li key={g.id}>
                        {g.user?.name ?? g.user?.email ?? g.userName ?? (g.userId ? 'Not a registered user' : 'Guest')}
                        {g.user?.email && g.user?.name ? ` (${g.user.email})` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <div className="event-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteEvent}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
