import React from "react";
import { RiTwitterXLine } from "react-icons/ri";
import { CiFacebook } from "react-icons/ci";
import { RxInstagramLogo } from "react-icons/rx";
import '../css/footer.css'

/* SVG for footer background
<svg width="1440" height="685" viewBox="0 0 1440 685" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H1440V685H0V0Z" fill="url(#paint0_linear_13_17)"/>
<defs>
<linearGradient id="paint0_linear_13_17" x1="700.779" y1="-2.05121" x2="602.009" y2="701.428" gradientUnits="userSpaceOnUse">
<stop offset="0.229765" stop-color="#1D3557"/>
<stop offset="1" stop-color="#10223C"/>
</linearGradient>
</defs>
</svg>
*/

const Footer = () => {

    return (
        <footer style={{ position: 'relative', overflow: 'hidden', color: '#fff', textAlign: "left" }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 685"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}
            >
                <path
                    d="M0 0H1440V685H0V0Z"
                    fill="url(#paint0_linear_13_17)"
                />
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

            <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '100%' }}>
                    <a style={{ fontSize: '4rem', width: 'max-content' }} href='/'>
                        Friends Transport
                    </a>
                </div>

                <div style={{ width: '80%', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                    <div>
                        <h3>Quick Links</h3>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '-20px 0' }}>
                            <li><a className="footer-links" href='/' style={{fontWeight: 'none'}} >Home</a></li>
                            <li><a className="footer-links" href='/track' >Track Shipment</a></li>
                            <li><a className="footer-links" href='/about' >About Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3>Contact Information</h3>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '-20px 0' }}>
                            <li>Phone Number: +91 98765 43210</li>
                            <li>Email Address: <a className="footer-links" href='mailto: support@yourwebsite.com' >support@yourwebsite.com</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3>Follow Us</h3>
                        <div style={{ borderTop: '1px solid #5fa6d4', margin: '-20px 0' }}></div>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '30px 0' }}>
                            <li>
                                <CiFacebook size="1.9rem" style={{ marginRight: '10px' }} />
                                <RxInstagramLogo size="1.8rem" style={{ marginRight: '10px' }} />
                                <RiTwitterXLine size="1.2rem" style=
                                    {{
                                        marginRight: '10px',
                                        borderRadius: '100%',
                                        border: '1.5px solid white',
                                        padding: '4px'
                                    }} />
                            </li>

                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '5px solid #5fa6d4', margin: '20px 0' }}></div>

                {/* Terms and Conditions, Estd Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ marginTop: '-30px' }}>Terms & Conditions</div>
                    <div style={{ marginTop: '-30px' }}>2025 Your Friends Transport.</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ marginTop: '-20px' }}>Privacy & Cookie Statement</div>
                    <div style={{ marginTop: '-20px' }}>All rights reserved.</div>
                </div>
            </div>
        </footer>
    );

};

export default Footer;
