import React from "react";
import { Link } from "react-router-dom";
import CommunityCard from "../components/CommunityCard";

const sampleCommunity =
{
  id: "1",
  name: "Community1",
  description: "Description for community 1",
  photo: "https://via.placeholder.com/400",
  wantStatus: "have"
};


const Home = () => {
  return (
    <div className="page home-page">
      <h2>Home</h2>
      <p>Welcome to the Stock Room home page.</p>
      <Link to="/hi" style={{ display: "inline-block", marginTop: "1rem", fontWeight: "bold" }}>
        Go to Example Page
      </Link>
      <CommunityCard key={sampleCommunity.id} item={sampleCommunity} />
    </div>
  );
};

export default Home;
