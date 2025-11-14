import React from 'react';

/**
 * Background component with decorative elements
 * Adds texture and visual interest to the page
 */
export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain opacity-30" />

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-paper via-paper to-paper opacity-100" />

      {/* Decorative brutalist shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-unassigned opacity-5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-partner-a opacity-3 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-partner-b opacity-3 rounded-full blur-3xl" />

      {/* Animated floating elements (optional) */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-concrete rounded-full opacity-20" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-concrete rounded-full opacity-15" />
      <div className="absolute bottom-1/4 right-20 w-2 h-2 bg-concrete rounded-full opacity-20" />
    </div>
  );
}
