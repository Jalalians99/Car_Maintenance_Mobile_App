import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, Alert } from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  FAB,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import { Car, RootStackParamList } from '../../types';
import * as Animatable from 'react-native-animatable';

type CarsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: CarsScreenNavigationProp;
}

const CarsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCars = async () => {
    if (!user) return;

    try {
      const userCars = await DatabaseService.getUserCars(user.id);
      setCars(userCars);
      setFilteredCars(userCars);
    } catch (error) {
      // Error loading cars
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCars();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCars(cars);
    } else {
      const filtered = cars.filter(
        (car) =>
          car.make.toLowerCase().includes(query.toLowerCase()) ||
          car.model.toLowerCase().includes(query.toLowerCase()) ||
          car.year.toString().includes(query) ||
          car.licensePlate?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCars(filtered);
    }
  };

  const handleAddCar = () => {
    navigation.navigate('AddCar');
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('CarDetails', { carId: car.id });
  };

  const renderEmptyState = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="car-off"
        size={120}
        color={theme.colors.onSurfaceDisabled}
      />
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No Cars Yet
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Start by adding your first car to track its maintenance history
      </Text>
      <FAB
        icon="plus"
        label="Add Your First Car"
        onPress={handleAddCar}
        style={[styles.emptyFab, { backgroundColor: theme.colors.primary }]}
      />
    </Animatable.View>
  );

  const handleEditCar = (car: Car) => {
    navigation.navigate('EditCar', { carId: car.id });
  };

  const handleDeleteCar = (car: Car) => {
    Alert.alert(
      'Delete Car',
      `Are you sure you want to delete ${car.make} ${car.model}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteCar(car.id);
              loadCars(); // Reload the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete car');
            }
          },
        },
      ]
    );
  };

  const renderCarCard = (car: Car, index: number) => (
    <Animatable.View
      key={car.id}
      animation="fadeInUp"
      duration={800}
      delay={index * 100}
    >
      <Card
        style={[styles.carCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleCarPress(car)}
      >
        <Card.Content>
          <View style={styles.carHeader}>
            <View style={styles.carInfo}>
              <Text variant="titleLarge" style={[styles.carTitle, { color: theme.colors.onSurface }]}>
                {car.make} {car.model}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {car.year}
              </Text>
            </View>
            <IconButton
              icon="chevron-right"
              iconColor={theme.colors.onSurfaceVariant}
              onPress={() => handleCarPress(car)}
            />
          </View>

          <View style={styles.carDetails}>
            {car.licensePlate && (
              <Chip
                icon="card-text"
                style={styles.chip}
                textStyle={{ fontSize: 12 }}
              >
                {car.licensePlate}
              </Chip>
            )}
            {car.vin && (
              <Chip
                icon="barcode"
                style={styles.chip}
                textStyle={{ fontSize: 12 }}
              >
                VIN: {car.vin.substring(0, 8)}...
              </Chip>
            )}
          </View>

          {car.mileage && (
            <View style={styles.mileageContainer}>
              <MaterialCommunityIcons
                name="speedometer"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={[styles.mileageText, { color: theme.colors.onSurfaceVariant }]}>
                {car.mileage.toLocaleString()} km
              </Text>
            </View>
          )}

          {car.notes && (
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}
            >
              {car.notes}
            </Text>
          )}

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => handleEditCar(car)}
              style={styles.actionButton}
              compact
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              icon="delete"
              onPress={() => handleDeleteCar(car)}
              style={styles.actionButton}
              textColor={theme.colors.error}
              compact
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="car" size={60} color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Loading your cars...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.searchContainer}>
          <Searchbar
            placeholder="Search cars..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
          />
        </Animatable.View>
      </View>

      {cars.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <Animatable.View animation="fadeInDown" duration={800}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                My Cars ({filteredCars.length})
              </Text>
            </Animatable.View>

            {filteredCars.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={60}
                  color={theme.colors.onSurfaceDisabled}
                />
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  No cars match your search
                </Text>
              </View>
            ) : (
              filteredCars.map((car, index) => renderCarCard(car, index))
            )}
          </ScrollView>

          <FAB
            icon="plus"
            onPress={handleAddCar}
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          />
        </>
      )}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  carCard: {
    marginBottom: 16,
    elevation: 4,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carInfo: {
    flex: 1,
  },
  carTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  carDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  mileageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mileageText: {
    marginLeft: 8,
  },
  notes: {
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyFab: {
    marginTop: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CarsScreen;
