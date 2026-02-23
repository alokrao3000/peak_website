'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PeakLogo from '@/components/PeakLogo';
import { signIn, signUp, onAuthStateChange, whenAuthReady, getCurrentUser } from '@/lib/firebase-auth';
import { createBusinessUser } from '@/lib/firebase-db';

export default function BusinessLoginPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupOrgSize, setSignupOrgSize] = useState('');
  const [signupOrgType, setSignupOrgType] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signinError, setSigninError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    whenAuthReady().then(() => {
      if (cancelled) return;
      // If user is already logged in, redirect immediately without showing the form
      const user = getCurrentUser();
      if (user) {
        setIsRedirecting(true);
        router.replace('/business/dashboard');
        return;
      }
      setAuthChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setIsRedirecting(true);
        router.replace('/business/dashboard');
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [authChecked, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError('');
    if (!signinEmail.trim() || !signinPassword) {
      setSigninError('Please enter email and password.');
      return;
    }
    setSigninLoading(true);
    try {
      await signIn(signinEmail.trim(), signinPassword);
      setIsRedirecting(true);
      router.push('/business/dashboard');
    } catch (err: unknown) {
      setSigninError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setSigninLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupEmail.trim() || !signupPassword) {
      setSignupError('Please enter business email and password.');
      return;
    }
    if (!signupBusinessName.trim() || !signupOrgType.trim() || !signupFirstName.trim() || !signupLastName.trim()) {
      setSignupError('Please fill in Business Name, Organization Type, First name, and Last name.');
      return;
    }
    const orgSize = parseInt(signupOrgSize, 10);
    if (signupOrgSize === '' || isNaN(orgSize) || orgSize < 0) {
      setSignupError('Please enter a valid Organization Size (number).');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    setSignupLoading(true);
    try {
      const { user } = await signUp(signupEmail.trim(), signupPassword);
      await createBusinessUser(user.uid, {
        email: user.email ?? signupEmail.trim(),
        businessName: signupBusinessName.trim(),
        organizationSize: orgSize,
        organizationType: signupOrgType.trim(),
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
      });
      setIsRedirecting(true);
      router.push('/business/dashboard');
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  if (!authChecked || isRedirecting) {
    return (
      <div className="auth-container">
        <Link href="/" className="back-link">
          <i className="fas fa-arrow-left" /> Back to Peak
        </Link>
        <div className="auth-card auth-card--loading">
          <p className="auth-loading">
            {isRedirecting ? 'Taking you to dashboard…' : 'Checking sign-in…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Link href="/" className="back-link">
        <i className="fas fa-arrow-left" /> Back to Peak
      </Link>
      <div className="auth-card">
        <div className="auth-header">
          <PeakLogo size={44} showWordmark={true} />
          <h1>For Businesses</h1>
          <p className="auth-subtitle">Create an account or sign in to manage your events</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setSigninError(''); setSignupError(''); }}
          >
            Log in
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setSigninError(''); setSignupError(''); }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSignIn} className={`auth-form ${activeTab === 'signin' ? 'active' : ''}`}>
          <div className="form-group">
            <label htmlFor="signin-email">Email</label>
            <input
              type="email"
              id="signin-email"
              required
              placeholder="you@venue.com"
              autoComplete="email"
              value={signinEmail}
              onChange={(e) => setSigninEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signin-password">Password</label>
            <input
              type="password"
              id="signin-password"
              required
              placeholder="••••••••"
              autoComplete="current-password"
              value={signinPassword}
              onChange={(e) => setSigninPassword(e.target.value)}
            />
          </div>
          {signinError && <p className="form-error" role="alert">{signinError}</p>}
          <button type="submit" className="btn-primary" disabled={signinLoading}>
            {signinLoading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <form onSubmit={handleSignUp} className={`auth-form ${activeTab === 'signup' ? 'active' : ''}`}>
          <div className="form-group">
            <label htmlFor="signup-email">Business Email</label>
            <input
              type="email"
              id="signup-email"
              required
              placeholder="you@company.com"
              autoComplete="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-business-name">Business Name</label>
            <input
              type="text"
              id="signup-business-name"
              required
              placeholder="Your company or venue name"
              value={signupBusinessName}
              onChange={(e) => setSignupBusinessName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-org-size">Organization Size</label>
            <input
              type="number"
              id="signup-org-size"
              required
              min={0}
              placeholder="e.g. 10"
              value={signupOrgSize}
              onChange={(e) => setSignupOrgSize(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-org-type">Organization Type</label>
            <input
              type="text"
              id="signup-org-type"
              required
              placeholder="e.g. Venue, Promoter, Brand"
              value={signupOrgType}
              onChange={(e) => setSignupOrgType(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-first-name">First name</label>
            <input
              type="text"
              id="signup-first-name"
              required
              placeholder="Your first name"
              autoComplete="given-name"
              value={signupFirstName}
              onChange={(e) => setSignupFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-last-name">Last name</label>
            <input
              type="text"
              id="signup-last-name"
              required
              placeholder="Your last name"
              autoComplete="family-name"
              value={signupLastName}
              onChange={(e) => setSignupLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              required
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
          </div>
          {signupError && <p className="form-error" role="alert">{signupError}</p>}
          <button type="submit" className="btn-primary" disabled={signupLoading}>
            {signupLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
