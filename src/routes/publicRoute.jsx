import React, { useEffect,useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import verifyToken from "../utils/verifyToken";
import LoadingScreen from "../layout/ui/loading/loading";

function PublicRoute() {
  const navigate = useNavigate();
  const [userObj, setUserObj] = useLocalStorage("user", null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (userObj && userObj?.accessToken) {
        const isAuthenticated = await verifyToken(userObj.accessToken);

        if (isAuthenticated) {
          // Token is not verified, redirect to login
          navigate("/home");
        }
        else
        {
          setUserObj(null);
        }
        setIsLoading(false);
      } 
    };

    checkAuthentication();
  }, [userObj, navigate]);

  return !userObj ? <Outlet /> : null;
}

export default PublicRoute;
