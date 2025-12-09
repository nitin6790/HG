import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

/**
 * Export warehouse logs to Excel file
 * @param {Object} params
 * @param {string} params.warehouseName - Name of the warehouse
 * @param {number} params.month - Month (1-12)
 * @param {number} params.year - Year
 * @param {Array} params.stockInLogs - Stock In transaction logs
 * @param {Array} params.stockOutLogs - Stock Out transaction logs
 * @returns {Promise<void>}
 */
export async function exportWarehouseLogsToXlsx({
  warehouseName = 'Warehouse',
  month = 1,
  year = 2025,
  stockInLogs = [],
  stockOutLogs = [],
}) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Format month name
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
    const monthName = monthNames[month - 1];
    const sheetName = `${monthName} ${year}`;

    // Build sheet data
    const sheetData = [];

    // Title
    sheetData.push([`Warehouse: ${warehouseName}`]);
    sheetData.push([`Period: ${monthName} ${year}`]);
    sheetData.push([]); // Empty row for spacing

    // Stock In Section
    sheetData.push(['STOCK IN']);
    sheetData.push(['Date', 'Item Name', 'Quantity']);

    if (stockInLogs.length > 0) {
      stockInLogs.forEach((log) => {
        const date = new Date(log.date).toLocaleDateString();
        sheetData.push([date, log.itemName, log.quantity]);
      });
    } else {
      sheetData.push(['No transactions', '', '']);
    }

    sheetData.push([]); // Empty row for spacing

    // Stock Out Section
    sheetData.push(['STOCK OUT']);
    sheetData.push(['Date', 'Item Name', 'Quantity']);

    if (stockOutLogs.length > 0) {
      stockOutLogs.forEach((log) => {
        const date = new Date(log.date).toLocaleDateString();
        sheetData.push([date, log.itemName, log.quantity]);
      });
    } else {
      sheetData.push(['No transactions', '', '']);
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 30 }, // Item Name
      { wch: 12 }, // Quantity
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

    // Generate Excel file
    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'base64',
    });

    // Create filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeWarehouseName = warehouseName.replace(/\s+/g, '_');
    const filename = `${safeWarehouseName}_Logs_${monthName}_${year}_${timestamp}.xlsx`;

    // Save to file system
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: 'base64',
    });

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Warehouse Logs',
    });
  } catch (error) {
    console.error('Error exporting warehouse logs to Excel:', error);
    throw error;
  }
}
