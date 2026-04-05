import React from "react";
import { AlertTriangle } from "lucide-react";
import "../ErrorCSS/ErrorPage.css";

export default function NotFoundPage() {
  return (
    <div className="error-page-container">
      <div className="error-card">
        <AlertTriangle className="error-icon" />
        <h1 className="error-title">404 - Page Not Found</h1>
        <p className="error-message">
          The page you are looking for doesn't exist or the URL is incorrect.
        </p>

        <a href="/" className="error-btn">Go Home</a>
      </div>
    </div>
  );
}
