import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Surface,
  HelperText,
  Card,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, ReminderType, Car } from '../../types';
import { DatabaseService } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import { DatePicker } from '../../components/DatePicker';
import * as Animatable from 'react-native-animatable';

type AddReminderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddReminder'>;
type AddReminderScreenRouteProp = RouteProp<RootStackParamList, 'AddReminder'>;

interface Props {
  navigation: AddReminderScreenNavigationProp;
  route: AddReminderScreenRouteProp;
}

const REMINDER_TYPES: { value: ReminderType; label: string; icon: string }[] = [
  { value: 'Oil Change', label: 'Oil Change', icon: 'oil' },
  { value: 'Tire Rotation', label: 'Tire Rotation', icon: 'car-tire-alert' },
  { value: 'Inspection', label: 'Inspection', icon: 'clipboard-check' },
  { value: 'Registration Renewal', label: 'Registration', icon: 'card-account-details' },
  { value: 'Insurance Renewal', label: 'Insurance', icon: 'shield-car' },
  { value: 'Service Appointment', label: 'Service', icon: 'wrench-clock' },
  { value: 'Car Wash', label: 'Car Wash', icon: 'car-wash' },
  { value: 'Custom', label: 'Custom', icon: 'bell-plus' },
];

export const AddReminderScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { carId } = route.params || {};

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>(carId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [type, setType] = useState<ReminderType>('Custom');
  const [notifyBefore, setNotifyBefore] = useState('1');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCars();
  }, [user]);

  const loadCars = async () => {
    if (!user) return;
    try {
      const userCars = await DatabaseService.getUserCars(user.id);
      setCars(userCars);
    } catch (error) {

    }
  };

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!reminderDate) newErrors.reminderDate = 'Reminder date is required.';
    if (notifyBefore && (isNaN(Number(notifyBefore)) || Number(notifyBefore) < 0)) {
      newErrors.notifyBefore = 'Notify before must be a valid number of days.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddReminder = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a reminder.');
      return;
    }

    try {
      setLoading(true);

      const reminderData = {
        userId: user.id,
        carId: selectedCarId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        reminderDate,
        reminderTime: reminderTime || undefined,
        type,
        status: 'pending' as const,
        notifyBefore: notifyBefore ? Number(notifyBefore) : undefined,
      };

      await DatabaseService.addReminder(reminderData);

      Alert.alert('Success', 'Reminder added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {

      Alert.alert('Error', error.message || 'Failed to add reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCar = cars.find(c => c.id === selectedCarId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          <Animatable.View animation="fadeIn" duration={800}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="bell-plus" size={32} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={[styles.headerText, { color: theme.colors.onBackground }]}>
                Add New Reminder
              </Text>
            </View>

            {/* Car Selection Card (if multiple cars) */}
            {cars.length > 0 && (
              <Card style={styles.carCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
                    Select Car (Optional)
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carChipContainer}>
                    <Chip
                      mode={selectedCarId === '' ? 'flat' : 'outlined'}
                      selected={selectedCarId === ''}
                      onPress={() => setSelectedCarId('')}
                      style={styles.carChip}
                    >
                      No Car (General)
                    </Chip>
                    {cars.map((car) => (
                      <Chip
                        key={car.id}
                        mode={selectedCarId === car.id ? 'flat' : 'outlined'}
                        selected={selectedCarId === car.id}
                        onPress={() => setSelectedCarId(car.id)}
                        style={styles.carChip}
                      >
                        {car.make} {car.model}
                      </Chip>
                    ))}
                  </ScrollView>
                  {selectedCar && (
                    <View style={styles.selectedCarInfo}>
                      <MaterialCommunityIcons name="car" size={20} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                        {selectedCar.year} {selectedCar.make} {selectedCar.model} • {selectedCar.licensePlate}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            <Surface style={styles.formContainer}>
              {/* Reminder Type */}
              <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                  Reminder Type *
                </Text>
                <View style={styles.typeGrid}>
                  {REMINDER_TYPES.map((reminderType) => (
                    <Chip
                      key={reminderType.value}
                      icon={reminderType.icon}
                      mode={type === reminderType.value ? 'flat' : 'outlined'}
                      selected={type === reminderType.value}
                      onPress={() => {
                        setType(reminderType.value);
                        if (title === '' || title === REMINDER_TYPES.find(t => t.value === type)?.label) {
                          setTitle(reminderType.label);
                        }
                      }}
                      style={styles.typeChip}
                    >
                      {reminderType.label}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  mode="outlined"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Oil Change"
                  error={!!errors.title}
                  disabled={loading}
                  left={<TextInput.Icon icon="format-title" />}
                />
                {errors.title && <HelperText type="error">{errors.title}</HelperText>}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  mode="outlined"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add details about this reminder"
                  multiline
                  numberOfLines={3}
                  disabled={loading}
                  left={<TextInput.Icon icon="text" />}
                />
              </View>

              {/* Reminder Date */}
              <View style={styles.inputGroup}>
                <DatePicker
                  label="Reminder Date *"
                  value={reminderDate}
                  onDateChange={setReminderDate}
                  error={!!errors.reminderDate}
                  disabled={loading}
                />
                {errors.reminderDate && <HelperText type="error">{errors.reminderDate}</HelperText>}
              </View>

              {/* Reminder Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reminder Time (optional)</Text>
                <TextInput
                  mode="outlined"
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  disabled={loading}
                  left={<TextInput.Icon icon="clock-outline" />}
                />
                <HelperText type="info">Format: HH:MM (24-hour)</HelperText>
              </View>

              {/* Notify Before */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notify Before (days)</Text>
                <TextInput
                  mode="outlined"
                  value={notifyBefore}
                  onChangeText={setNotifyBefore}
                  placeholder="1"
                  keyboardType="numeric"
                  error={!!errors.notifyBefore}
                  disabled={loading}
                  left={<TextInput.Icon icon="bell-alert" />}
                />
                {errors.notifyBefore && <HelperText type="error">{errors.notifyBefore}</HelperText>}
                <HelperText type="info">Receive notification X days before reminder date</HelperText>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleAddReminder}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                icon="check"
              >
                Add Reminder
              </Button>
            </Surface>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerText: {
    fontWeight: 'bold',
  },
  carCard: {
    marginBottom: 16,
    elevation: 2,
  },
  carChipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  carChip: {
    marginRight: 8,
  },
  selectedCarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  formContainer: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
});



