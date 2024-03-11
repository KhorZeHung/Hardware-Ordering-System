import React, { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { getCookie, deleteCookie } from "../../utils/cookie";
import { allowAccessLink } from "../../utils/allowAccessLink";

const Navbar = () => {
  const [openNavBar, setOpenNavBar] = useState(false);

  const navBarHandler = () => setOpenNavBar((prev) => !prev);
  const closeNavBarHandler = () => setOpenNavBar(false);

  const isTokenExist = () => {
    const token = getCookie("token");
    return !!token;
  };

  const logOutHandler = () => {
    deleteCookie("token");
    localStorage.clear();
    closeNavBarHandler();
    window.location.reload();
  };

  
  return (
    isTokenExist() && (
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
              {allowAccessLink().map((section) => (
                <li onClick={closeNavBarHandler} key={section}>
                  <NavLink id={section} to={"/" + section}>
                    {section}
                  </NavLink>
                </li>
              ))}
              <li onClick={closeNavBarHandler}>
                <NavLink to={"/profile"}>profile</NavLink>
              </li>
              <li onClick={logOutHandler} id="logout">
                Log out
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
