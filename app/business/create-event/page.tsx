'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PeakLogo from '@/components/PeakLogo';
import { onAuthStateChange, getCurrentUser } from '../../../lib/firebase-auth';
import { getActiveVenuesForBusiness, createEvent, type ActiveVenueWithDisplay } from '../../../lib/firebase-db';

const MANUAL_VENUE_ID = 'manual';

interface SelectedVenue {
  id: string;
  name: string;
  image: string;
  addr: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [activeVenues, setActiveVenues] = useState<ActiveVenueWithDisplay[]>([]);
  const [venueSearch, setVenueSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<SelectedVenue | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [manualVenueName, setManualVenueName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [date, setDate] = useState('');
  const [priceGirls, setPriceGirls] = useState('0');
  const [priceBoys, setPriceBoys] = useState('0');
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchLower = venueSearch.trim().toLowerCase();
  const filteredVenues = searchLower
    ? activeVenues.filter(
        (v) =>
          ((v.name as string) ?? '').toLowerCase().includes(searchLower) ||
          (v.displayAddress ?? '').toLowerCase().includes(searchLower)
      )
    : activeVenues;
  const showVenueNotFound =
    !loading &&
    !error &&
    (activeVenues.length === 0 || filteredVenues.length === 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        router.replace('/business/login');
        return;
      }
      setLoading(true);
      setError('');
      getActiveVenuesForBusiness()
        .then((v) => {
          setActiveVenues(v);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load active venues.'))
        .finally(() => setLoading(false));
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (showForm && !date) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setDate(d.toISOString().slice(0, 10));
    }
  }, [showForm, date]);

  const selectVenue = (v: ActiveVenueWithDisplay) => {
    setSelectedVenue({
      id: v.id,
      name: (v.name as string) ?? 'Venue',
      image: (v.primaryPhotoURL as string) ?? '',
      addr: v.displayAddress,
    });
    setShowForm(true);
  };

  const backToVenues = () => {
    setSelectedVenue(null);
    setShowForm(false);
    setManualVenueName('');
    setManualAddress('');
    setDate('');
    setPriceGirls('0');
    setPriceBoys('0');
    setCreateError('');
  };

  const selectManualEntry = () => {
    setSelectedVenue({
      id: MANUAL_VENUE_ID,
      name: '',
      image: '',
      addr: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    const user = getCurrentUser();
    if (!user) {
      router.replace('/business/login');
      return;
    }
    if (!selectedVenue) {
      setCreateError('Please select a venue first.');
      return;
    }
    const isManual = selectedVenue.id === MANUAL_VENUE_ID;
    if (isManual && (!manualVenueName.trim() || !manualAddress.trim())) {
      setCreateError('Please enter the venue name and address.');
      return;
    }
    const venueName = isManual ? manualVenueName.trim() : selectedVenue.name;
    const addr = isManual ? manualAddress.trim() : selectedVenue.addr;
    const venueId = isManual ? MANUAL_VENUE_ID : selectedVenue.id;
    const dateToStore = date ? new Date(date + 'T00:00:00') : null;
    setSubmitting(true);
    try {
      await createEvent(user.uid, {
        venueId,
        venueName,
        venueImage: isManual ? '' : selectedVenue.image,
        addr,
        ...(isManual ? {} : { activeVenueId: selectedVenue.id }),
        date: dateToStore,
        priceGirls: Number(priceGirls) || 0,
        priceBoys: Number(priceBoys) || 0,
      });
      router.push('/business/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof (err as { message?: string })?.message === 'string'
            ? (err as { message: string }).message
            : 'Failed to create event. Check your connection and try again.';
      setCreateError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="container">
          <PeakLogo href="/business/dashboard" size={40} showWordmark={true} />
          <Link href="/business/dashboard" className="btn-ghost"><i className="fas fa-arrow-left" /> Dashboard</Link>
        </div>
      </header>

      <main className="create-event-main container">
        <h1>Create event</h1>

        <div
          id="step-venue"
          className={`create-step${showForm ? ' create-step--hidden' : ''}`}
          aria-hidden={showForm}
        >
          <h2>Select a venue</h2>
          <p className="step-desc">Search or choose a venue by name and address.</p>
          {!loading && !error && activeVenues.length > 0 && (
            <div className="form-group venue-search-row">
              <label htmlFor="venue-search">Search venues</label>
              <input
                type="search"
                id="venue-search"
                placeholder="Search by name or address…"
                value={venueSearch}
                onChange={(e) => setVenueSearch(e.target.value)}
                className="venue-search-input"
                autoComplete="off"
              />
            </div>
          )}
          <div className="venues-grid">
            {loading && <p className="loading">Loading venues…</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && filteredVenues.map((v) => (
              <button
                key={v.id}
                type="button"
                className="venue-card"
                onClick={() => selectVenue(v)}
              >
                <div
                  className="venue-card-image"
                  style={{ backgroundImage: `url(${v.primaryPhotoURL ?? ''})` }}
                />
                <div className="venue-card-body">
                  <h3>{(v.name as string) ?? 'Venue'}</h3>
                  <p>{v.displayAddress}</p>
                </div>
              </button>
            ))}
            {showVenueNotFound && (
              <button
                type="button"
                className="venue-card venue-card--not-found"
                onClick={selectManualEntry}
              >
                <div className="venue-card-body venue-card-body--full">
                  <h3>Venue not found</h3>
                  <p>Enter a location for your event.</p>
                  <span className="venue-not-found-cta">Enter name and address →</span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className={`create-step${!showForm ? ' create-step--hidden' : ''}`} aria-hidden={!showForm}>
          {selectedVenue && (
          <form id="event-form" onSubmit={handleSubmit}>
            <h2>Event details</h2>
            {selectedVenue.id === MANUAL_VENUE_ID ? (
              <div className="manual-venue-fields">
                <div className="form-group">
                  <label htmlFor="manual-venue-name">Venue / event name</label>
                  <input
                    type="text"
                    id="manual-venue-name"
                    required
                    placeholder="e.g. Summer Rooftop Party"
                    value={manualVenueName}
                    onChange={(e) => setManualVenueName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="manual-venue-address">Address</label>
                  <input
                    type="text"
                    id="manual-venue-address"
                    required
                    placeholder="Street, city, state, zip"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="selected-venue">
                <div
                  className="selected-venue-image"
                  style={{ backgroundImage: `url(${selectedVenue.image})` }}
                />
                <div>
                  <strong>{selectedVenue.name}</strong>
                  {selectedVenue.addr && <><br /><span className="addr">{selectedVenue.addr}</span></>}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event-date">Date</label>
                <input
                  type="date"
                  id="event-date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label htmlFor="price-girls">Price per ticket (girls) $</label>
                <input
                  type="number"
                  id="price-girls"
                  min={0}
                  step={0.01}
                  value={priceGirls}
                  onChange={(e) => setPriceGirls(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price-boys">Price per ticket (boys) $</label>
                <input
                  type="number"
                  id="price-boys"
                  min={0}
                  step={0.01}
                  value={priceBoys}
                  onChange={(e) => setPriceBoys(e.target.value)}
                  required
                />
              </div>
            </div>
            {createError && <p className="form-error">{createError}</p>}
            <div className="form-actions">
              <button type="button" onClick={backToVenues} className="btn-ghost">Back to venues</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create event'}
              </button>
            </div>
          </form>
          )}
        </div>
      </main>
    </>
  );
}
