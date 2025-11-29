import React from "react";
import { Link } from "react-router-dom";
import "../css/footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 685"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="footer-svg"
      >
        <path d="M0 0H1440V685H0V0Z" fill="url(#paint0_linear_13_17)" />
        <defs>
          <linearGradient
            id="paint0_linear_13_17"
            x1="700.779"
            y1="-2.05121"
            x2="602.009"
            y2="701.428"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.229765" stopColor="#1D3557" />
            <stop offset="1" stopColor="#10223C" />
          </linearGradient>
        </defs>
      </svg>

      <div className="footer-content">
        <div>
          <a className="footer-title" href="/">
            Friends Transport Company
          </a>
        </div>

        <div className="footer-row">
          <div>
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a className="footer-links" href="/">
                  Home
                </a>
              </li>
              <li>
                <a className="footer-links" href="/track">
                  Track Shipment
                </a>
              </li>
              <li>
                <a className="footer-links" href="/about">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Contact Information</h3>
            <ul>
              <li>Phone: 040-24614381</li>
              <li>
                Email:{" "}
                <a
                  className="footer-links"
                  href="mailto:ftchydindia@gmail.com"
                >
                  ftchydindia@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <span>© 2025 Friends Transport Company. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
