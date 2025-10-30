import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  useTheme,
  Card,
  IconButton,
  Button,
  Dialog,
  Portal,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, Car, MaintenanceRecord } from '../../types';
import { DatabaseService } from '../../services/database';
import * as Animatable from 'react-native-animatable';

type CarMaintenanceRecordsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MaintenanceList'>;
type CarMaintenanceRecordsScreenRouteProp = RouteProp<RootStackParamList, 'MaintenanceList'>;

interface Props {
  navigation: CarMaintenanceRecordsScreenNavigationProp;
  route: CarMaintenanceRecordsScreenRouteProp;
}

export const CarMaintenanceRecordsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { carId } = route.params;
  const theme = useTheme();

  const [car, setCar] = useState<Car | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [carId])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load car details
      const carData = await DatabaseService.getCar(carId);
      setCar(carData);

      // Load maintenance records
      const records = await DatabaseService.getCarMaintenanceRecords(carId);
      setMaintenanceRecords(records);
    } catch (error) {

      Alert.alert('Error', 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleViewDetails = (recordId: string) => {
    navigation.navigate('MaintenanceDetails', { maintenanceId: recordId });
  };

  const handleEdit = (recordId: string) => {
    navigation.navigate('EditMaintenance', { maintenanceId: recordId });
  };

  const handleDelete = async () => {
    if (!selectedRecordId) return;

    setDeleting(true);
    try {
      await DatabaseService.deleteMaintenanceRecord(selectedRecordId);
      Alert.alert('Success', 'Maintenance record deleted successfully');
      await loadData();
    } catch (error) {

      Alert.alert('Error', 'Failed to delete maintenance record');
    } finally {
      setDeleting(false);
      setDeleteDialogVisible(false);
      setSelectedRecordId(null);
    }
  };

  const handleAddMaintenance = () => {
    navigation.navigate('AddMaintenance', { carId });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="wrench" size={60} color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Loading maintenance records...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!car) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="car-off" size={80} color={theme.colors.error} />
          <Text variant="headlineSmall" style={{ color: theme.colors.error, marginTop: 16 }}>
            Car Not Found
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Car Info Card */}
        <Animatable.View animation="fadeInDown" duration={800}>
          <Card style={[styles.carInfoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.carInfoHeader}>
                <MaterialCommunityIcons name="car" size={40} color={theme.colors.primary} />
                <View style={styles.carInfoText}>
                  <Text variant="headlineSmall" style={[styles.carTitle, { color: theme.colors.onSurface }]}>
                    {car.make} {car.model}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {car.year} • {car.licensePlate}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Header */}
        <Animatable.View animation="fadeIn" duration={800} delay={200} style={styles.header}>
          <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            Maintenance History
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {maintenanceRecords.length} {maintenanceRecords.length === 1 ? 'record' : 'records'}
          </Text>
        </Animatable.View>

        {/* Maintenance Records */}
        {maintenanceRecords.length === 0 ? (
          <Animatable.View animation="fadeIn" duration={800} delay={300}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="wrench-outline" size={64} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  No Maintenance Records
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  Add your first maintenance record to start tracking this car's service history
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={handleAddMaintenance}
                  style={{ marginTop: 16 }}
                >
                  Add First Record
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>
        ) : (
          maintenanceRecords.map((record, index) => (
            <Animatable.View
              key={record.id}
              animation="fadeInUp"
              duration={600}
              delay={300 + index * 100}
            >
              <Card style={styles.recordCard}>
                <Card.Content>
                  <View style={styles.recordHeader}>
                    <View style={styles.dateSection}>
                      <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodyLarge" style={[styles.dateText, { color: theme.colors.onSurface }]}>
                        {formatDate(record.maintenanceDate)}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <IconButton
                        icon="eye"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={() => handleViewDetails(record.id)}
                      />
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEdit(record.id)}
                      />
                      <IconButton
                        icon="delete"
                        iconColor={theme.colors.error}
                        size={20}
                        onPress={() => {
                          setSelectedRecordId(record.id);
                          setDeleteDialogVisible(true);
                        }}
                      />
                    </View>
                  </View>

                  <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
                    {record.description}
                  </Text>

                  <View style={styles.details}>
                    {record.mileage && (
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="speedometer" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                          {record.mileage.toLocaleString()} km
                        </Text>
                      </View>
                    )}
                    {record.performedBy && (
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="account" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                          {record.performedBy}
                        </Text>
                      </View>
                    )}
                    {record.cost && (
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color={theme.colors.primary} />
                        <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                          €{record.cost.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {record.notes && (
                    <Text variant="bodySmall" style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
                      Note: {record.notes}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </Animatable.View>
          ))
        )}
      </ScrollView>

      {/* FAB for adding maintenance */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddMaintenance}
        label="Add Record"
      />

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
    paddingBottom: 100,
  },
  carInfoCard: {
    marginBottom: 16,
    elevation: 4,
  },
  carInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carInfoText: {
    marginLeft: 16,
    flex: 1,
  },
  carTitle: {
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyCard: {
    marginTop: 32,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  recordCard: {
    marginBottom: 12,
    elevation: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  description: {
    marginBottom: 12,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

