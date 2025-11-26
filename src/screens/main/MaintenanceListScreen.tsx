import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  Card,
  Chip,
  IconButton,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import { Car, RootStackParamList } from '../../types';
import * as Animatable from 'react-native-animatable';

type MaintenanceListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: MaintenanceListScreenNavigationProp;
}

interface CarWithRecordCount extends Car {
  recordCount?: number;
}

export const MaintenanceListScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();

  const [cars, setCars] = useState<CarWithRecordCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCars();
    }, [user])
  );

  const loadCars = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const carsData = await DatabaseService.getUserCars(user.id);

      const carsWithCounts = await Promise.all(
        carsData.map(async (car) => {
          const records = await DatabaseService.getCarMaintenanceRecords(car.id);
          return {
            ...car,
            recordCount: records.length,
          };
        })
      );

      setCars(carsWithCounts);
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars();
    setRefreshing(false);
  };

  const handleCarPress = (carId: string) => {
    navigation.navigate('MaintenanceList', { carId });
  };

  const filteredCars = cars.filter((car) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      car.make.toLowerCase().includes(searchLower) ||
      car.model.toLowerCase().includes(searchLower) ||
      car.licensePlate.toLowerCase().includes(searchLower) ||
      car.year.toString().includes(searchLower) ||
      car.subType.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Loading cars...
          </Text>
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
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Maintenance Records
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Select a car to view its maintenance history
          </Text>
        </Animatable.View>

        {/* Search Bar */}
        <Animatable.View animation="fadeIn" duration={800} delay={200}>
          <Searchbar
            placeholder="Search by make, model, type, license plate..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </Animatable.View>

        {/* Cars List */}
        {filteredCars.length === 0 ? (
          <Animatable.View animation="fadeIn" duration={800} delay={400}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="car-off" size={64} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  {searchQuery ? 'No Matching Cars' : 'No Cars Found'}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add a car to start tracking maintenance records'}
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        ) : (
          filteredCars.map((car, index) => (
            <Animatable.View
              key={car.id}
              animation="fadeInUp"
              duration={600}
              delay={400 + index * 100}
            >
              <TouchableOpacity onPress={() => handleCarPress(car.id)}>
                <Card style={styles.carCard}>
                  <Card.Content>
                    <View style={styles.carHeader}>
                      <View style={styles.carIcon}>
                        <MaterialCommunityIcons name="car" size={40} color={theme.colors.primary} />
                      </View>
                      <View style={styles.carInfo}>
                        <Text variant="titleLarge" style={[styles.carName, { color: theme.colors.onSurface }]}>
                          {car.make} {car.model}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                          {car.year}
                        </Text>
                        <View style={styles.carDetails}>
                          <Chip 
                            icon="card-text" 
                            style={styles.chip}
                            textStyle={styles.chipText}
                          >
                            {car.licensePlate}
                          </Chip>
                          <Chip 
                            icon="shape" 
                            style={styles.chip}
                            textStyle={styles.chipText}
                          >
                            {car.subType}
                          </Chip>
                        </View>
                      </View>
                      <View style={styles.carStats}>
                        <View style={styles.recordBadge}>
                          <MaterialCommunityIcons name="wrench" size={20} color={theme.colors.primary} />
                          <Text variant="titleMedium" style={[styles.recordCount, { color: theme.colors.primary }]}>
                            {car.recordCount || 0}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                          {car.recordCount === 1 ? 'Record' : 'Records'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.carFooter}>
                      <View style={styles.mileageInfo}>
                        <MaterialCommunityIcons name="speedometer" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={[styles.mileageText, { color: theme.colors.onSurfaceVariant }]}>
                          {car.mileage.toLocaleString()} km
                        </Text>
                      </View>
                      <IconButton
                        icon="chevron-right"
                        size={24}
                        iconColor={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </Animatable.View>
          ))
        )}
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
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
  carCard: {
    marginBottom: 12,
    elevation: 4,
  },
  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carIcon: {
    marginRight: 16,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  carDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  chip: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    lineHeight: 16,
    marginVertical: 0,
  },
  carStats: {
    alignItems: 'center',
    marginLeft: 12,
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  recordCount: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mileageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mileageText: {
    marginLeft: 4,
  },
});
