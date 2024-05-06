import React, { createContext, useContext, useState } from 'react';

// Creating the SidebarContext
const SidebarContext = createContext();

// Creating a provider component for the SidebarContext
const SidebarProvider = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
 

  const toggleSidebar = () => {
    setShowSidebar((prevShowSidebar) => !prevShowSidebar);
  };



  return (
    <SidebarContext.Provider value={{ showSidebar, toggleSidebar}}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to access the SidebarContext
const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export { SidebarProvider, useSidebar };
