import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

//import scence
import Login from "./scenes/Login";
import Dashboard from "./scenes/Dashboard";
import Order from "./scenes/Order";
import OrderInfo from "./scenes/Order/OrderInfo";
import Contact from "./scenes/Contact";
import User from "./scenes/User";
import Project from "./scenes/Project";
import Quotation from "./scenes/Quotation";
import QuoteForm from "./scenes/Quotation/QuoteForm";
import ForgotPassword from "./scenes/ForgotPassword";
import Profile from "./scenes/Profile";

//import component
import Navbar from "./components/NavBar/Navbar";
import ProjectInfo from "./scenes/Project/ProjectInfo";
import PrivateRoute from "./components/Auth/PrivateRoute";
import LoginRoute from "./components/Auth/LoginRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/login"
            element={
              <LoginRoute>
                <Login />
              </LoginRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <LoginRoute>
                <ForgotPassword />
              </LoginRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute path="dashboard">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/order"
            element={
              <PrivateRoute path="order">
                <Order />
              </PrivateRoute>
            }
          />
          <Route
            path="/order/:order_id"
            element={
              <PrivateRoute path="order">
                <OrderInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute path="contact">
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact/:subPages"
            element={
              <PrivateRoute path="contact">
                <Contact />
              </PrivateRoute>
            }
          />

          <Route
            path="/contact/supplier/:supplier_id"
            element={
              <PrivateRoute path="contact">
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact/product/:product_id"
            element={
              <PrivateRoute path="contact">
                <Contact />
              </PrivateRoute>
            }
          />

          <Route
            path="/user"
            element={
              <PrivateRoute path="user">
                <User />
              </PrivateRoute>
            }
          />
          <Route
            path="/project"
            element={
              <PrivateRoute path="project">
                <Project />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:project_id"
            element={
              <PrivateRoute path="project">
                <ProjectInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotation"
            element={
              <PrivateRoute path="quotation">
                <Quotation />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotation/new-quote"
            element={
              <PrivateRoute path="quotation">
                <QuoteForm datas={{ isNew: true, isQuote: true }} />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotation/:quote_id"
            element={
              <PrivateRoute path="quotation">
                <QuoteForm datas={{ isNew: false, isQuote: true }} />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute path="profile">
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="*"
            element={
              <PrivateRoute path="dashboard">
                <Navigate to="/" />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
