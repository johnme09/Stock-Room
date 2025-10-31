import React from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/styles/main.scss";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Collection from "./pages/Collection";
import PersonalCollection from "./pages/PersonalCollection";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <div>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/collection/:id" element={<Collection />} />
          <Route path="/collection/personal" element={<PersonalCollection />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
