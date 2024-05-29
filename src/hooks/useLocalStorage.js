import { useState } from "react";

export const useLocalStorage = (keyName, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = window.localStorage.getItem(keyName);
      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  });

  const setValue = (newValue) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {
      console.error("Error setting localStorage key:", err);
    }
    setStoredValue(newValue);
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(keyName);
    } catch (err) {
      console.error("Error removing localStorage key:", err);
    }
    setStoredValue(defaultValue);
  };

  return [storedValue, setValue, removeValue];
};
