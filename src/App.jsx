import { React, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Header from './components/Header'
import HomePage from './pages/HomePage'
import TrackShipmentPage from './pages/TrackShipmentPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgetPasswordPage from './pages/ForgetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AddOrderPage from './pages/AddOrderPage'
import Footer from './components/Footer'
import FAQPage from './pages/FAQPage'
import ErrorPage from './pages/ErrorPage'
import AuthTemplate from './pages/AuthTemplate'
// import 

import './App.css'

function App() {
  return (
    <>
      <BrowserRouter>
        <div className='main-box'>
          <Header />
          <Routes >
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/track" element={<TrackShipmentPage />} />
            <Route exact path="/about" element={<AboutPage />} />
            <Route exact path="/faq" element={<FAQPage />} />

            <Route path="/auth/*" element={<AuthTemplate />}>
              <Route exact path="login" element={<LoginPage />} />
              <Route exact path="register" element={<RegisterPage />} />
              <Route exact path="forget" element={<ForgetPasswordPage />} />
              <Route path = "*" element={<ErrorPage />} />
            </Route>
            <Route exact path="/dashboard" element={<DashboardPage />} />
            <Route exact path="/add" element={<AddOrderPage />} />
            <Route path="/*" element={<ErrorPage />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App
