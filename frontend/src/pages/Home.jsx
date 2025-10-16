import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="page home-page">
      <h2>Home</h2>
      <p>Welcome to the Stock Room home page.</p>
        <Link to="/hi" style={{ display: "inline-block", marginTop: "1rem", fontWeight: "bold" }}>
          Go to Example Page
        </Link>
    </div>
  );
};

export default Home;
