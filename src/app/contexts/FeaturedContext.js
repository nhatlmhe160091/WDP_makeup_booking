'use client'
import { createContext, useContext, useState } from 'react';

const FeaturedContext = createContext();

export const FeaturedProvider = ({ children }) => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);

  const updateFeaturedServices = (services) => {
    setFeaturedServices(services);
  };

  const updateFeaturedArtists = (artists) => {
    setFeaturedArtists(artists);
  };

  return (
    <FeaturedContext.Provider 
      value={{ 
        featuredServices, 
        featuredArtists, 
        updateFeaturedServices, 
        updateFeaturedArtists 
      }}
    >
      {children}
    </FeaturedContext.Provider>
  );
};

export const useFeaturedContext = () => {
  const context = useContext(FeaturedContext);
  if (!context) {
    throw new Error('useFeaturedContext must be used within a FeaturedProvider');
  }
  return context;
};