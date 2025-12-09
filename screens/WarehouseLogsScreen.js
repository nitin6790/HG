import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReportContext } from '../src/context/ReportContext';
import { WarehouseContext } from '../src/context/WarehouseContext';
import { getMonthOptions, getYearOptions } from '../src/utils/reportUtils';
import { exportWarehouseLogsToXlsx } from '../src/utils/warehouseLogsExcelUtils';

export default function WarehouseLogsScreen({ route, navigation }) {
  const { warehouseLogsData, loadWarehouseLogs, reportLoading, reportError } = useContext(ReportContext);
  const { warehouses } = useContext(WarehouseContext);

  const { warehouseId, warehouseName } = route.params || {};

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stockInLogs, setStockInLogs] = useState([]);
  const [stockOutLogs, setStockOutLogs] = useState([]);

  // Load logs from API
  useEffect(() => {
    if (!warehouseId) return;
    loadWarehouseLogs(warehouseId);
  }, [warehouseId, loadWarehouseLogs]);

  // Filter logs by month and year
  useEffect(() => {
    if (!warehouseLogsData || warehouseLogsData.length === 0) {
      setStockInLogs([]);
      setStockOutLogs([]);
      return;
    }

    const inLogs = warehouseLogsData
      .filter((log) => log.type === 'stock-in')
      .filter((log) => {
        const date = new Date(log.date);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() + 1 === selectedMonth
        );
      })
      .map((log) => ({
        id: log._id,
        itemName: log.itemName,
        quantity: log.quantity,
        category: log.itemCategory,
        date: log.date,
        notes: log.notes,
        dateObj: new Date(log.date),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const outLogs = warehouseLogsData
      .filter((log) => log.type === 'stock-out')
      .filter((log) => {
        const date = new Date(log.date);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() + 1 === selectedMonth
        );
      })
      .map((log) => ({
        id: log._id,
        itemName: log.itemName,
        quantity: log.quantity,
        category: log.itemCategory,
        date: log.date,
        notes: log.notes,
        dateObj: new Date(log.date),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setStockInLogs(inLogs);
    setStockOutLogs(outLogs);
  }, [warehouseLogsData, selectedMonth, selectedYear]);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportWarehouseLogsToXlsx({
        warehouseName,
        month: selectedMonth,
        year: selectedYear,
        stockInLogs,
        stockOutLogs,
      });
      Alert.alert('Success', 'Warehouse logs exported successfully!');
    } catch (error) {
      Alert.alert('Error', `Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const monthName = monthOptions.find((m) => m.value === selectedMonth)?.label || '';
  const yearLabel = selectedYear.toString();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Header */}
          <View className="mb-6 bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-2xl font-bold text-gray-900">
              {warehouseName}
            </Text>
            <Text className="text-sm text-gray-600 mt-2">
              {new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>

          {/* Filters */}
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Filter by Month & Year
            </Text>

            {/* Month and Year Row */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={() => setShowMonthPicker(!showMonthPicker)}
                className="flex-1 bg-blue-50 border border-blue-300 rounded-lg px-4 py-3"
              >
                <Text className="text-blue-900 font-semibold text-center text-sm">
                  {monthName}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowYearPicker(!showYearPicker)}
                className="flex-1 bg-blue-50 border border-blue-300 rounded-lg px-4 py-3"
              >
                <Text className="text-blue-900 font-semibold text-center text-sm">
                  {yearLabel}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Month Dropdown */}
            {showMonthPicker && (
              <View className="bg-gray-50 rounded-lg p-2 mb-3 max-h-40 border border-gray-200">
                <ScrollView>
                  {monthOptions.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      onPress={() => {
                        setSelectedMonth(month.value);
                        setShowMonthPicker(false);
                      }}
                      className={`px-4 py-2 rounded mb-1 ${
                        selectedMonth === month.value
                          ? 'bg-blue-200'
                          : 'bg-white'
                      }`}
                    >
                      <Text className="text-gray-900 text-sm">{month.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Year Dropdown */}
            {showYearPicker && (
              <View className="bg-gray-50 rounded-lg p-2 max-h-40 border border-gray-200">
                <ScrollView>
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={year.value}
                      onPress={() => {
                        setSelectedYear(year.value);
                        setShowYearPicker(false);
                      }}
                      className={`px-4 py-2 rounded mb-1 ${
                        selectedYear === year.value
                          ? 'bg-blue-200'
                          : 'bg-white'
                      }`}
                    >
                      <Text className="text-gray-900 text-sm">{year.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Export Button */}
            <TouchableOpacity
              onPress={handleExport}
              disabled={isExporting}
              className={`px-4 py-3 rounded-lg flex-row justify-center items-center mt-3 ${
                isExporting ? 'bg-gray-400' : 'bg-green-600'
              }`}
            >
              {isExporting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-sm">Export to Excel</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Stock In Section */}
          <View className="mb-6">
            <View className="bg-blue-100 rounded-t-lg px-4 py-3 border-b-2 border-blue-300">
              <Text className="text-lg font-bold text-blue-900">
                Stock In ({stockInLogs.length})
              </Text>
            </View>

            {stockInLogs.length > 0 ? (
              <View className="bg-white rounded-b-lg overflow-hidden shadow-sm border border-blue-200 border-t-0">
                {/* Header Row */}
                <View className="flex-row bg-blue-50 border-b border-blue-200 px-3 py-2">
                  <Text className="font-bold text-gray-800 text-xs flex-1">
                    Date
                  </Text>
                  <Text className="font-bold text-gray-800 text-xs flex-2">
                    Item Name
                  </Text>
                  <Text className="font-bold text-gray-800 text-xs flex-1 text-right">
                    Qty
                  </Text>
                </View>

                {/* Data Rows */}
                {stockInLogs.map((log, index) => (
                  <View
                    key={log.id}
                    className={`flex-row px-3 py-3 border-b ${
                      index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                    } border-gray-200`}
                  >
                    <Text className="text-gray-700 text-sm flex-1">
                      {new Date(log.date).toLocaleDateString()}
                    </Text>
                    <Text className="text-gray-900 font-semibold text-sm flex-2 px-1">
                      {log.itemName}
                    </Text>
                    <Text className="text-green-700 font-bold text-sm flex-1 text-right">
                      +{log.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-blue-50 rounded-b-lg px-4 py-6 border border-blue-200 border-t-0">
                <Text className="text-center text-gray-600 text-sm">
                  No stock in transactions
                </Text>
              </View>
            )}
          </View>

          {/* Stock Out Section */}
          <View className="mb-8">
            <View className="bg-orange-100 rounded-t-lg px-4 py-3 border-b-2 border-orange-300">
              <Text className="text-lg font-bold text-orange-900">
                Stock Out ({stockOutLogs.length})
              </Text>
            </View>

            {stockOutLogs.length > 0 ? (
              <View className="bg-white rounded-b-lg overflow-hidden shadow-sm border border-orange-200 border-t-0">
                {/* Header Row */}
                <View className="flex-row bg-orange-50 border-b border-orange-200 px-3 py-2">
                  <Text className="font-bold text-gray-800 text-xs flex-1">
                    Date
                  </Text>
                  <Text className="font-bold text-gray-800 text-xs flex-2">
                    Item Name
                  </Text>
                  <Text className="font-bold text-gray-800 text-xs flex-1 text-right">
                    Qty
                  </Text>
                </View>

                {/* Data Rows */}
                {stockOutLogs.map((log, index) => (
                  <View
                    key={log.id}
                    className={`flex-row px-3 py-3 border-b ${
                      index % 2 === 0 ? 'bg-white' : 'bg-orange-50'
                    } border-gray-200`}
                  >
                    <Text className="text-gray-700 text-sm flex-1">
                      {new Date(log.date).toLocaleDateString()}
                    </Text>
                    <Text className="text-gray-900 font-semibold text-sm flex-2 px-1">
                      {log.itemName}
                    </Text>
                    <Text className="text-red-700 font-bold text-sm flex-1 text-right">
                      -{log.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-orange-50 rounded-b-lg px-4 py-6 border border-orange-200 border-t-0">
                <Text className="text-center text-gray-600 text-sm">
                  No stock out transactions
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
