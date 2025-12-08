/**
 * Get the first and last day of a given month/year
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (1-12, Jan=1, Dec=12)
 * @returns {Object} { startDate: Date, endDate: Date }
 */
export function getMonthRange(year, month) {
  const startDate = new Date(year, month - 1, 1); // First day of month
  const endDate = new Date(year, month, 0); // Last day of month
  return { startDate, endDate };
}

/**
 * Get the previous month and year
 * @param {number} year - Current year
 * @param {number} month - Current month (1-12)
 * @returns {Object} { prevYear: number, prevMonth: number }
 */
export function getPreviousMonth(year, month) {
  if (month === 1) {
    return { prevYear: year - 1, prevMonth: 12 };
  }
  return { prevYear: year, prevMonth: month - 1 };
}

/**
 * Parse date string to Date object
 * Handles ISO format, YYYY-MM-DD, and other common formats
 * @param {string|Date} dateInput - Date as string or Date object
 * @returns {Date}
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
 * Check if a date falls within a range
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {boolean}
 */
function isDateInRange(date, startDate, endDate) {
  return date >= startDate && date <= endDate;
}

/**
 * Calculate monthly report with carry-forward logic
 * @param {Object} params
 * @param {Array} params.items - Item objects from ItemContext
 * @param {number} params.year - Year to report
 * @param {number} params.month - Month to report (1-12)
 * @param {string} [params.warehouseId] - Optional warehouse filter
 * @returns {Array} Array of report rows with monthly data
 */
export function calculateMonthlyReport({
  items = [],
  year,
  month,
  warehouseId = null,
}) {
  if (!items || items.length === 0) {
    return [];
  }

  // Get current month range
  const { startDate, endDate } = getMonthRange(year, month);

  // Get previous month range
  const { prevYear, prevMonth } = getPreviousMonth(year, month);
  const { startDate: prevStart, endDate: prevEnd } = getMonthRange(
    prevYear,
    prevMonth
  );

  // Group items by unique name
  const itemsByName = {};

  items.forEach((item) => {
    // Filter by warehouse if provided
    if (warehouseId && item.warehouseId !== warehouseId) {
      return;
    }

    const itemName = item.name;

    if (!itemsByName[itemName]) {
      itemsByName[itemName] = {
        itemName,
        currentInQuantity: 0,
        currentOutQuantity: 0,
        previousClosingStock: 0,
      };
    }

    // Parse item dates
    const itemCreatedDate = parseDate(item.createdAt);
    const itemUpdatedDate = parseDate(item.updatedAt);

    // Current month: Stock In (from item.quantity and creation date)
    if (isDateInRange(itemCreatedDate, startDate, endDate)) {
      itemsByName[itemName].currentInQuantity += item.quantity;
    }

    // Current month: Stock Out (from item.outQuantity if exists)
    if (item.outQuantity && item.outQuantity > 0) {
      if (item.outDates && item.outDates.length > 0) {
        // Count how many stock outs fall in current month
        const currentMonthOutCount = item.outDates.filter((outDate) => {
          const parsedOutDate = parseDate(outDate);
          return isDateInRange(parsedOutDate, startDate, endDate);
        }).length;

        // Distribute stock out quantity proportionally
        // For simplicity, if there are multiple out dates in current month,
        // we count all stock outs that happen in this month
        if (currentMonthOutCount > 0) {
          itemsByName[itemName].currentOutQuantity += item.outQuantity;
        }
      }
    }

    // Previous month: Calculate closing stock
    // This is used as opening stock for current month
    let prevTotalIn = 0;
    let prevTotalOut = 0;

    // Check if item existed in previous month
    const itemCreatedInPrevMonth = isDateInRange(
      itemCreatedDate,
      prevStart,
      prevEnd
    );

    if (itemCreatedInPrevMonth) {
      prevTotalIn = item.quantity;
    }

    // Stock outs in previous month
    if (item.outQuantity && item.outQuantity > 0 && item.outDates) {
      const prevMonthOutCount = item.outDates.filter((outDate) => {
        const parsedOutDate = parseDate(outDate);
        return isDateInRange(parsedOutDate, prevStart, prevEnd);
      }).length;

      if (prevMonthOutCount > 0) {
        prevTotalOut += item.outQuantity;
      }
    }

    // Previous closing = prev opening (0 for first month) + prev in - prev out
    const prevOpening = 0; // Assume opening stock is 0 if no data before
    const prevClosing = prevOpening + prevTotalIn - prevTotalOut;

    itemsByName[itemName].previousClosingStock = Math.max(0, prevClosing);
  });

  // Build report rows
  const rows = Object.values(itemsByName).map((item) => {
    const openingStock = item.previousClosingStock;
    const stockIn = item.currentInQuantity;
    const stockOut = item.currentOutQuantity;
    const closingStock = openingStock + stockIn - stockOut;

    return {
      itemName: item.itemName,
      openingStock: Math.max(0, openingStock),
      stockIn,
      stockOut,
      closingStock: Math.max(0, closingStock),
    };
  });

  // Sort by item name
  rows.sort((a, b) => a.itemName.localeCompare(b.itemName));

  return rows;
}

/**
 * Get array of months for dropdown
 * @returns {Array} Array of { value: number, label: string }
 */
export function getMonthOptions() {
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

  return monthNames.map((label, index) => ({
    value: index + 1,
    label,
  }));
}

/**
 * Get array of years for dropdown (current year ± 2 years)
 * @returns {Array} Array of years
 */
export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string}
 */
export function formatDateString(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
