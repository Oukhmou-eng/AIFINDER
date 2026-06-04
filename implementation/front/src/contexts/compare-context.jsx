import React, { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext(undefined);

const MAX_COMPARE_ITEMS = 3;

export function CompareProvider({ children }) {
  const [compareTools, setCompareTools] = useState([]);
  const [compareModels, setCompareModels] = useState([]);

  const canAddTool = compareTools.length < MAX_COMPARE_ITEMS;
  const canAddModel = compareModels.length < MAX_COMPARE_ITEMS;

  const addToolToCompare = useCallback((tool) => {
    setCompareTools(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.some(t => t.id === tool.id)) return prev;
      return [...prev, tool];
    });
  }, []);

  const removeToolFromCompare = useCallback((toolId) => {
    setCompareTools(prev => prev.filter(t => t.id !== toolId));
  }, []);

  const clearToolCompare = useCallback(() => {
    setCompareTools([]);
  }, []);

  const isToolInCompare = useCallback((toolId) => {
    return compareTools.some(t => t.id === toolId);
  }, [compareTools]);

  const addModelToCompare = useCallback((modelId) => {
    setCompareModels(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.includes(modelId)) return prev;
      return [...prev, modelId];
    });
  }, []);

  const removeModelFromCompare = useCallback((modelId) => {
    setCompareModels(prev => prev.filter(id => id !== modelId));
  }, []);

  const clearModelCompare = useCallback(() => {
    setCompareModels([]);
  }, []);

  const isModelInCompare = useCallback((modelId) => {
    return compareModels.includes(modelId);
  }, [compareModels]);

  const value = {
    compareTools,
    compareModels,
    addToolToCompare,
    removeToolFromCompare,
    clearToolCompare,
    isToolInCompare,
    addModelToCompare,
    removeModelFromCompare,
    clearModelCompare,
    isModelInCompare,
    canAddTool,
    canAddModel,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}