import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  useTheme,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  Dialog,
  Portal,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, Car, MaintenanceRecord } from '../../types';
import { DatabaseService } from '../../services/database';
import { ImageUploadService } from '../../services/imageUpload';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';

type CarDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CarDetails'>;
type CarDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CarDetails'>;

interface Props {
  navigation: CarDetailsScreenNavigationProp;
  route: CarDetailsScreenRouteProp;
}

const CarDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { carId } = route.params;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [deleteMaintenanceDialogVisible, setDeleteMaintenanceDialogVisible] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState(false);
  
  // Image management
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  useEffect(() => {
    loadCarDetails();
  }, [carId]);
  
  useFocusEffect(
    React.useCallback(() => {
      loadMaintenanceRecords();
    }, [carId])
  );

  const loadCarDetails = async () => {
    try {
      const carData = await DatabaseService.getCar(carId);
      setCar(carData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load car details');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMaintenanceRecords = async () => {
    try {
      setLoadingMaintenance(true);
      const records = await DatabaseService.getCarMaintenanceRecords(carId);
      setMaintenanceRecords(records);
    } catch (error) {
      // Silently handle error
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditCar', { carId });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await DatabaseService.deleteCar(carId);
      Alert.alert('Success', 'Car deleted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete car');
    } finally {
      setDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const handleAddImage = () => {
    ImageUploadService.showImageSourceDialog(
      handleTakePhoto,
      handlePickFromGallery
    );
  };

  const handleTakePhoto = async () => {
    try {
      setUploadingImage(true);
      const imageUri = await ImageUploadService.takePhoto();
      
      if (!imageUri) {
        setUploadingImage(false);
        return;
      }

      const downloadURL = await ImageUploadService.uploadCarImage(carId, imageUri);
      await DatabaseService.addCarImage(carId, downloadURL);
      
      await loadCarDetails();
      Alert.alert('Success', 'Photo added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setUploadingImage(true);
      const imageUri = await ImageUploadService.pickImage();
      
      if (!imageUri) {
        setUploadingImage(false);
        return;
      }

      const downloadURL = await ImageUploadService.uploadCarImage(carId, imageUri);
      await DatabaseService.addCarImage(carId, downloadURL);
      
      await loadCarDetails();
      Alert.alert('Success', 'Photo added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingImage(imageUrl);
              await DatabaseService.removeCarImage(carId, imageUrl);
              await ImageUploadService.deleteCarImage(imageUrl);
              await loadCarDetails();
              Alert.alert('Success', 'Photo deleted successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete photo');
            } finally {
              setDeletingImage(null);
            }
          },
        },
      ]
    );
  };
  
  const handleAddMaintenance = () => {
    navigation.navigate('AddMaintenance', { carId });
  };
  
  const handleEditMaintenance = (maintenanceId: string) => {
    navigation.navigate('EditMaintenance', { maintenanceId });
  };
  
  const handleDeleteMaintenance = async () => {
    if (!selectedMaintenanceId) return;
    
    setDeletingMaintenance(true);
    try {
      await DatabaseService.deleteMaintenanceRecord(selectedMaintenanceId);
      Alert.alert('Success', 'Maintenance record deleted successfully');
      await loadMaintenanceRecords();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete maintenance record');
    } finally {
      setDeletingMaintenance(false);
      setDeleteMaintenanceDialogVisible(false);
      setSelectedMaintenanceId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
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
          <MaterialCommunityIcons name="car" size={60} color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Loading car details...
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
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.error }]}>
            Car Not Found
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backIconButton}
          />

          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="car" size={48} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={[styles.carTitle, { color: theme.colors.onSurface }]}>
              {car.make} {car.model}
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {car.year}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="pencil"
              onPress={handleEdit}
              style={styles.editButton}
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              icon="delete"
              onPress={() => setDeleteDialogVisible(true)}
              style={styles.deleteButton}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </View>
        </Animatable.View>

        {/* Car Photos */}
        <Animatable.View animation="fadeInUp" duration={800} delay={150}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Car Photos
                </Text>
                <Button
                  mode="contained"
                  icon="camera-plus"
                  onPress={handleAddImage}
                  disabled={uploadingImage}
                  loading={uploadingImage}
                  compact
                >
                  Add Photo
                </Button>
              </View>

              {car.imageUrls && car.imageUrls.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {car.imageUrls.map((imageUrl, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.carImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={[styles.deleteImageButton, { backgroundColor: theme.colors.error }]}
                        onPress={() => handleDeleteImage(imageUrl)}
                        disabled={deletingImage === imageUrl}
                      >
                        {deletingImage === imageUrl ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <MaterialCommunityIcons name="delete" size={20} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noPhotosContainer}>
                  <MaterialCommunityIcons 
                    name="camera-off" 
                    size={48} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.noPhotosText, { color: theme.colors.onSurfaceVariant }]}
                  >
                    No photos yet. Add your first photo!
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Basic Information */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Basic Information
              </Text>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="car" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Make & Model
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {car.make} {car.model}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Year
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {car.year}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="shape" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Type
                  </Text>
                  <Chip style={styles.chip}>{car.subType}</Chip>
                </View>
              </View>
              <Divider style={styles.divider} />

              {car.color && (
                <>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="palette" size={24} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Color
                      </Text>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        {car.color}
                      </Text>
                    </View>
                  </View>
                  <Divider style={styles.divider} />
                </>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Vehicle Identification */}
        <Animatable.View animation="fadeInUp" duration={800} delay={300}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Vehicle Identification
              </Text>

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
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Current Mileage
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {car.mileage?.toLocaleString()} km
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />

              {car.vin && (
                <>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="barcode" size={24} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        VIN
                      </Text>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        {car.vin}
                      </Text>
                    </View>
                  </View>
                  <Divider style={styles.divider} />
                </>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Maintenance History */}
        {(car.firstMaintenance || car.firstOilChangeDate || car.oilChangeInterval) && (
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Maintenance History
                </Text>

                {car.firstMaintenance && (
                  <>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="wrench" size={24} color={theme.colors.onSurfaceVariant} />
                      <View style={styles.detailContent}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          First Maintenance Date
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                          {formatDate(car.firstMaintenance)}
                        </Text>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </>
                )}

                {car.firstOilChangeDate && (
                  <>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="oil" size={24} color={theme.colors.onSurfaceVariant} />
                      <View style={styles.detailContent}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          First Oil Change Date
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                          {formatDate(car.firstOilChangeDate)}
                        </Text>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </>
                )}

                {car.mileageAtFirstOilChange && (
                  <>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="counter" size={24} color={theme.colors.onSurfaceVariant} />
                      <View style={styles.detailContent}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Mileage at First Oil Change
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                          {car.mileageAtFirstOilChange.toLocaleString()} km
                        </Text>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </>
                )}

                {car.oilChangeInterval && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.onSurfaceVariant} />
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Oil Change Interval
                      </Text>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        Every {car.oilChangeInterval.toLocaleString()} km
                      </Text>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}
        
        {/* Maintenance Records Section */}
        <Animatable.View animation="fadeInUp" duration={800} delay={500}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface, marginBottom: 0 }]}>
                  Maintenance Records
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={handleAddMaintenance}
                  compact
                >
                  Add
                </Button>
              </View>

              {loadingMaintenance ? (
                <View style={styles.emptyState}>
                  <Text>Loading maintenance records...</Text>
                </View>
              ) : maintenanceRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="wrench-outline" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                    No maintenance records yet
                  </Text>
                  <Button mode="outlined" onPress={handleAddMaintenance} style={{ marginTop: 16 }}>
                    Add First Record
                  </Button>
                </View>
              ) : (
                maintenanceRecords.map((record) => (
                  <Card key={record.id} style={styles.maintenanceCard}>
                    <Card.Content>
                      <View style={styles.maintenanceHeader}>
                        <View style={styles.maintenanceInfo}>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {formatDate(record.maintenanceDate)}
                          </Text>
                        </View>
                        <View style={styles.maintenanceActions}>
                          <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => handleEditMaintenance(record.id)}
                          />
                          <IconButton
                            icon="delete"
                            iconColor={theme.colors.error}
                            size={20}
                            onPress={() => {
                              setSelectedMaintenanceId(record.id);
                              setDeleteMaintenanceDialogVisible(true);
                            }}
                          />
                        </View>
                      </View>

                      <Text variant="bodyMedium" style={styles.maintenanceDescription}>
                        {record.description}
                      </Text>

                      <View style={styles.maintenanceDetails}>
                        {record.mileage && (
                          <View style={styles.maintenanceDetailItem}>
                            <MaterialCommunityIcons name="speedometer" size={16} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                              {record.mileage.toLocaleString()} km
                            </Text>
                          </View>
                        )}
                        {record.performedBy && (
                          <View style={styles.maintenanceDetailItem}>
                            <MaterialCommunityIcons name="account" size={16} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                              {record.performedBy}
                            </Text>
                          </View>
                        )}
                        {record.cost && (
                          <View style={styles.maintenanceDetailItem}>
                            <MaterialCommunityIcons name="currency-usd" size={16} color={theme.colors.primary} />
                            <Text variant="bodySmall" style={{ color: theme.colors.primary, marginLeft: 4, fontWeight: 'bold' }}>
                              €{record.cost.toFixed(2)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {record.notes && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, fontStyle: 'italic' }}>
                          Note: {record.notes}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))
              )}
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title>Delete Car?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this car? This action cannot be undone and will also delete all
              associated maintenance records and oil change history.
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
        
        {/* Delete Maintenance Confirmation Dialog */}
        <Dialog visible={deleteMaintenanceDialogVisible} onDismiss={() => setDeleteMaintenanceDialogVisible(false)}>
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title>Delete Maintenance Record?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this maintenance record? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteMaintenanceDialogVisible(false)} disabled={deletingMaintenance}>
              Cancel
            </Button>
            <Button
              onPress={handleDeleteMaintenance}
              loading={deletingMaintenance}
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
  errorTitle: {
    marginTop: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backIconButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  carTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingHorizontal: 16,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
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
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 8,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageScroll: {
    marginTop: 8,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noPhotosText: {
    marginTop: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  maintenanceCard: {
    marginBottom: 12,
    elevation: 2,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  maintenanceDescription: {
    marginBottom: 12,
    fontWeight: '500',
  },
  maintenanceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  maintenanceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CarDetailsScreen;
