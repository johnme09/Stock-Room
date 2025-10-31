import React from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/styles/main.scss";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ExamplePage from "./pages/ExamplePage";
import CommunityPage from "./pages/CommunityPage";

function App() {
  return (
    <div>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/new" element={<ExamplePage />} />
          <Route path="/community1" element={<CommunityPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
