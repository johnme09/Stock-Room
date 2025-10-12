import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="profile-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            <button onClick={() => handleNavigation("/")}>Home</button>
            <button onClick={() => handleNavigation("/profile")}>Profile</button>
            <button onClick={() => handleNavigation("/settings")}>Settings</button>
          </div>
        )}
      </div>

      <div className="header__center" onClick={() => handleNavigation("/")}>
        <h1 className="header__title">Stock Room</h1>
      </div>
    </header>
  );
};

export default Header;
