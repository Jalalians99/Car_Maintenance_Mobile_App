import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Modal } from 'react-native';
import { TextInput, useTheme, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label: string;
  value: string; // Format: YYYY-MM-DD
  onDateChange: (date: string) => void;
  error?: boolean;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onDateChange,
  error = false,
  disabled = false,
  mode = 'date',
  maximumDate,
  minimumDate,
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // Convert YYYY-MM-DD to Date object
  const getDateFromString = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Convert Date to YYYY-MM-DD
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert Date to DD.MM.YYYY for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDateToISO(selectedDate);
        onDateChange(formattedDate);
      }
    } else if (Platform.OS === 'ios') {
      // For iOS, store temporary date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleInputPress = () => {
    if (!disabled) {
      setTempDate(getDateFromString(value));
      setShowPicker(true);
    }
  };

  const handleConfirm = () => {
    if (tempDate) {
      const formattedDate = formatDateToISO(tempDate);
      onDateChange(formattedDate);
    }
    setShowPicker(false);
    setTempDate(null);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setTempDate(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleInputPress} activeOpacity={0.7}>
        <TextInput
          label={label}
          value={formatDateForDisplay(value)}
          mode="outlined"
          error={error}
          disabled={disabled}
          editable={false}
          right={<TextInput.Icon icon="calendar" onPress={handleInputPress} disabled={disabled} />}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {showPicker && Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <TouchableOpacity
            style={styles.iosOverlay}
            activeOpacity={1}
            onPress={handleCancel}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.iosPickerContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.iosPickerHeader}>
                  <Button
                    mode="text"
                    onPress={handleCancel}
                    textColor={theme.colors.error}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="text"
                    onPress={handleConfirm}
                    textColor={theme.colors.primary}
                  >
                    Done
                  </Button>
                </View>
                <DateTimePicker
                  value={tempDate || getDateFromString(value)}
                  mode={mode}
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  textColor={theme.colors.onSurface}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={getDateFromString(value)}
          mode={mode}
          display="default"
          onChange={handleDateChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

