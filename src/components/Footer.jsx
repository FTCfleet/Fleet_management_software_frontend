import React from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../css/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div>
          <Link className="footer-title" to="/">
            Friends Transport Company
          </Link>
        </div>

        <div className="footer-row">
          <div>
            <h3>Quick Links</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <Link className="footer-links" to="/">
                  Home
                </Link>
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <Link className="footer-links" to="/track">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link className="footer-links" to="/about">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>Contact Us</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <FaPhone size={14} />
                <span>040-24614381</span>
              </div>
              <div className="footer-contact-item">
                <FaEnvelope size={14} />
                <a href="mailto:ftchydindia@gmail.com" style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none" }}>
                  ftchydindia@gmail.com
                </a>
              </div>
              <div className="footer-contact-item">
                <FaMapMarkerAlt size={14} />
                <span>Hyderabad, India</span>
              </div>
            </div>
          </div>

          <div>
            <h3>Business Hours</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "rgba(255,255,255,0.9)" }}>
              <li style={{ marginBottom: "0.25rem" }}>Monday - Saturday</li>
              <li style={{ marginBottom: "0.25rem" }}>9:00 AM - 7:00 PM</li>
              <li style={{ marginTop: "0.5rem", opacity: 0.7 }}>
                Sunday: Closed
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <span>© {currentYear} Friends Transport Company. All rights reserved.</span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>GST: 36AAFFF2744R1ZX</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
