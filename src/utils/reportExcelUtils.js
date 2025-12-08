import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

/**
 * Parse date string to Date object
 */
function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  if (typeof dateInput === 'string') {
    return new Date(dateInput);
  }
  return new Date();
}

/**
 * Get year and month from a date
 * @param {Date|string} date
 * @returns {Object} { year: number, month: number }
 */
function getYearMonth(date) {
  const d = parseDate(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
}

/**
 * Group transactions by (year, month)
 * @param {Array} stockInEntries - Stock In items
 * @param {Array} stockOutEntries - Stock Out items (with outDates)
 * @param {string} [warehouseId] - Optional warehouse filter
 * @returns {Object} { "2025-01": { stockIn: [], stockOut: [] }, ... }
 */
export function groupTransactionsByMonth(
  stockInEntries = [],
  stockOutEntries = [],
  warehouseId = null
) {
  const monthGroups = {};

  // Process Stock In entries
  stockInEntries.forEach((item) => {
    if (warehouseId && item.warehouseId !== warehouseId) {
      return;
    }

    const { year, month } = getYearMonth(item.createdAt);
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;

    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = { stockIn: [], stockOut: [] };
    }

    monthGroups[monthKey].stockIn.push({
      itemName: item.name,
      quantity: item.quantity,
      date: item.createdAt,
    });
  });

  // Process Stock Out entries
  stockOutEntries.forEach((item) => {
    if (warehouseId && item.warehouseId !== warehouseId) {
      return;
    }

    // Each item can have multiple outDates
    if (item.outDates && item.outDates.length > 0) {
      item.outDates.forEach((outDate) => {
        const { year, month } = getYearMonth(outDate);
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;

        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = { stockIn: [], stockOut: [] };
        }

        monthGroups[monthKey].stockOut.push({
          itemName: item.name,
          quantity: item.outQuantity || 0,
          date: outDate,
        });
      });
    }
  });

  return monthGroups;
}

/**
 * Get previous month key
 * @param {string} monthKey - Format: "2025-01"
 * @returns {string} Previous month key
 */
