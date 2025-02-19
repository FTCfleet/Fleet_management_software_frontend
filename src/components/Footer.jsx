import React from "react";
import { RiTwitterXLine } from "react-icons/ri";
import { CiFacebook } from "react-icons/ci";
import { RxInstagramLogo } from "react-icons/rx";
import '../css/footer.css';

import { useMediaQuery, useTheme } from "@mui/material";

const Footer = () => {
    const theme = useTheme();
    const mobileView = useMediaQuery(theme.breakpoints.down(800));
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
                    <linearGradient id="paint0_linear_13_17" x1="700.779" y1="-2.05121" x2="602.009" y2="701.428" gradientUnits="userSpaceOnUse">
                        <stop offset="0.229765" stopColor="#1D3557" />
                        <stop offset="1" stopColor="#10223C" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="footer-content">
                <div>
                    <a className="footer-title" href='/'>
                        Friends Transport Company
                    </a>
                </div>

                <div className="footer-row">
                    <div>
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a className="footer-links" href='/'>Home</a></li>
                            <li><a className="footer-links" href='/track'>Track Shipment</a></li>
                            <li><a className="footer-links" href='/about'>About Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3>Contact Information</h3>
                        <ul>
                            <li>Phone: +91 98765 43210</li>
                            <li>Email: <a className="footer-links" href='mailto:support@yourwebsite.com'>support@yourwebsite.com</a></li>
                        </ul>
                    </div>
                    <div style={{paddingLeft:mobileView ? "0px" : "50px"}}>
                        <h3>Follow Us</h3>
                        <div className="footer-icons">
                            <CiFacebook className="social-icon" />
                            <RxInstagramLogo className="social-icon" />
                            <RiTwitterXLine className="social-icon twitter-icon" />
                        </div>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-bottom">
                    <span>Terms & Conditions</span>
                    <span>2025 Friends Transport Company</span>
                </div>
                <div className="footer-bottom">
                    <span>Privacy & Cookie Statement</span>
                    <span>All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
