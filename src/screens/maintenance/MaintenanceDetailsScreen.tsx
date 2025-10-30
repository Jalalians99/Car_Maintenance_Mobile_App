import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  useTheme,
  Card,
  Button,
  Divider,
  ActivityIndicator,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, MaintenanceRecord, Car } from '../../types';
import { DatabaseService } from '../../services/database';
import * as Animatable from 'react-native-animatable';

type MaintenanceDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MaintenanceDetails'>;
type MaintenanceDetailsScreenRouteProp = RouteProp<RootStackParamList, 'MaintenanceDetails'>;

interface Props {
  navigation: MaintenanceDetailsScreenNavigationProp;
  route: MaintenanceDetailsScreenRouteProp;
}

export const MaintenanceDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { maintenanceId } = route.params;
  const theme = useTheme();

  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMaintenanceDetails();
  }, [maintenanceId]);

  const loadMaintenanceDetails = async () => {
    try {
      setLoading(true);
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
    } catch (error) {

      Alert.alert('Error', 'Failed to load maintenance details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditMaintenance', { maintenanceId });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await DatabaseService.deleteMaintenanceRecord(maintenanceId);
      Alert.alert('Success', 'Maintenance record deleted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {

      Alert.alert('Error', 'Failed to delete maintenance record');
    } finally {
      setDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Loading maintenance details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!maintenance) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={80} color={theme.colors.error} />
          <Text variant="headlineSmall" style={{ color: theme.colors.error, marginTop: 16 }}>
            Record Not Found
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <MaterialCommunityIcons name="wrench" size={48} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Maintenance Details
          </Text>
        </Animatable.View>

        {/* Car Info */}
        {car && (
          <Animatable.View animation="fadeIn" duration={800} delay={200}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Vehicle Information
                </Text>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="car" size={24} color={theme.colors.onSurfaceVariant} />
                  <View style={styles.detailContent}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Vehicle
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                      {car.make} {car.model} ({car.year})
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="card-text" size={24} color={theme.colors.onSurfaceVariant} />
                  <View style={styles.detailContent}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      License Plate
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                      {car.licensePlate}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Maintenance Information */}
        <Animatable.View animation="fadeInUp" duration={800} delay={300}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Service Details
              </Text>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Date
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {formatDate(maintenance.maintenanceDate)}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />

              {maintenance.mileage && (
                <>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Mileage
                      </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {maintenance.mileage.toLocaleString()} km
                  </Text>
                    </View>
                  </View>
                  <Divider style={styles.divider} />
                </>
              )}

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="text" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Description
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                    {maintenance.description}
                  </Text>
                </View>
              </View>

              {maintenance.performedBy && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="account" size={24} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Performed By
                      </Text>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        {maintenance.performedBy}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {maintenance.cost && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="currency-usd" size={24} color={theme.colors.primary} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Cost
                      </Text>
                  <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    €{maintenance.cost.toFixed(2)}
                  </Text>
                    </View>
                  </View>
                </>
              )}

              {maintenance.notes && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="note-text" size={24} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Notes
                      </Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontStyle: 'italic' }}>
                        {maintenance.notes}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400} style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={handleEdit}
            style={styles.button}
          >
            Edit Record
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => setDeleteDialogVisible(true)}
            style={styles.button}
            textColor={theme.colors.error}
          >
            Delete Record
          </Button>
        </Animatable.View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title>Delete Maintenance Record?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this maintenance record? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              loading={deleting}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
