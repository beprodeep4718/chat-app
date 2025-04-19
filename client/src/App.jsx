import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/useAuthStore";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authuser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const {theme} = useThemeStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  console.log({authuser});
  console.log({onlineUsers})
  if (isCheckingAuth && !authuser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authuser ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/signup" element={!authuser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!authuser ? <SignIn /> : <Navigate to="/" />} />
        <Route
          path="/settings"
          element={authuser ? <Settings /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={authuser ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;
