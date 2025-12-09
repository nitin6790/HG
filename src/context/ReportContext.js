import React, { createContext, useState } from 'react';
import { reportAPI } from '../api/client';

export const ReportContext = createContext();

export function ReportProvider({ children }) {
  const [monthlyReportData, setMonthlyReportData] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [warehouseLogsData, setWarehouseLogsData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Load monthly report
  const loadMonthlyReport = async (year, month, warehouseId = null) => {
    try {
      setReportLoading(true);
      setReportError(null);
      const data = await reportAPI.getMonthlyReport(year, month, warehouseId);
      setMonthlyReportData(Array.isArray(data) ? data : (data.data || []));
      return data;
    } catch (err) {
      console.error('Error loading monthly report:', err);
      setReportError(err.message);
      setMonthlyReportData([]);
      throw err;
    } finally {
      setReportLoading(false);
    }
  };

  // Load low-stock items
  const loadLowStockItems = async (warehouseId = null, threshold = 5) => {
    try {
      setReportLoading(true);
      setReportError(null);
      const data = await reportAPI.getLowStock(warehouseId, threshold);
      setLowStockData(Array.isArray(data) ? data : (data.data || []));
      return data;
    } catch (err) {
      console.error('Error loading low-stock items:', err);
      setReportError(err.message);
      setLowStockData([]);
      throw err;
    } finally {
      setReportLoading(false);
    }
  };

  // Load warehouse logs
  const loadWarehouseLogs = async (warehouseId) => {
    try {
      setReportLoading(true);
      setReportError(null);
      const data = await reportAPI.getWarehouseLogs(warehouseId);
      setWarehouseLogsData(Array.isArray(data) ? data : (data.data || []));
      return data;
    } catch (err) {
      console.error('Error loading warehouse logs:', err);
      setReportError(err.message);
      setWarehouseLogsData([]);
      throw err;
    } finally {
      setReportLoading(false);
    }
  };

  // Clear report data
  const clearReportData = () => {
    setMonthlyReportData([]);
    setLowStockData([]);
    setReportError(null);
  };

  const value = {
    // Data
    monthlyReportData,
    lowStockData,
    warehouseLogsData,
    reportLoading,
    reportError,

    // Methods
    loadMonthlyReport,
    loadLowStockItems,
    loadWarehouseLogs,
    clearReportData,
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}
