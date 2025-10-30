import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Snackbar,
  Card,
  IconButton,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import * as Animatable from 'react-native-animatable';
import { DatePicker } from '../../components/DatePicker';
import { CarTypeSelector } from '../../components/CarTypeSelector';

type AddCarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCar'>;

interface Props {
  navigation: AddCarScreenNavigationProp;
}

const AddCarScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    subType: '',
    mileage: '',
    vin: '',
    color: '',
    firstMaintenance: '',
    firstOilChangeDate: '',
    mileageAtFirstOilChange: '',
    oilChangeInterval: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }

    if (!formData.subType) {
      newErrors.subType = 'Car type is required';
    }

    if (!formData.mileage.trim()) {
      newErrors.mileage = 'Current mileage is required';
    } else if (isNaN(Number(formData.mileage)) || Number(formData.mileage) < 0) {
      newErrors.mileage = 'Mileage must be a positive number';
    }

    if (formData.mileageAtFirstOilChange && (isNaN(Number(formData.mileageAtFirstOilChange)) || Number(formData.mileageAtFirstOilChange) < 0)) {
      newErrors.mileageAtFirstOilChange = 'Mileage must be a positive number';
    }

    if (formData.oilChangeInterval && (isNaN(Number(formData.oilChangeInterval)) || Number(formData.oilChangeInterval) < 0)) {
      newErrors.oilChangeInterval = 'Interval must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCar = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a car');
      return;
    }

    setLoading(true);
    try {
      const carData = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        licensePlate: formData.licensePlate.trim(),
        subType: formData.subType as any, // Cast to CarSubType
        mileage: Number(formData.mileage),
        vin: formData.vin.trim() || undefined,
        color: formData.color.trim() || undefined,
        firstMaintenance: formData.firstMaintenance || undefined,
        firstOilChangeDate: formData.firstOilChangeDate || undefined,
        mileageAtFirstOilChange: formData.mileageAtFirstOilChange ? Number(formData.mileageAtFirstOilChange) : undefined,
        oilChangeInterval: formData.oilChangeInterval ? Number(formData.oilChangeInterval) : undefined,
        imageUrls: [],
        notes: formData.notes.trim() || undefined,
        ownerId: user.id,
      };

      const carId = await DatabaseService.addCar(carData);
      
      Alert.alert(
        'Success',
        'Car added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to add car');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />

            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="car"
                size={48}
                color={theme.colors.primary}
              />
            </View>

            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Add New Car
            </Text>

            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Enter your vehicle information
            </Text>
          </Animatable.View>

          {/* Car Form */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.formContent}>
                {/* Basic Information */}
                <View style={styles.sectionHeader}>
                  <Chip icon="car" mode="outlined" style={styles.sectionChip}>
                    Basic Information
                  </Chip>
                </View>

                <TextInput
                  label="Make *"
                  value={formData.make}
                  onChangeText={(value) => updateFormData('make', value)}
                  mode="outlined"
                  autoCapitalize="words"
                  placeholder="e.g., Toyota, Honda, Ford"
                  left={<TextInput.Icon icon="car" />}
                  error={!!errors.make}
                  style={styles.input}
                />
                {errors.make && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.make}
                  </Text>
                )}

                <TextInput
                  label="Model *"
                  value={formData.model}
                  onChangeText={(value) => updateFormData('model', value)}
                  mode="outlined"
                  autoCapitalize="words"
                  placeholder="e.g., Camry, Accord, F-150"
                  left={<TextInput.Icon icon="car-info" />}
                  error={!!errors.model}
                  style={styles.input}
                />
                {errors.model && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.model}
                  </Text>
                )}

                <TextInput
                  label="Year *"
                  value={formData.year}
                  onChangeText={(value) => updateFormData('year', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="e.g., 2020"
                  left={<TextInput.Icon icon="calendar" />}
                  error={!!errors.year}
                  style={styles.input}
                />
                {errors.year && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.year}
                  </Text>
                )}

                {/* Sub Type - REQUIRED */}
                <View style={styles.input}>
                  <CarTypeSelector
                    label="Car Type *"
                    value={formData.subType}
                    onValueChange={(value) => updateFormData('subType', value)}
                    error={!!errors.subType}
                  />
                </View>
                {errors.subType && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.subType}
                  </Text>
                )}

                {/* Vehicle Identification */}
                <View style={styles.sectionHeader}>
                  <Chip icon="card-text" mode="outlined" style={styles.sectionChip}>
                    Vehicle Details
                  </Chip>
                </View>

                <TextInput
                  label="License Plate *"
                  value={formData.licensePlate}
                  onChangeText={(value) => updateFormData('licensePlate', value)}
                  mode="outlined"
                  autoCapitalize="characters"
                  placeholder="e.g., ABC123"
                  left={<TextInput.Icon icon="card-text" />}
                  error={!!errors.licensePlate}
                  style={styles.input}
                />
                {errors.licensePlate && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.licensePlate}
                  </Text>
                )}

                <TextInput
                  label="Current Mileage *"
                  value={formData.mileage}
                  onChangeText={(value) => updateFormData('mileage', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="e.g., 50000"
                  left={<TextInput.Icon icon="speedometer" />}
                  error={!!errors.mileage}
                  style={styles.input}
                />
                {errors.mileage && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.mileage}
                  </Text>
                )}

                <TextInput
                  label="Color (Optional)"
                  value={formData.color}
                  onChangeText={(value) => updateFormData('color', value)}
                  mode="outlined"
                  autoCapitalize="words"
                  placeholder="e.g., Blue, Red, White"
                  left={<TextInput.Icon icon="palette" />}
                  style={styles.input}
                />

                <TextInput
                  label="VIN (Optional)"
                  value={formData.vin}
                  onChangeText={(value) => updateFormData('vin', value)}
                  mode="outlined"
                  autoCapitalize="characters"
                  placeholder="17-character Vehicle Identification Number"
                  left={<TextInput.Icon icon="barcode" />}
                  maxLength={17}
                  style={styles.input}
                />

                {/* Maintenance History */}
                <View style={styles.sectionHeader}>
                  <Chip icon="wrench" mode="outlined" style={styles.sectionChip}>
                    Maintenance History (Optional)
                  </Chip>
                </View>

                <View style={styles.input}>
                  <DatePicker
                    label="First Maintenance Date"
                    value={formData.firstMaintenance}
                    onDateChange={(value) => updateFormData('firstMaintenance', value)}
                  />
                </View>

                <View style={styles.input}>
                  <DatePicker
                    label="First Oil Change Date"
                    value={formData.firstOilChangeDate}
                    onDateChange={(value) => updateFormData('firstOilChangeDate', value)}
                  />
                </View>

                <TextInput
                  label="Mileage at First Oil Change"
                  value={formData.mileageAtFirstOilChange}
                  onChangeText={(value) => updateFormData('mileageAtFirstOilChange', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="e.g., 3000"
                  left={<TextInput.Icon icon="speedometer" />}
                  error={!!errors.mileageAtFirstOilChange}
                  style={styles.input}
                />
                {errors.mileageAtFirstOilChange && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.mileageAtFirstOilChange}
                  </Text>
                )}

                <TextInput
                  label="Oil Change Interval (miles)"
                  value={formData.oilChangeInterval}
                  onChangeText={(value) => updateFormData('oilChangeInterval', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="e.g., 5000 (miles between oil changes)"
                  left={<TextInput.Icon icon="oil" />}
                  error={!!errors.oilChangeInterval}
                  style={styles.input}
                />
                {errors.oilChangeInterval && (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.oilChangeInterval}
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleAddCar}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  contentStyle={styles.buttonContent}
                  icon="check"
                >
                  {loading ? 'Adding Car...' : 'Add Car'}
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  formCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 24,
  },
  formContent: {
    padding: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionChip: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 16,
    marginLeft: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddCarScreen;
