import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMasterData } from '../services/masterDataService';

const MasterDataContext = createContext();

export const MasterDataProvider = ({ children }) => {
  const [masterData, setMasterData] = useState({
    regionData: {},
    departments: {},
    sectors: [],
    categories: [],
    payLevels: [],
    modeOfSelection: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMasterData();
      setMasterData(data || {
        regionData: {},
        departments: {},
        sectors: [],
        categories: [],
        payLevels: [],
        modeOfSelection: []
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch master data:', err);
      setError('Failed to load configuration data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Standardized transformations
  const getZoneList = useCallback(() => {
    return Object.keys(masterData.regionData || {}).map(name => ({
      label: `${name} ${masterData.regionData[name]?.code ? `(${masterData.regionData[name].code})` : ''}`.trim(),
      value: name
    }));
  }, [masterData.regionData]);

  const getDeptList = useCallback(() => {
    return Object.keys(masterData.departments || {});
  }, [masterData.departments]);

  const value = {
    ...masterData,
    loading,
    error,
    refreshData,
    getZoneList,
    getDeptList
  };

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};
