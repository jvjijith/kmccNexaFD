import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import verifyToken from "../utils/verifyToken";
import LoadingScreen from "../layout/ui/loading/loading";

function ProtectedRoute() {
  const navigate = useNavigate();
  const [userObj, setUserObj] = useLocalStorage("user", null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (userObj && userObj?.accessToken) {
        const isAuthenticated = await verifyToken(userObj?.accessToken);

        if (!isAuthenticated) {
          // Token is not verified, redirect to login

          navigate("/login");
        }
        setIsLoading(false);
      
      } else {
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [userObj?.accessToken, navigate]);

  if (isLoading) {
    // Render loading screen while authentication check is in progress
    return <LoadingScreen />;
  }

  return userObj ? <Outlet /> : null;
}

export default ProtectedRoute;
