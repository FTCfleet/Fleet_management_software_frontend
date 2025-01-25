import React from "react";
// import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="app">
      <div className="about-section">
        <h2 className="title">Daily Parcel Service</h2>
        <p className="description">
          We offer daily parcel delivery services to key locations, ensuring that your packages reach their destinations on time. Our dedicated team ensures every parcel is handled with care and reaches its destination securely.
        </p>

        <div className="warehouses-section">
          <div className="source-warehouses">
            <h3 className="sub-title">Source Warehouses</h3>
            <ul>
              <li>Head Office, Old Feel Khana, Hyderabad - Phone: 9876543210</li>
              <li>Branch Office, Near M. Alam Filter, Bahadurpura, Hyderabad - Phone: 9876543211</li>
              <li>Nallagutta, Ramagundam, Secunderabad - Phone: 9876543212</li>
            </ul>
          </div>

          <div className="destination-warehouses">
            <h3 className="sub-title">Destination Warehouses</h3>
            <ul>
              <li>Karimnagar - Phone: 9876543213</li>
              <li>Sultanabad - Phone: 9876543214</li>
              <li>Peddapally - Phone: 9876543215</li>
              <li>Ramagundam (NTPC & FCI) - Phone: 9876543216</li>
              <li>Godavari Khani - Phone: 9876543217</li>
              <li>MNCL - Phone: 9876543218</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
