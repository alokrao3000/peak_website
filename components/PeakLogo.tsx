import Image from 'next/image';

interface PeakLogoProps {
  /** Size of the logo in pixels (square). Default 56. */
  size?: number;
  /** Show "PEAK" wordmark next to the icon. Default true on landing, false in nav. */
  showWordmark?: boolean;
  /** Optional link wrapper (e.g. href="/") */
  href?: string;
  /** Extra class for the wrapper */
  className?: string;
}

export default function PeakLogo({
  size = 56,
  showWordmark = true,
  href,
  className = '',
}: PeakLogoProps) {
  const content = (
    <>
      <span className="peak-logo-icon" style={{ width: size, height: size }}>
        <Image
          src="/peak-logo.png"
          alt=""
          width={size}
          height={size}
          priority
          aria-hidden
        />
      </span>
      {showWordmark && (
        <span className="peak-logo-wordmark">PEAK</span>
      )}
    </>
  );

  const wrapperClass = `peak-logo ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={wrapperClass}>
        {content}
      </a>
    );
  }

  return <span className={wrapperClass}>{content}</span>;
}
