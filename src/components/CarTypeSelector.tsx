import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, useTheme, IconButton, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CarSubType } from '../types';

interface CarTypeSelectorProps {
  label: string;
  value: CarSubType | '';
  onValueChange: (value: CarSubType) => void;
  error?: boolean;
  disabled?: boolean;
}

const CAR_TYPES: { value: CarSubType; label: string; icon: string }[] = [
  { value: 'Sedan', label: 'Sedan', icon: 'car' },
  { value: 'SUV', label: 'SUV', icon: 'car-estate' },
  { value: 'Hatchback', label: 'Hatchback', icon: 'car-hatchback' },
  { value: 'Crossover', label: 'Crossover', icon: 'car-sports' },
  { value: 'Truck', label: 'Truck', icon: 'truck' },
  { value: 'Van', label: 'Van', icon: 'van-utility' },
  { value: 'Coupe', label: 'Coupe', icon: 'car-sports' },
  { value: 'Convertible', label: 'Convertible', icon: 'car-convertible' },
  { value: 'Wagon', label: 'Wagon', icon: 'car-estate' },
  { value: 'MPV', label: 'MPV', icon: 'van-passenger' },
  { value: 'Pickup', label: 'Pickup', icon: 'truck-flatbed' },
  { value: 'Minivan', label: 'Minivan', icon: 'van-passenger' },
  { value: 'Sports Car', label: 'Sports Car', icon: 'car-sports' },
  { value: 'Electric', label: 'Electric', icon: 'car-electric' },
  { value: 'Hybrid', label: 'Hybrid', icon: 'car-electric-outline' },
  { value: 'Other', label: 'Other', icon: 'car-cog' },
];

export const CarTypeSelector: React.FC<CarTypeSelectorProps> = ({
  label,
  value,
  onValueChange,
  error = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedType = CAR_TYPES.find(type => type.value === value);

  const handleSelectType = (type: CarSubType) => {
    onValueChange(type);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => !disabled && setModalVisible(true)} activeOpacity={0.7}>
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          error={error}
          disabled={disabled}
          editable={false}
          right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setModalVisible(true)} disabled={disabled} />}
          left={selectedType ? <TextInput.Icon icon={selectedType.icon} /> : undefined}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Surface style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                Select Car Type
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.typeGrid}>
                {CAR_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeCard,
                      { 
                        backgroundColor: theme.colors.surfaceVariant,
                        borderColor: theme.colors.outline,
                      },
                      value === type.value && { 
                        backgroundColor: theme.colors.primaryContainer,
                        borderColor: theme.colors.primary,
                        borderWidth: 2,
                      }
                    ]}
                    onPress={() => handleSelectType(type.value)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={32}
                      color={value === type.value ? theme.colors.primary : theme.colors.onSurfaceVariant}
                    />
                    <Text 
                      variant="bodyMedium" 
                      style={{ 
                        color: value === type.value ? theme.colors.primary : theme.colors.onSurface,
                        fontWeight: value === type.value ? 'bold' : 'normal',
                        marginTop: 8,
                        textAlign: 'center',
                      }}
                    >
                      {type.label}
                    </Text>
                    {value === type.value && (
                      <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Surface>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



