import { createContext, useContext, useState } from 'react';

const IndustryContext = createContext();

export const IndustryProvider = ({ children }) => {
  const [industryData, setIndustryData] = useState([]);

  return (
    <IndustryContext.Provider value={{ industryData, setIndustryData }}>
      {children}
    </IndustryContext.Provider>
  );
};

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (!context) {
    // Return default values if provider is not available
    return { industryData: [], setIndustryData: () => {} };
  }
  return context;
};
