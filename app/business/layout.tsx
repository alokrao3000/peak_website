import React from 'react';
import './business.css';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="business-page dark-theme" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
