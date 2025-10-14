import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header"; 
import "./assets/styles/main.scss";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/profile" element={<h2>Profile Page</h2>} />
        <Route path="/settings" element={<h2>Settings Page</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
