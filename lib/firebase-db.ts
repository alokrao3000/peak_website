'use client';

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export interface Venue {
  id: string;
  name?: string;
  venueName?: string;
  address?: string;
  addr?: string;
  image?: string;
  venueImage?: string;
  _geoloc?: { lat: number; lng: number };
  lat?: number;
  lng?: number;
}

/** Active venue document (id = Firestore document ID). Use this ID for matching, not address. */
export interface ActiveVenue {
  id: string;
  venueId?: string;
  name?: string;
  primaryPhotoURL?: string | null;
  [key: string]: unknown;
}

/** ActiveVenue with address resolved from venues collection for business UI display only. Backend still links by id. */
export interface ActiveVenueWithDisplay extends ActiveVenue {
  displayAddress: string;
}

export interface EventData {
  id?: string;
  ownerId: string;
  venueId: string;
  venueName: string;
  venueImage: string;
  addr: string;
  /** When set, event is linked to this activeVenues doc (match by ID, not address). */
  activeVenueId?: string;
  date: Date | Timestamp | null;
  priceGirls: number;
  priceBoys: number;
  total?: number;
  revenue?: number;
  createdAt?: unknown;
}

export interface BusinessUser {
  uid: string;
  email: string;
  businessName?: string;
  organizationSize?: number;
  organizationType?: string;
  firstName?: string;
  lastName?: string;
  createdAt: unknown;
}

export interface CreateBusinessUserData {
  email: string;
  businessName: string;
  organizationSize: number;
  organizationType: string;
  firstName: string;
  lastName: string;
}

/** Create or update a business user in the businessUsers collection. */
export async function createBusinessUser(uid: string, data: CreateBusinessUserData): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return Promise.reject(new Error('Firestore not available'));
  await setDoc(
    doc(db, 'businessUsers', uid),
    {
      uid,
      email: data.email,
      businessName: data.businessName,
      organizationSize: data.organizationSize,
      organizationType: data.organizationType,
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getVenues(): Promise<Venue[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, 'venues'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
}

export async function getVenueById(venueId: string): Promise<Venue | null> {
  const db = getFirestoreDb();
  if (!db || !venueId) return null;
  const snap = await getDoc(doc(db, 'venues', venueId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Venue;
}

/** Get all activeVenues. Match/link by document ID (id), not by address. */
export async function getActiveVenues(): Promise<ActiveVenue[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, 'activeVenues'));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ActiveVenue));
}

function formatAddress(addr: unknown): string {
  if (addr == null) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object' && addr !== null && !Array.isArray(addr)) {
    const o = addr as Record<string, unknown>;
    const parts = [o.street, o.city, o.state, o.zip, o.country].filter((x) => typeof x === 'string');
    return parts.join(', ');
  }
  return String(addr);
}

/** Get activeVenues with display address for business UI. Venues remain linked by document ID on the backend. */
export async function getActiveVenuesForBusiness(): Promise<ActiveVenueWithDisplay[]> {
  const list = await getActiveVenues();
  const withDisplay = await Promise.all(
    list.map(async (av) => {
      let displayAddress = 'Address not available';
      if (av.venueId) {
        try {
          const venue = await getVenueById(av.venueId);
          if (venue) displayAddress = formatAddress(venue.address ?? venue.addr) || displayAddress;
        } catch {
          // keep default
        }
      }
      return { ...av, displayAddress } as ActiveVenueWithDisplay;
    })
  );
  return withDisplay;
}

export interface EventGuest {
  id: string;
  userId?: string;
  userName?: string;
}

/** App user (from users collection). RSVPs must be registered users. */
export interface AppUser {
  id: string;
  name?: string;
  email?: string;
}

export interface EventGuestWithUser extends EventGuest {
  /** Resolved from users collection; undefined if not a registered user */
  user?: AppUser | null;
}

function extractGeoloc(venue: Venue | null): { lat: number; lng: number } | null {
  if (!venue) return null;
  const geoloc = venue._geoloc as { lat?: number; lng?: number; latitude?: number; longitude?: number } | undefined;
  if (geoloc) {
    if (typeof geoloc.lat === 'number' && typeof geoloc.lng === 'number') return { lat: geoloc.lat, lng: geoloc.lng };
    if (typeof (geoloc as { latitude?: number }).latitude === 'number' && typeof (geoloc as { longitude?: number }).longitude === 'number') {
      return { lat: (geoloc as { latitude: number }).latitude, lng: (geoloc as { longitude: number }).longitude };
    }
  }
  if (typeof venue.lat === 'number' && typeof venue.lng === 'number') {
    return { lat: venue.lat, lng: venue.lng };
  }
  return null;
}

