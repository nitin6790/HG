import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';
import { WarehouseContext } from '../src/context/WarehouseContext';
import {
  calculateMonthlyReport,
  getMonthOptions,
  getYearOptions,
} from '../src/utils/reportUtils';
import { exportMonthlyReportToXlsx } from '../src/utils/reportExcelUtils';
import { buildMonthlyReportRowsForAllMonths } from '../src/utils/reportExcelUtils';

// Monthly Report: Item Name | Opening Stock | Stock In | Stock Out | Closing Stock
const COL_WIDTHS = {
  itemName: 140,
  opening: 100,
  stockIn: 100,
  stockOut: 100,
  closing: 100,
};

const TOTAL_WIDTH =
  COL_WIDTHS.itemName +
  COL_WIDTHS.opening +
  COL_WIDTHS.stockIn +
  COL_WIDTHS.stockOut +
  COL_WIDTHS.closing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  warehouseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  exportButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterControl: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  tableContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  // Header Row
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    height: 40,
  },
  headerCell: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  headerItemName: {
    width: COL_WIDTHS.itemName,
  },
  headerOpening: {
    width: COL_WIDTHS.opening,
  },
  headerStockIn: {
    width: COL_WIDTHS.stockIn,
  },
  headerStockOut: {
    width: COL_WIDTHS.stockOut,
  },
  headerClosing: {
    width: COL_WIDTHS.closing,
    borderRightWidth: 0,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  // Data Row
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    minHeight: 44,
  },
  dataCell: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  dataCellItemName: {
    width: COL_WIDTHS.itemName,
  },
  dataCellOpening: {
    width: COL_WIDTHS.opening,
  },
  dataCellStockIn: {
    width: COL_WIDTHS.stockIn,
  },
  dataCellStockOut: {
    width: COL_WIDTHS.stockOut,
  },
  dataCellClosing: {
    width: COL_WIDTHS.closing,
    borderRightWidth: 0,
  },
  dataCellText: {
    fontSize: 12,
    color: '#1f2937',
    textAlign: 'center',
  },
  dataCellItemNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 16,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  modalOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  modalOptionSelectedText: {
    color: '#1e40af',
    fontWeight: '600',
  },
});

