import React from "react";
import "./Loader.css";

function Loader({ fullScreen = true }) {
  return (
    <div className={`twine-loader-wrapper ${fullScreen ? "fullscreen" : "container"}`}>
      <div className="twine-loader-card">
        <div className="twine-loader-logo-container">
          <svg className="twine-loader-svg" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
            <g className="twine-rings-group">
              {/* Left Ring (Brand Dark) */}
              <circle
                className="twine-ring ring-left"
                cx="45"
                cy="35"
                r="18"
                stroke="#111010"
                strokeWidth="4.5"
                fill="none"
              />
              {/* Right Ring (Brand Pink #F0186E) */}
              <circle
                className="twine-ring ring-right"
                cx="71"
                cy="35"
                r="18"
                stroke="#F0186E"
                strokeWidth="4.5"
                fill="none"
              />
              {/* Overlapping arc of Left Ring to interlock them */}
              <path
                className="twine-ring-overlap"
                d="M 61 26.75 A 18 18 0 0 0 41.5 17.35"
                stroke="#111010"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>
        <h1 className="twine-loader-brand">
          <span className="brand-t">T</span>
          <span className="brand-wine">wine</span>
        </h1>
      </div>
    </div>
  );
}

export default Loader;
