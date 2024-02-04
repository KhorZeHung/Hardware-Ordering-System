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
import ProjectInfo from "./scenes/Project/ProjectInfo";
import PrivateRoute from "./components/Auth/Auth";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/order"
            element={
              <PrivateRoute>
                <Order />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          {/* sub pages ofr contact, new contact, new product */}
          <Route
            path="/contact/supplier/:supplier_id"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact/product/:product_id"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />

          <Route
            path="/user"
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            }
          />
          <Route
            path="/project"
            element={
              <PrivateRoute>
                <Project />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:project_id"
            element={
              <PrivateRoute>
                <ProjectInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotation"
            element={
              <PrivateRoute>
                <Quotation />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotation/new-quote"
            element={
              <PrivateRoute>
                <NewQuote
                  datas={{ endPoint: null, isNew: true, isQuote: true }}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <PrivateRoute>
                <Notification />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <PrivateRoute>
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
