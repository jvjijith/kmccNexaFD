import React from "react";
import Sidebar from "../ui/sidebar/sidebar";
import { SidebarProvider } from "../../context/sidebar.context";

function Container({ children }) {
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        {children}
      </div>
    </SidebarProvider>
  );
}

export default Container;
