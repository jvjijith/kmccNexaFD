import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ErrorPage from "../pages/error/errorPage";
import LoadingScreen from "../layout/ui/loading/loading";
import { useGetData } from "../common/api";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function UserTeamPermissionsPage({ requiredModule, permission, page }) {
  
  const [hasAccess, setHasAccess] = useState(null); // null indicates loading state
  const navigate = useNavigate();
  const [userObj, setUserObj, clearUser] = useLocalStorage("user", null);


  const { data: permissionData, isLoading: isPermissionsLoading } = useGetData(
    "permission",
    "/user-team-permissions/employees/permissions",
    {}
  );
  const { data: employeeData, isLoading: isEmployeesLoading } = useGetData(
    "employee",
    `/employee/user/${userObj?.uid}`,
    {}
  );

  useEffect(() => {
    if (!isPermissionsLoading && permissionData) {
      const isModuleAllowed = permissionData.some((item) => {
        // Check if the user is in empAllowed
        const isUserAllowed = item.empAllowed.some((emp) => emp._id === employeeData?._id);
  
        if (!isUserAllowed) {
          return false; // Skip this entry if the user is not in empAllowed
        }
  
        // Check for module and operation permissions within this specific user's data
        return item.allowedModules.some(
          (module) =>
            module.moduleId.moduleCode === requiredModule &&
            module.allowedOperations.includes(permission)
        );
      });
  
      setHasAccess(isModuleAllowed);
  
      if (!isModuleAllowed) {
        navigate("/error"); // Redirect if access is denied
      }
    }
  }, [isPermissionsLoading, permissionData, requiredModule, permission, userObj?.uid, navigate]);

  if (isPermissionsLoading || hasAccess === null) {
    return <LoadingScreen />;
  }

  if (!hasAccess) {
    return <ErrorPage />;
  }

  // Render the intended page if access is granted
  return page;
}