/** Create or update an activeVenue document when an event is created. Uses eventId as doc ID. */
export async function createActiveVenueForEvent(
  eventId: string,
  event: { venueId: string; venueName: string; venueImage?: string; date: Date | Timestamp | null },
  venue: Venue | null
): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !eventId) return;
  const geoloc = extractGeoloc(venue);
  const dateVal = event.date;
  const dateStr =
    dateVal instanceof Date
      ? `${dateVal.getMonth() + 1}/${dateVal.getDate()}`
      : dateVal && typeof (dateVal as { toDate?: () => Date }).toDate === 'function'
        ? (() => {
            const d = (dateVal as { toDate: () => Date }).toDate();
            return `${d.getMonth() + 1}/${d.getDate()}`;
          })()
        : '';
  const name = event.venueName ? `${event.venueName} (${dateStr})` : `Event (${dateStr})`;
  const now = serverTimestamp();
  const activeVenueData: Record<string, unknown> = {
    venueId: event.venueId,
    name,
    activeStoryCount: 0,
    activityScore: 0,
    attendeeCount: 0,
    category: null,
    commentCount: 0,
    createdAt: now,
    lastActivityAt: now,
    mightGoCount: 0,
    primaryPhotoURL: event.venueImage ?? null,
    ratingCount: 0,
    updatedAt: now,
  };
  if (geoloc) {
    activeVenueData._geoloc = new GeoPoint(geoloc.lat, geoloc.lng);
  }
  await setDoc(doc(db, 'activeVenues', eventId), activeVenueData, { merge: true });
}

export async function deleteActiveVenueForEvent(eventId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !eventId) return;
  await deleteDoc(doc(db, 'activeVenues', eventId));
}

export async function getEventGuests(eventId: string): Promise<EventGuest[]> {
  const db = getFirestoreDb();
  if (!db || !eventId) return [];
  const snap = await getDocs(collection(db, 'events', eventId, 'guests'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventGuest));
}

/** Get a single app user from the users collection (for resolving guest names). */
export async function getAppUser(uid: string): Promise<AppUser | null> {
  const db = getFirestoreDb();
  if (!db || !uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, name: d?.name as string | undefined, email: d?.email as string | undefined };
}

/** Get event guests with display info resolved from the users collection. Only registered users can RSVP. */
export async function getEventGuestsWithUsers(eventId: string): Promise<EventGuestWithUser[]> {
  const guests = await getEventGuests(eventId);
  const withUsers: EventGuestWithUser[] = await Promise.all(
    guests.map(async (g) => {
      const uid = g.userId;
      if (!uid) return { ...g, user: null };
      const user = await getAppUser(uid);
      return { ...g, user: user ?? null };
    })
  );
  return withUsers;
}

export async function deleteEvent(eventId: string, ownerId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !eventId || !ownerId) return Promise.reject(new Error('Missing eventId or ownerId'));
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return Promise.reject(new Error('Event not found'));
  const data = eventSnap.data();
  if (data?.ownerId !== ownerId) return Promise.reject(new Error('Not authorized to delete this event'));
  await deleteDoc(eventRef);
  try {
    await deleteActiveVenueForEvent(eventId);
  } catch (e) {
    // Event is already deleted; activeVenues cleanup is non-critical (e.g. permission)
    if (typeof console !== 'undefined' && console.warn) console.warn('deleteActiveVenueForEvent failed:', e);
  }
}

export async function getEventsForUser(uid: string): Promise<EventData[]> {
  const db = getFirestoreDb();
  if (!db || !uid) return [];
  const q = query(
    collection(db, 'events'),
    where('ownerId', '==', uid),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventData));
}

export async function createEvent(uid: string, data: Omit<EventData, 'ownerId' | 'createdAt'>): Promise<string> {
  const db = getFirestoreDb();
  if (!db || !uid) return Promise.reject(new Error('Firestore or user not available'));
  const dateVal = data.date;
  const eventData: Record<string, unknown> = {
    ownerId: String(uid),
    venueId: data.venueId,
    date: dateVal instanceof Date ? Timestamp.fromDate(dateVal) : dateVal,
    priceGirls: Number(data.priceGirls) || 0,
    priceBoys: Number(data.priceBoys) || 0,
    total: 0,
    revenue: 0,
    venueName: data.venueName ?? '',
    venueImage: data.venueImage ?? '',
    addr: data.addr ?? '',
    createdAt: serverTimestamp(),
  };
  if (data.activeVenueId) {
    eventData.activeVenueId = data.activeVenueId;
  }
  const ref = await addDoc(collection(db, 'events'), eventData);
  const eventId = ref.id;
  if (data.activeVenueId) {
    return eventId;
  }
  let venue: Venue | null = null;
  try {
    venue = await getVenueById(data.venueId);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('getVenueById failed:', e);
  }
  try {
    const dateForActive = dateVal instanceof Date ? Timestamp.fromDate(dateVal) : dateVal;
    await createActiveVenueForEvent(eventId, {
      venueId: data.venueId,
      venueName: data.venueName ?? '',
      venueImage: data.venueImage ?? '',
      date: dateForActive,
    }, venue);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('createActiveVenueForEvent failed:', e);
  }
  return eventId;
}
