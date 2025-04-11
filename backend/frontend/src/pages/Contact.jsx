import React from 'react';
import './css/Contact.css'; // Import the CSS file

const Contact = () => {
  return (
    <div className="about_container">
      {/* Header */}
      <header className="about_header">
        <h1>CONTACT US</h1>
        <p>Stay Refreshed, Stay Connected – Reach Out to Us!</p>
      </header>

      {/* Main Content */}
      <div className="about_main">
        {/* Form Section */}
        <form className="about_form">
          <input type="text" placeholder="Name" name="name" />
          <input type="email" placeholder="Email" name="email" />
          <textarea placeholder="Description" name="description"></textarea>
          <button type="submit">Submit</button>
        </form>

        {/* Contact Information Section */}
        <div className="about_info">
          <div className="about_item">
            <span>09XXXXXXXXX</span>
          </div>
          <div className="about_item">
            <span>Gary Salvacion</span>
          </div>
          <div className="about_item">
            <span>GarySalvacion@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;