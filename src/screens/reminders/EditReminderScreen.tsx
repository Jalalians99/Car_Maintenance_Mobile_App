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
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, ReminderType, Car, Reminder } from '../../types';
import { DatabaseService } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import { DatePicker } from '../../components/DatePicker';
import * as Animatable from 'react-native-animatable';

type EditReminderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditReminder'>;
type EditReminderScreenRouteProp = RouteProp<RootStackParamList, 'EditReminder'>;

interface Props {
  navigation: EditReminderScreenNavigationProp;
  route: EditReminderScreenRouteProp;
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

export const EditReminderScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { reminderId } = route.params;

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [type, setType] = useState<ReminderType>('Custom');
  const [notifyBefore, setNotifyBefore] = useState('');
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [reminderId, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setInitialLoading(true);

      // Load reminder
      const reminderData = await DatabaseService.getReminder(reminderId);
      if (!reminderData) {
        Alert.alert('Error', 'Reminder not found', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setReminder(reminderData);
      setSelectedCarId(reminderData.carId || '');
      setTitle(reminderData.title);
      setDescription(reminderData.description || '');
      setReminderDate(reminderData.reminderDate);
      setReminderTime(reminderData.reminderTime || '');
      setType(reminderData.type);
      setNotifyBefore(reminderData.notifyBefore?.toString() || '');

      // Load cars
      const userCars = await DatabaseService.getUserCars(user.id);
      setCars(userCars);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reminder details');
    } finally {
      setInitialLoading(false);
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

  const handleUpdateReminder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const updates = {
        carId: selectedCarId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        reminderDate,
        reminderTime: reminderTime || undefined,
        type,
        notifyBefore: notifyBefore ? Number(notifyBefore) : undefined,
      };

      await DatabaseService.updateReminder(reminderId, updates);

      Alert.alert('Success', 'Reminder updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await DatabaseService.deleteReminder(reminderId);
              Alert.alert('Success', 'Reminder deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onBackground }}>
            Loading reminder...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <MaterialCommunityIcons name="pencil" size={32} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={[styles.headerText, { color: theme.colors.onBackground }]}>
                Edit Reminder
              </Text>
            </View>

            {/* Car Selection Card */}
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
                      onPress={() => setType(reminderType.value)}
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

              {/* Update Button */}
              <Button
                mode="contained"
                onPress={handleUpdateReminder}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                icon="check"
              >
                Update Reminder
              </Button>

              {/* Delete Button */}
              <Button
                mode="outlined"
                onPress={handleDeleteReminder}
                disabled={loading}
                style={styles.deleteButton}
                buttonColor="transparent"
                textColor="#f44336"
                icon="delete"
              >
                Delete Reminder
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  deleteButton: {
    marginTop: 12,
    paddingVertical: 6,
    borderColor: '#f44336',
  },
});


