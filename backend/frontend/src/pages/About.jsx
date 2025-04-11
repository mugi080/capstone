import React from "react";
import logo from "../assets/logo.png";

import './css/About.css'

const About = () => {
  return (
    <div className="about">
    <h1>About Us</h1>
        
        <div className="about_us">
            <p>At Salvacion Garay Bottled Drink Distributor  , 
                we believe that every sip should be refreshing, 
                high-quality, and made with care. 
                We have been committed to providing a diverse range of beverages, 
                including bottled, canned, and plastic-packaged drinks, 
                to quench every thirst and fit every lifestyle.
            </p>
            <img src={logo} alt="BottleFlow Logo" />
        </div>
 
        <div className="mission">
            <h1 >Our mission</h1>
            <p>
                We focus on delivering beverages that are accessible, convenient, 
                and well-packaged for easy distribution. Our goal is to ensure a smooth and reliable supply of 
                bottled, canned, and plastic-packaged drinks to retailers, businesses, and consumers.
                We prioritize efficient service, timely deliveries, 
                and customer satisfaction while maintaining responsible packaging practices.

            </p>
        </div>
    </div>
  );
};

export default About;
