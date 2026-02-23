import Link from 'next/link';
import LandingClient from '@/components/LandingClient';
import ThemeToggle from '@/components/ThemeToggle';
import PeakLogo from '@/components/PeakLogo';

export default function HomePage() {
  return (
    <>
      <LandingClient />
      <header className="landing-header">
        <div className="container landing-header-inner">
          <PeakLogo href="/" size={44} showWordmark={true} className="header-logo" />
          <nav className="landing-nav">
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#story" className="nav-link">Our story</a>
            <a href="#team" className="nav-link">The crew</a>
            <a href="/business/login" className="nav-business">For Businesses</a>
          </nav>
        </div>
      </header>
      <section className="hero">
        <div className="container">
          <div className="hero-logo-wrap">
            <PeakLogo size={80} showWordmark={true} />
          </div>
          <h1 className="hero-tagline">
            See The Night <span className="gradient-text">Before You Go</span>
          </h1>
          <p className="hero-subtitle">
            The real-time nightlife map that shows you what&apos;s actually happening — crowd levels, vibes, and where people are headed tonight.
          </p>
          <div className="features-grid">
            <div className="feature-badge">
              <i className="fas fa-bolt" />
              REAL-TIME UPDATES
            </div>
            <div className="feature-badge">
              <i className="fas fa-eye" />
              SEE THE VIBE
            </div>
            <div className="feature-badge">
              <i className="fas fa-map-marker-alt" />
              LIVE LOCATIONS
            </div>
          </div>
          <a
            href="https://apps.apple.com/us/app/peak-nyu/id6752425622"
            target="_blank"
            rel="noopener noreferrer"
            className="app-store-button"
          >
            <i className="fab fa-apple" />
            <div className="button-text">
              <span className="small-text">Download on the</span>
              <span className="large-text">App Store</span>
            </div>
          </a>
          <a href="/business/login" className="business-button">
            For Businesses
          </a>
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Night Owls</div>
            </div>
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Venues</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Live Updates</div>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="bg-pulse-1" />
          <div className="bg-pulse-2" />
          <div className="bg-pulse-3" />
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title">
            <span className="section-number">01</span>
            HOW IT WORKS
          </h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-map" />
              </div>
              <div className="step-content">
                <div className="step-number">01</div>
                <h3>Open The Map</h3>
                <p>See a live view of all venues in your city with real-time activity levels, photos, and crowd updates.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-camera" />
              </div>
              <div className="step-content">
                <div className="step-number">02</div>
                <h3>Check &quot;Peeks&quot;</h3>
                <p>Browse real photos and videos posted by users to see exactly what venues look like right now.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-users" />
              </div>
              <div className="step-content">
                <div className="step-number">03</div>
                <h3>Plan Your Night</h3>
                <p>Mark yourself as &quot;going&quot; or &quot;might go&quot; and see which friends are headed to the same spots.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="container">
          <h2 className="section-title">
            <span className="section-number">02</span>
            OUR STORY
          </h2>
          <div className="story-content">
            <p className="story-quote">
              &quot;We built Peak because we were tired of guessing where the night would take us.&quot;
            </p>
            <div className="story-text">
              <p>
                Too many times we&apos;d show up to a &quot;hot spot&quot; only to find it dead, or miss out on an amazing party because we didn&apos;t know it was happening. The traditional approach to nightlife discovery was broken — based on hype, not reality.
              </p>
              <p>
                That&apos;s why we created Peak: a real-time nightlife map powered by the community, for the community. We&apos;re turning guesswork into knowledge and FOMO into FOLO (Fear of Losing Out — on staying home).
              </p>
            </div>
            <div className="story-stats">
              <div className="story-stat">
                <div className="story-stat-number">3</div>
                <div className="story-stat-label">Cities Live</div>
              </div>
              <div className="story-stat">
                <div className="story-stat-number">85%</div>
                <div className="story-stat-label">Less Disappointment</div>
              </div>
              <div className="story-stat">
                <div className="story-stat-number">24/7</div>
                <div className="story-stat-label">Updates</div>
              </div>
            </div>
          </div>
        </div>
        <div className="story-graphic">
          <div className="graphic-circle" />
          <div className="graphic-circle" />
          <div className="graphic-circle" />
        </div>
      </section>

      <section className="team" id="team">
        <div className="container">
          <h2 className="section-title">
            <span className="section-number">03</span>
            THE CREW
          </h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo">
                <div className="photo-glow" />
                <i className="fas fa-crown" />
              </div>
              <h3>Michael</h3>
              <p className="member-role">Founder &amp; Developer</p>
              <p className="member-bio">Built the app to solve his own nightlife frustrations</p>
            </div>
            <div className="team-member">
              <div className="member-photo">
                <div className="photo-glow" />
                <i className="fas fa-users" />
              </div>
              <h3>Alex</h3>
              <p className="member-role">Community Lead</p>
              <p className="member-bio">Connects venues with the Peak community</p>
            </div>
            <div className="team-member">
              <div className="member-photo">
                <div className="photo-glow" />
                <i className="fas fa-palette" />
              </div>
              <h3>Jordan</h3>
              <p className="member-role">Design &amp; UX</p>
              <p className="member-bio">Makes sure Peak looks as good as the venues</p>
            </div>
            <div className="team-member">
              <div className="member-photo">
                <div className="photo-glow" />
                <i className="fas fa-bullhorn" />
              </div>
              <h3>Taylor</h3>
              <p className="member-role">Marketing</p>
              <p className="member-bio">Spreads the word about smarter nightlife</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <PeakLogo href="/" size={48} showWordmark={true} />
              <p className="footer-tagline">See the night before you go</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Get The App</h4>
                <a
                  href="https://apps.apple.com/us/app/peak-nyu/id6752425622"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-app-button"
                >
                  <i className="fab fa-apple" />
                  Download for iOS
                </a>
              </div>
              <div className="link-group">
                <h4>Connect</h4>
                <a href="mailto:hello@peaknyu.com">hello@peaknyu.com</a>
                <a href="mailto:partners@peaknyu.com">partners@peaknyu.com</a>
                <div className="social-links">
                  <a href="#" className="social-link"><i className="fab fa-instagram" /></a>
                  <a href="#" className="social-link"><i className="fab fa-tiktok" /></a>
                  <a href="#" className="social-link"><i className="fab fa-twitter" /></a>
                </div>
              </div>
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Community Guidelines</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="copyright">© 2024 Peak NYU. For night owls, by night owls.</p>
            <p className="age-notice">Age 18+ • Includes alcohol-related content</p>
          </div>
        </div>
      </footer>

      <ThemeToggle />
    </>
  );
}
