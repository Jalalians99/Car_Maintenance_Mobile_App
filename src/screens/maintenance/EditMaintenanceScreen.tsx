import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Surface,
  HelperText,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, MaintenanceRecord, Car } from '../../types';
import { DatabaseService } from '../../services/database';
import { DatePicker } from '../../components/DatePicker';

type EditMaintenanceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditMaintenance'>;
type EditMaintenanceScreenRouteProp = RouteProp<RootStackParamList, 'EditMaintenance'>;

interface Props {
  navigation: EditMaintenanceScreenNavigationProp;
  route: EditMaintenanceScreenRouteProp;
}

export const EditMaintenanceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { maintenanceId } = route.params;
  const theme = useTheme();

  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form fields
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [mileage, setMileage] = useState('');
  const [description, setDescription] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadMaintenanceData();
  }, [maintenanceId]);

  const loadMaintenanceData = async () => {
    try {
      setInitialLoading(true);
      const maintenanceData = await DatabaseService.getMaintenanceRecord(maintenanceId);
      
      if (!maintenanceData) {
        Alert.alert('Error', 'Maintenance record not found', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setMaintenance(maintenanceData);

      // Load car data
      const carData = await DatabaseService.getCar(maintenanceData.carId);
      if (carData) {
        setCar(carData);
      }

      // Pre-fill form fields
      setMaintenanceDate(maintenanceData.maintenanceDate.split('T')[0]);
      setMileage(maintenanceData.mileage?.toString() || '');
      setDescription(maintenanceData.description);
      setPerformedBy(maintenanceData.performedBy || '');
      setCost(maintenanceData.cost?.toString() || '');
      setNotes(maintenanceData.notes || '');
    } catch (error) {

      Alert.alert('Error', 'Failed to load maintenance record');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!maintenanceDate) {
      newErrors.maintenanceDate = 'Maintenance date is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (mileage && (isNaN(Number(mileage)) || Number(mileage) < 0)) {
      newErrors.mileage = 'Please enter a valid mileage';
    }

    if (cost && (isNaN(Number(cost)) || Number(cost) < 0)) {
      newErrors.cost = 'Please enter a valid cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    if (!maintenance) {
      Alert.alert('Error', 'Maintenance record not found');
      return;
    }

    try {
      setLoading(true);

      const updates = {
        maintenanceDate,
        mileage: mileage ? Number(mileage) : undefined,
        description: description.trim(),
        performedBy: performedBy.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
        notes: notes.trim() || undefined,
      };

      await DatabaseService.updateMaintenanceRecord(maintenanceId, updates);

      Alert.alert('Success', 'Maintenance record updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {

      Alert.alert('Error', error.message || 'Failed to update maintenance record');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading maintenance record...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!maintenance || !car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Maintenance record not found</Text>
          <Button onPress={() => navigation.goBack()} style={styles.marginTop}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.carInfoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.carInfoTitle}>
              Editing Maintenance Record For:
            </Text>
            <Text variant="headlineSmall" style={styles.carName}>
              {car.make} {car.model} ({car.year})
            </Text>
            <Text variant="bodyMedium" style={styles.carDetail}>
              License Plate: {car.licensePlate}
            </Text>
          </Card.Content>
        </Card>

        <Surface style={styles.formContainer}>
          {/* Maintenance Date */}
          <View style={styles.inputGroup}>
            <DatePicker
              label="Maintenance Date *"
              value={maintenanceDate}
              onDateChange={setMaintenanceDate}
              error={!!errors.maintenanceDate}
              disabled={loading}
              maximumDate={new Date()}
            />
            {errors.maintenanceDate && (
              <HelperText type="error">{errors.maintenanceDate}</HelperText>
            )}
          </View>

          {/* Mileage */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mileage (optional)</Text>
            <TextInput
              mode="outlined"
              value={mileage}
              onChangeText={setMileage}
              placeholder="Enter mileage in km"
              keyboardType="numeric"
              error={!!errors.mileage}
              disabled={loading}
              right={<TextInput.Affix text="km" />}
            />
            {errors.mileage && <HelperText type="error">{errors.mileage}</HelperText>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the maintenance performed"
              multiline
              numberOfLines={4}
              error={!!errors.description}
              disabled={loading}
            />
            {errors.description && (
              <HelperText type="error">{errors.description}</HelperText>
            )}
          </View>

          {/* Performed By */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Performed By (optional)</Text>
            <TextInput
              mode="outlined"
              value={performedBy}
              onChangeText={setPerformedBy}
              placeholder="e.g., Self, Local Mechanic, Dealership"
              disabled={loading}
            />
          </View>

          {/* Cost/Expense */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost/Expense (optional)</Text>
            <TextInput
              mode="outlined"
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              keyboardType="decimal-pad"
              left={<TextInput.Affix text="€" />}
              error={!!errors.cost}
              disabled={loading}
            />
            {errors.cost && <HelperText type="error">{errors.cost}</HelperText>}
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              mode="outlined"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes or comments"
              multiline
              numberOfLines={3}
              disabled={loading}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Update Record
            </Button>
          </View>
        </Surface>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  carInfoCard: {
    margin: 16,
    elevation: 2,
  },
  carInfoTitle: {
    marginBottom: 8,
    color: '#666',
  },
  carName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  carDetail: {
    color: '#666',
    marginBottom: 4,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  marginTop: {
    marginTop: 16,
  },
});
