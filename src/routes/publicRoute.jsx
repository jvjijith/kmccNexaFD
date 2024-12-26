import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

function PublicRoute() {
  const navigate = useNavigate();
  const [userObj] = useLocalStorage("user", null);

  useEffect(() => {
    if (userObj && userObj.accessToken) {
      // If token exists, navigate to home
      navigate("/home");
    }
  }, [userObj, navigate]);

  return !userObj ? <Outlet /> : null;
}

export default PublicRoute;
