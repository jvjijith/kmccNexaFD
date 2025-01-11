import React, { useState } from 'react';
import Icon from '../ui/icon/icon';
import IconButton from '../ui/icon/iconButton';
import Card from '../ui/card/card';
import { useSidebar } from '../../context/sidebar.context';
import { useNavigate } from "react-router";
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useGetData } from '../../common/api';

function ComingSoonCard({children,title}) {
  
  const navigate = useNavigate();
  const {toggleSidebar} = useSidebar();
  const [userObj, setUserObj, clearUser] = useLocalStorage("user", null);
      const { data: employeeData, refetch: refetchEmployees } = useGetData("employee", `/employee/user/${userObj?.uid}`);
      const [isDropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown
    
      const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
    
      const getInitials = (name) => {
        if (!name) return "NA"; // Handle cases where name might be null or undefined
        const words = name.split(" ");
        const firstInitial = words[0]?.[0] || ""; // First letter of the first word
        const secondInitial = words[1]?.[0] || ""; // First letter of the second word (if exists)
        return firstInitial + secondInitial; // Combine initials
      };
    
      const handleLogout = () => {
        clearUser();
        navigate("/login");
      };
    return (
        <div className="flex w-full">
              <div className="w-full h-screen hidden sm:block sm:w-20 xl:w-60 flex-shrink-0">
          .
        </div>
            <div className="h-screen flex-grow overflow-x-hidden overflow-auto flex flex-wrap content-start p-2">
            <div className="w-full sm:flex p-2 items-end">
            <div className="sm:flex-grow flex justify-between">
              <div className="">
                <div className="flex items-center">
                  {/* <div className="text-3xl font-bold text-text-color"></div> */}
                  
                </div>
             {/*    <div className="flex items-center">
                  <Icon
                    path="res-react-dash-date-indicator"
                    className="w-3 h-3"
                  />
                  <div className="ml-2">Dashboard/ Add Customer</div>
                </div> */}
              </div>
              <IconButton
                icon="res-react-dash-sidebar-open"
                className="block sm:hidden"
                onClick={toggleSidebar}
              />
            </div>
            <div className="relative">
  <div
    onClick={toggleDropdown}
    className="flex items-center gap-4 cursor-pointer"
  >
    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
      <span className="font-medium text-gray-600 dark:text-gray-300">
        {getInitials(employeeData?.name)}
      </span>
    </div>

    <div className="font-medium dark:text-white">
      <div>{employeeData?.name}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {employeeData?.email}
      </div>
    </div>
  </div>

  {/* Dropdown */}
  {isDropdownOpen && (
    <div
      id="userDropdown"
      className="absolute z-10 mt-2 top-full right-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
    >
      {/* <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        <div>{employeeData?.name}</div>
        <div className="font-medium truncate">{employeeData?.email}</div>
      </div> */}
      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
        <li>
          <a
            href="#"
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            Dashboard
          </a>
        </li>
        {/* <li>
          <a
            href="#"
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            Settings
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            Earnings
          </a>
        </li> */}
      </ul>
      <div className="py-1">
        <a
            onClick={handleLogout}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
        >
          Sign out
        </a>
      </div>
    </div>
  )}
</div>
          </div>

          
           <Card title={title}
           component={
            <button className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={() => navigate('/addContact')}>
              Add Contacts
            </button>
          }>
               {children}
               
            </Card>
            </div>

        </div>
    );
}

export default ComingSoonCard;