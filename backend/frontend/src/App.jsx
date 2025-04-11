import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";

import RegisterForm from "./components/register/RegisterForm";


import LoginForm from "./components/register/LoginForm";

import Navbar from "./components/navbar/NavBar";

import OrderingPage from "./pages/ordering/OrderingPage";
import OrdersPage from "./pages/ordering/OrderPage";

import "./App.css";



function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shop_now" element={<OrderingPage />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/orders" element={<OrdersPage />} />
           
        </Routes>
      </div>
    </Router>
  );
}

export default App;
