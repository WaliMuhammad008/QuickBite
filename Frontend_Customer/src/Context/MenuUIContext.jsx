import React, { createContext, useContext, useState } from "react";

const MenuUIContext = createContext(null);

export const MenuUIProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <MenuUIContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </MenuUIContext.Provider>
  );
};

export const useMenuUI = () => {
  const context = useContext(MenuUIContext);
  if (!context) {
    return {
      searchTerm: "",
      setSearchTerm: () => {},
      isSidebarOpen: true,
      setIsSidebarOpen: () => {},
      toggleSidebar: () => {},
    };
  }
  return context;
};

export default MenuUIContext;