function getPreviousMonthKey(monthKey) {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Calculate monthly report rows for a single month
 * @param {string} monthKey - Format: "2025-01"
 * @param {Object} monthData - { stockIn: [], stockOut: [] }
 * @param {Object} allMonthGroups - All month groups (for previous month lookup)
 * @returns {Array} Array of report rows
 */
function calculateMonthlyReportRows(monthKey, monthData, allMonthGroups) {
  const itemsMap = {};

  // Initialize with all items from this month
  monthData.stockIn.forEach((entry) => {
    if (!itemsMap[entry.itemName]) {
      itemsMap[entry.itemName] = {
        itemName: entry.itemName,
        currentStockIn: 0,
        currentStockOut: 0,
      };
    }
    itemsMap[entry.itemName].currentStockIn += entry.quantity;
  });

  monthData.stockOut.forEach((entry) => {
    if (!itemsMap[entry.itemName]) {
      itemsMap[entry.itemName] = {
        itemName: entry.itemName,
        currentStockIn: 0,
        currentStockOut: 0,
      };
    }
    itemsMap[entry.itemName].currentStockOut += entry.quantity;
  });

  // Calculate opening stock from previous month's closing
  const prevMonthKey = getPreviousMonthKey(monthKey);
  const prevMonthData = allMonthGroups[prevMonthKey];

  const prevClosingByItem = {};

  if (prevMonthData) {
    // Calculate previous month's closing for each item
    const prevItemsMap = {};

    prevMonthData.stockIn.forEach((entry) => {
      if (!prevItemsMap[entry.itemName]) {
        prevItemsMap[entry.itemName] = {
          itemName: entry.itemName,
          prevStockIn: 0,
          prevStockOut: 0,
        };
      }
      prevItemsMap[entry.itemName].prevStockIn += entry.quantity;
    });

    prevMonthData.stockOut.forEach((entry) => {
      if (!prevItemsMap[entry.itemName]) {
        prevItemsMap[entry.itemName] = {
          itemName: entry.itemName,
          prevStockIn: 0,
          prevStockOut: 0,
        };
      }
      prevItemsMap[entry.itemName].prevStockOut += entry.quantity;
    });

    // Calculate previous closing
    Object.values(prevItemsMap).forEach((item) => {
      const opening = 0; // Assume opening is 0 if no data before
      const closing = opening + item.prevStockIn - item.prevStockOut;
      prevClosingByItem[item.itemName] = Math.max(0, closing);
    });
  }

  // Build final rows
  const rows = Object.values(itemsMap).map((item) => {
    const openingStock = prevClosingByItem[item.itemName] || 0;
    const closingStock =
      openingStock + item.currentStockIn - item.currentStockOut;

    return {
      itemName: item.itemName,
      openingStock: Math.max(0, openingStock),
      stockIn: item.currentStockIn,
      stockOut: item.currentStockOut,
      closingStock: Math.max(0, closingStock),
    };
  });

  // Sort by item name
  rows.sort((a, b) => a.itemName.localeCompare(b.itemName));

  return rows;
}

/**
 * Build monthly report rows for all non-empty months
 * @param {Object} params
 * @param {Array} params.stockInEntries - All stock in items
 * @param {Array} params.stockOutEntries - All stock out items
 * @param {string} [params.warehouseId] - Optional warehouse filter
 * @returns {Object} { "2025-01": [...rows], "2025-02": [...rows], ... }
 */
export function buildMonthlyReportRowsForAllMonths({
  stockInEntries = [],
  stockOutEntries = [],
  warehouseId = null,
}) {
  const monthGroups = groupTransactionsByMonth(
    stockInEntries,
    stockOutEntries,
    warehouseId
  );

  // Calculate rows for each month
  const allMonthReports = {};

  Object.entries(monthGroups).forEach(([monthKey, monthData]) => {
    allMonthReports[monthKey] = calculateMonthlyReportRows(
      monthKey,
      monthData,
      monthGroups
    );
  });

  return allMonthReports;
}

/**
 * Format month key to readable month name
 * @param {string} monthKey - Format: "2025-01"
 * @returns {string} e.g., "January 2025"
 */
function formatMonthName(monthKey) {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = parseInt(monthStr, 10);
  return `${monthNames[month - 1]} ${yearStr}`;
}

/**
 * Export monthly report to Excel file
 * @param {Object} params
 * @param {Object} params.monthlyReportRows - { "2025-01": [...rows], ... }
 * @param {string} [params.warehouseName] - Warehouse name for filename
 * @returns {Promise<void>}
 */
export async function exportMonthlyReportToXlsx({
  monthlyReportRows = {},
  warehouseName = 'All_Warehouses',
}) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add a sheet for each month
    Object.entries(monthlyReportRows).forEach(([monthKey, rows]) => {
      if (!rows || rows.length === 0) {
        return; // Skip empty months
      }

      // Build array-of-arrays: headers + data rows
      const sheetData = [
        ['Item Name', 'Opening Stock', 'Stock In', 'Stock Out', 'Closing Stock'],
        ...rows.map((row) => [
          row.itemName,
          row.openingStock,
          row.stockIn,
          row.stockOut,
          row.closingStock,
        ]),
      ];

      // Create sheet
      const sheetName = formatMonthName(monthKey).substring(0, 31); // Sheet name max 31 chars
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Item Name
        { wch: 15 }, // Opening Stock
        { wch: 12 }, // Stock In
        { wch: 12 }, // Stock Out
        { wch: 15 }, // Closing Stock
      ];

      // Add sheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate Excel file
    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'base64',
    });

    // Create filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `HSGI_Report_${warehouseName}_${timestamp}.xlsx`;

    // Save to file system
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: 'base64',
    });

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Monthly Report',
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}
