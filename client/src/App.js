import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./scenes/Login";
import Dashboard from "./scenes/Dashboard";
import Order from "./scenes/Order";
import Contact from "./scenes/Contact";
import User from "./scenes/User";
import Project from "./scenes/Project";
import Quotation from "./scenes/Quotation";
import Notification from "./scenes/Notification";
import Navbar from "./components/NavBar/Navbar";
import NewQuote from "./scenes/Quotation/NewQuote";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          {/* sub pages ofr contact, new contact, new product */}
          <Route path="/contact/supplier/:supplier_id" element={<Contact />} />
          <Route path="/contact/product/:product_id" element={<Contact />} />

          <Route path="/user" element={<User />} />
          <Route path="/project" element={<Project />} />
          <Route path="/quotation" element={<Quotation />} />
          <Route path="/quotation/new-quote" element={<NewQuote />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
