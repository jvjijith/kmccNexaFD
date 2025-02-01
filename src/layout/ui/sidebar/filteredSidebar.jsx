import React from 'react';
import MenuItem from "../../component/menuItem";
import { sidebarItems } from "../../../constant";

const FilteredSidebar = ({ permissions }) => {
    const isAllowed = (requiredModule, permission) => {
      if (requiredModule === "dashboard") return true;
      return permissions?.some(item =>
        item.allowedModules.some(
          module =>
            module.moduleId.moduleCode === requiredModule &&
            module.allowedOperations.includes(permission)
        )
      );
    };
  
    const filterDropdownItems = (items) => {
      if (!items) return [];
  
      return items
        .map(item => {
          const hasPermission = isAllowed(item.requiredModule, item.permission);
  
          if (item.dropdownItems) {
            const filteredDropdown = filterDropdownItems(item.dropdownItems);
            return hasPermission || filteredDropdown.length > 0
              ? { ...item, dropdownItems: filteredDropdown }
              : null;
          }
  
          return hasPermission ? item : null;
        })
        .filter(Boolean);
    };
  
    const filteredItems = sidebarItems
      .map(section =>
        section
          .map(item => {
            const hasPermission = isAllowed(item.requiredModule, item.permission);
  
            if (item.dropdownItems) {
              const filteredDropdown = filterDropdownItems(item.dropdownItems);
              return hasPermission || filteredDropdown.length > 0
                ? { ...item, dropdownItems: filteredDropdown }
                : null;
            }
  
            return hasPermission ? item : null;
          })
          .filter(Boolean)
      )
      .filter(section => section.length > 0);
  
    return (
      <>
        {filteredItems.flat().map((item) => (
          <MenuItem
            key={item.id}
            item={item}
          />
        ))}
      </>
    );
  };
  
  export default FilteredSidebar;
  