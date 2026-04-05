import React from "react";
import { AlertTriangle } from "lucide-react";
import "../ErrorCSS/ErrorPage.css";

export default function InternalErrorPage() {
  return (
    <div className="error-page-container">
      <div className="error-card">
        <AlertTriangle className="error-icon" />
        <h1 className="error-title">500 - Internal Server Error</h1>
        <p className="error-message">
          Something went wrong on our side. Please try again later.
        </p>

        <a href="/" className="error-btn">Go Home</a>
      </div>
    </div>
  );
}
