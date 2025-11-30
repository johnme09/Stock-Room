import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.scss";
import { useAuth } from "../../context/AuthContext.jsx";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const firstMenuItemRef = useRef(null);
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleMenuToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    // Focus first menu item when opened
    firstMenuItemRef.current?.focus();

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
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const menuItems = user
    ? [
        { path: "/", label: "Home" },
        { path: "/profile", label: "Profile" },
        { path: "/settings", label: "Settings" },
        { label: "Log out", action: logout },
      ]
    : [
        { path: "/", label: "Home" },
        { path: "/login", label: "Login" },
        { path: "/signup", label: "Sign Up" },
      ];

  return (
    <header className="header" role="banner">
      <div className="header__left">
          <button
            className="profile-button"
            onClick={handleMenuToggle}
            onKeyDown={(e) => e.key === 'Enter' && handleMenuToggle()}
            ref={buttonRef}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
            type="button"
          >
            ☰
          </button>

          {isOpen && (
            <nav 
              className="dropdown-menu" 
              ref={dropdownRef}
              role="menu"
              aria-label="Main navigation"
            >
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                      setIsOpen(false);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (item.action) {
                        item.action();
                        setIsOpen(false);
                      } else if (item.path) {
                        handleNavigation(item.path);
                      }
                    }
                  }}
                  ref={index === 0 ? firstMenuItemRef : null}
                  role="menuitem"
                  aria-current={item.path && location.pathname === item.path ? 'page' : undefined}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
      </div>

      <div className="header__center">
        <h1 className="header__title" onClick={() => handleNavigation("/")}>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation("/");
            }}
            aria-label="Go to home page"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              font: 'inherit', 
              cursor: 'pointer',
              padding: 0,
              margin: 0
            }}
          >
            Stock Room
          </button>
        </h1>
      </div>

      {user && (
        <div className="header__right" aria-live="polite">
          <span>Hi, {user.username}</span>
        </div>
      )}
    </header>
  );
};

export default Header;
