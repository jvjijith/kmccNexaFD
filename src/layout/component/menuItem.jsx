import { useState } from "react";
import SidebarIcons from "../ui/icon/sidebarIcons";
import clsx from "clsx";
import { useLocation, useNavigate } from "react-router";

export default function MenuItem({ item }) {
  const { id, title, notifications, route, parent, dropdownItems } = item;
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleItemClick = () => {
    if (dropdownItems && dropdownItems.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      navigate(route);
    }
  };

  const isSelected = pathname === route || pathname.startsWith(parent);

  return (
    <div className="relative w-full">
      <div
        className={clsx(
          'w-full mt-6 flex items-center px-3 sm:px-0 xl:px-3 justify-start sm:justify-center xl:justify-start sm:mt-6 xl:mt-3 cursor-pointer',
          isSelected ? 'sidebar-item-selected' : 'sidebar-item text-white'
        )}
        onClick={handleItemClick}
      >
        <SidebarIcons id={id} />
        <div className="block sm:hidden xl:block ml-2">{title}</div>
        <div className="block sm:hidden xl:block flex-grow" />
        {dropdownItems && dropdownItems.length > 0 && (
          <div className="flex sm:hidden xl:flex items-center justify-center ml-2">
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
        {notifications && !dropdownItems && (
          <div className="flex sm:hidden xl:flex bg-pink-600 w-5 h-5 flex items-center justify-center rounded-full mr-2">
            <div className="text-white text-sm">{notifications}</div>
          </div>
        )}
      </div>
      {isDropdownOpen && dropdownItems && (
        <div className="mt-2 w-full bg-sidebar-card-top shadow-lg z-10">
          {dropdownItems.map((dropdownItem) => (
            <MenuItem key={dropdownItem.route} item={dropdownItem} />
          ))}
        </div>
      )}
    </div>
  );
}
