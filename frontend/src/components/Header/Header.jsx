import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="header">
      <div className="header__left">
          <button
            className="profile-button"
            onClick={() => setIsOpen(!isOpen)}
            ref={buttonRef}
          >
            ☰
          </button>

          {isOpen && (
            <div className="dropdown-menu" ref={dropdownRef}>
              <button onClick={() => handleNavigation("/")}>Home</button>
              <button onClick={() => handleNavigation("/profile")}>Profile</button>
              <button onClick={() => handleNavigation("/settings")}>Settings</button>
            </div>
          )}
      </div>

      <div className="header__center">
        <h1 className="header__title" onClick={() => handleNavigation("/")}>Stock Room</h1>
      </div>
    </header>
  );
};

export default Header;
