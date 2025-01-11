import React, { useState } from "react";
// import "./App.css";
import backImg from '../assets/back2.jpg'
import cardImg from '../assets/card.jpg'
import workImg from '../assets/workflow.jpg'
import { Typography, Button } from "@mui/material";
import {Link} from "react-router-dom";

const HomePage = () => {
  return (
    <div className='app' >
      <div style={{
        background: `url(${backImg})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100vh',
        textAlign: 'left',
        alignItems: 'left'
      }}>
        <div style={{ margin: '20px', padding: '10vw' }}>
          <Typography variant='h2'
            sx={{
              marginTop: '-40px',
              color: 'white',
            }}
          >We Transport anything<br />anywhere!</Typography>
          <Link to='/about'>
          <button className="button-element" style={{ width: '10%' }}>Know More</button>
          </Link>
        </div>
      </div>
      <div style={{backgroundColor: '#efefef', padding: '100px'}}>
        <h1><center>Our Services</center></h1>
        <div>
          <div className="card-container">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="card">
                <div className="card-image">
                  <img
                    src={cardImg} // Replace with actual image URL
                    alt="Card"
                  />
                </div>
                <div className="card-footer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{paddingTop: '50px', paddingBottom: '150px'}}>
        <h1><center>HOW DOES IT WORK</center></h1>
          <img
            src={workImg} // Replace with actual image URL
            alt="Card"
            width='100%'
          />
        </div>

    </div>
  );
};

export default HomePage;
