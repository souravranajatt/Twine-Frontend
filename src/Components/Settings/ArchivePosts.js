import React from 'react';
import "../../Assets/Bundle/Settings.css";

function ArchivePosts() {
  return (
    <div className="archive-main-container settings-form">
      <div className="archive-header-container header-text-container">
        <h2 className="sf-section-title archive-section-title section-title">Archive</h2>
        <p className="archive-section-subtitle section-subtitle">
          View your archived posts. Only you can see what you've saved to your archive.
        </p>
      </div>

      <div className="archive-empty-state empty-state" style={{ marginTop: '50px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
        <p className="archive-empty-text empty-text">No archived posts yet.</p>
      </div>
    </div>
  );
}

export default ArchivePosts;