export default function ReportScreen({ route }) {
  const { items } = useContext(ItemContext);
  const { warehouses } = useContext(WarehouseContext);
  const { warehouseId, warehouseName } = route.params || {};

  // Current month/year state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get warehouse name if warehouseId is provided but not warehouseName
  const displayWarehouseName = useMemo(() => {
    if (warehouseName) return warehouseName;
    if (warehouseId) {
      const wh = warehouses.find((w) => w.id === warehouseId);
      return wh?.name || 'Unknown Warehouse';
    }
    return 'All Warehouses';
  }, [warehouseId, warehouseName, warehouses]);

  // Filter items by warehouse if warehouseId is provided
  const filteredItems = useMemo(() => {
    if (warehouseId) {
      return items.filter((item) => item.warehouseId === warehouseId);
    }
    return items;
  }, [items, warehouseId]);

  // Calculate monthly report
  const reportData = useMemo(() => {
    return calculateMonthlyReport({
      items: filteredItems,
      year: selectedYear,
      month: selectedMonth,
      warehouseId: warehouseId || null,
    });
  }, [filteredItems, selectedYear, selectedMonth, warehouseId]);

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const currentMonthName =
    monthOptions.find((m) => m.value === selectedMonth)?.label || '';

  // Export handler
  const handleExport = async () => {
    if (filteredItems.length === 0) {
      Alert.alert('No Data', 'No data available to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Build monthly report rows for ALL months (not just current month)
      const monthlyReportRows = buildMonthlyReportRowsForAllMonths({
        stockInEntries: filteredItems,
        stockOutEntries: filteredItems,
        warehouseId: warehouseId || null,
      });

      if (Object.keys(monthlyReportRows).length === 0) {
        Alert.alert('No Data', 'No transactions found for export.');
        setIsExporting(false);
        return;
      }

      // Determine warehouse name for filename
      const warehouseForFile = displayWarehouseName.replace(/\s+/g, '_');

      // Export to Excel
      await exportMonthlyReportToXlsx({
        monthlyReportRows,
        warehouseName: warehouseForFile,
      });

      Alert.alert(
        'Success',
        'Report exported and ready to share!'
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        error.message || 'Failed to export report. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Render Header Row
  const renderHeaderRow = () => (
    <View style={styles.headerRow}>
      <View style={[styles.headerCell, styles.headerItemName]}>
        <Text style={styles.headerCellText}>Item Name</Text>
      </View>
      <View style={[styles.headerCell, styles.headerOpening]}>
        <Text style={styles.headerCellText}>Opening Stock</Text>
      </View>
      <View style={[styles.headerCell, styles.headerStockIn]}>
        <Text style={styles.headerCellText}>Stock In</Text>
      </View>
      <View style={[styles.headerCell, styles.headerStockOut]}>
        <Text style={styles.headerCellText}>Stock Out</Text>
      </View>
      <View style={[styles.headerCell, styles.headerClosing]}>
        <Text style={styles.headerCellText}>Closing Stock</Text>
      </View>
    </View>
  );

  // Render Data Row
  const renderDataRow = (row, index) => (
    <View key={`row-${index}`} style={styles.dataRow}>
      <View style={[styles.dataCell, styles.dataCellItemName]}>
        <Text style={styles.dataCellItemNameText}>{row.itemName}</Text>
      </View>
      <View style={[styles.dataCell, styles.dataCellOpening]}>
        <Text style={styles.dataCellText}>{row.openingStock}</Text>
      </View>
      <View style={[styles.dataCell, styles.dataCellStockIn]}>
        <Text style={styles.dataCellText}>{row.stockIn}</Text>
      </View>
      <View style={[styles.dataCell, styles.dataCellStockOut]}>
        <Text style={styles.dataCellText}>{row.stockOut}</Text>
      </View>
      <View style={[styles.dataCell, styles.dataCellClosing]}>
        <Text
          style={[
            styles.dataCellText,
            {
              fontWeight: '600',
              color: row.closingStock < 0 ? '#dc2626' : '#059669',
            },
          ]}
        >
          {row.closingStock}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        {/* Warehouse Label and Export Button Row */}
        <View style={styles.headerTopRow}>
          <Text style={styles.warehouseLabel}>
            Warehouse: {displayWarehouseName}
          </Text>
          <TouchableOpacity
            style={[
              styles.exportButton,
              isExporting && styles.exportButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.exportButtonText}>Export</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Month/Year Filters */}
        <View style={styles.filterRow}>
          <View style={styles.filterControl}>
            <Text style={styles.filterLabel}>Month</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.filterButtonText}>{currentMonthName}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterControl}>
            <Text style={styles.filterLabel}>Year</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.filterButtonText}>{selectedYear}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Table Section */}
      {reportData.length > 0 ? (
        <ScrollView
          style={styles.tableContainer}
          horizontal
          showsHorizontalScrollIndicator={true}
        >
          <View style={[styles.tableWrapper, { width: TOTAL_WIDTH }]}>
            {renderHeaderRow()}
            {reportData.map((row, index) => (
              <View key={`report-row-${index}-${row.itemName}`}>
                {renderDataRow(row, index)}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No stock data available for {currentMonthName} {selectedYear}.
          </Text>
        </View>
      )}

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <ScrollView>
              {monthOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    selectedMonth === option.value &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedMonth(option.value);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedMonth === option.value &&
                        styles.modalOptionSelectedText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <ScrollView>
              {yearOptions.map((year) => (
                <TouchableOpacity
                  key={`year-${year}`}
                  style={[
                    styles.modalOption,
                    selectedYear === year && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedYear === year &&
                        styles.modalOptionSelectedText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
