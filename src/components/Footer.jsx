import React from "react";
import { RiTwitterXLine } from "react-icons/ri";
import { CiFacebook } from "react-icons/ci";
import { RxInstagramLogo } from "react-icons/rx";
import { Link } from "react-router-dom";
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
                    {/* <Link to="/"> */}
                    <a style={{ fontSize: '4rem', width: 'max-content' }} href='/'>
                        Friends Transport
                    </a>
                    {/* </Link> */}
                </div>

                <div style={{ width: '80%', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                    <div>
                        <h3>Quick Links</h3>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '-20px 0' }}>
                            <li><a className="footer-links" href='/' style={{fontWeight: 'none'}} >Home</a></li>
                            <li><a className="footer-links" href='/track' >Track Shipment</a></li>
                            <li><a className="footer-links" href='/about' >About Us</a></li>
                            <li><a className="footer-links" href='/faq' >FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3>Contact Information</h3>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '-20px 0' }}>
                            <li>Phone Number: +91 98765 43210</li>
                            <li>Email Address: <a className="footer-links" href='mailto: support@yourwebsite.com' >support@yourwebsite.com</a></li>
                            <li>Warehouse Address:</li>
                            <li>Hyderabad: [Address]</li>
                            <li>Telangana: [Address]</li>
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

    /*

    return (
        <div className="footer-background-div"
            style={{
                width: '100%',
                position: 'relative',
            }}>
            <svg style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                marginTop: '0px'
            }} viewBox="0 0 1440 500" fill="none" xmlns="http://www.w3.org/2000/svg" >
                <path d="M0 0H1440V500H0V0Z" fill="url(#paint0_linear_13_17)" />
                <defs>
                    <linearGradient id="paint0_linear_13_17" x1="700.779" y1="-2.05121" x2="602.009" y2="701.428" gradientUnits="userSpaceOnUse">
                        <stop offset="0.229765" stopColor="#1D3557" />
                        <stop offset="1" stopColor="#10223C" />
                    </linearGradient>
                </defs>
            </svg>

            <Link to="/" className="footer-row">
                <Typography variant="h3" sx={
                    {
                        width: '100%',
                        marginLeft: '20px'
                    }
                }>
                    Friends Transport
                </Typography>
            </Link>
            {/* <div className="title-logo">CP/DSA Bootcamp</div>
                <div className="address">Organised in collaboration with CodeIIEST and GDSC IIEST</div> }
            <div className="footer-table" style={{ position: 'relative' }}>
                <div className="footer-table-column">
                    <a href="https://www.example1.com" target="_blank" rel="noopener noreferrer">Link 1</a>
                    <a href="https://www.example1.com" target="_blank" rel="noopener noreferrer">Link 1</a>
                </div>
                <div className="footer-table-column">
                    <a href="https://www.example2.com" target="_blank" rel="noopener noreferrer">Link 2</a>
                </div>
                <div className="footer-table-column">
                    <a href="https://www.example3.com" target="_blank" rel="noopener noreferrer">Link 3</a>
                </div>
                {/* </div> */}
{/*
                <div className="right-col">
                    <div className="title">Coordinators</div>
                    <div className="contacts">
                        <div className="contact">
                            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/ankita-tripathi-4ba5b1259">
                                <div className="name">Ankita Tripathi</div>
                            </a>

                            <div className="ph-num">Backend</div>
                        </div>
                        <div className="contact">
                            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/satyam-yadav-761b65268/">
                                <div className="name">Satyam Yadav</div>
                            </a>

                            <div className="ph-num">Coordinator</div>
                        </div>
                        <div className="contact">
                            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/shreyansh-srivastava-29b749250">
                                <div className="name">Shreyansh Srivastava</div>
                            </a>

                            <div className="ph-num">Coordinator</div>
                        </div>
                        <div className="contact">
                            <a target="_blank" rel="noopener noreferrer" href="#">
                                <div className="name">Anurag Chaurasia</div>
                            </a>

                            <div className="ph-num">Backend</div>
                        </div>
                        <div className="contact">
                            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/kiran-tikaraya-2a02bb264">
                                <div className="name">Kiran Tikaraya</div>
                            </a>

                            <div className="ph-num">Poster design</div>
                        </div>
                        <div className="contact">
                            <a href="https://www.linkedin.com/in/rohit-rahul-dey-018125249/" target="_blank" rel="noopener noreferrer">
                                <div className="name">Rohit Rahul Dey</div>
                            </a>
                            <div className="ph-num">Poster design</div>
                        </div>
                        <div className="contact">
                            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/sakshi-mishra-6b609a25b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
                                <div className="name">Sakshi Mishra</div>
                            </a>

                            <div className="ph-num">Graphic designing</div>
                        </div>
                    </div>
                </div>
                {/* <div className="social">
                    <div className="social-h">Stay in the loop?</div>
                    <div className="social-icons">
                        <a href="mailto: codeiiest.iiest@gmail.com">
                            <Email />
                        </a>
                        <a href="https://www.facebook.com/CodeIIEST">
                            <FB />
                        </a>
                        <a href="https://www.youtube.com/codeiiest">
                            <YouTube />
                        </a>
                        <a href="https://github.com/CodeIIEST-dev">
                            <Github />
                        </a>
                    </div>
                </div> }
            </div>
            {/* <div className="address">
                Made with <span style={{ color: "white" }}>💙</span> by <a className="makers" href="https://abhijit-karmakar.vercel.app/" target="_blank" rel="noopener noreferrer">Abhijit Karmakar</a> and {" "}
                <a href="https://soumyajit-dev.vercel.app/" target="_blank" rel="noopener noreferrer" className="makers">Soumyajit Karmakar</a>
            </div> }
        </div>
    );
    */
};

export default Footer;
