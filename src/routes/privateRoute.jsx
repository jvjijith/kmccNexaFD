import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import LoadingScreen from "../layout/ui/loading/loading";

function ProtectedRoute() {
  const navigate = useNavigate();
  const [userObj] = useLocalStorage("user", null);

  useEffect(() => {
    if (!userObj || !userObj.accessToken) {
      // If token is not present, navigate to login
      navigate("/login");
    }
  }, [userObj, navigate]);

  // Show a loading screen until the navigation occurs
  if (!userObj || !userObj.accessToken) {
    return <LoadingScreen />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
