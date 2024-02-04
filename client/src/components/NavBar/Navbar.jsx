import React, { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { getCookie } from "../../utils/cookie";

const Navbar = () => {
  const [openNavBar, setOpenNavBar] = useState(false);

  const navBarHandler = () => setOpenNavBar((prev) => !prev);
  const closeNavBarHandler = () => setOpenNavBar(false);

  const isLoggedIn = getCookie("token");

  return (
    isLoggedIn && (
      <>
        <div className="spaceBetween navBar">
          <div>
            <Link to="/" id="logo">
              LOGO
            </Link>
          </div>
          <div
            className={`hamburger ${openNavBar ? "open" : ""}`}
            onClick={navBarHandler}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div
            className={`center sideBar ${openNavBar ? "show" : ""}`}
            onClick={closeNavBarHandler}>
            <ul>
              <li onClick={closeNavBarHandler}>
                <NavLink id="dashboard" to="/">
                  Dashboard
                </NavLink>
              </li>
              {[
                "contact",
                "notification",
                "order",
                "quotation",
                "project",
                "user",
              ].map((section) => (
                <li onClick={closeNavBarHandler} key={section}>
                  <NavLink id={section} to={"/" + section}>
                    {section}
                  </NavLink>
                </li>
              ))}
              <li onClick={closeNavBarHandler}>
                <NavLink to="/login" id="logout">
                  Log out
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        <Outlet />
      </>
    )
  );
};

export default Navbar;
