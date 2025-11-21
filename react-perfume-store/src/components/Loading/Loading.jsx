// src/components/Loading/Loading.jsx
import React from "react";
import "./Loading.css";

const Loading = () => {
  return (
    <div className="loading-container">
      <svg className="sketch-filter" width="0" height="0">
        <defs>
          <filter id="sketch">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
          </filter>
          <filter id="rough-paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2">
              <feDistantLight azimuth="45" elevation="60"/>
            </feDiffuseLighting>
          </filter>
        </defs>
      </svg>
      <div className="spinner-sketch">
        <div className="spinner-circle"></div>
        <div className="spinner-hand"></div>
      </div>
      <div className="loading-text-sketch">
        <span>Loading</span>
        <span className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
};

export default Loading;
