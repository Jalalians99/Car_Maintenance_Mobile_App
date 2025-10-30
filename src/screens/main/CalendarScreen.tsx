import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  Card,
  Chip,
  FAB,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import { Car, MaintenanceRecord, RootStackParamList } from '../../types';
import * as Animatable from 'react-native-animatable';

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: CalendarScreenNavigationProp;
}

interface MaintenanceWithCar extends MaintenanceRecord {
  carInfo?: Car;
}

const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<MaintenanceWithCar[]>([]);
  const [overdueMaintenance, setOverdueMaintenance] = useState<MaintenanceWithCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMaintenanceSchedule = async () => {
    if (!user) return;

    try {
      // Get all user's cars
      const cars = await DatabaseService.getUserCars(user.id);

      const now = new Date();
      const upcoming: MaintenanceWithCar[] = [];
      const overdue: MaintenanceWithCar[] = [];

      // Get maintenance records for each car
      for (const car of cars) {
        try {
          const maintenanceRecords = await DatabaseService.getCarMaintenanceRecords(car.id);
          
          // Filter records with nextDueDate
          maintenanceRecords.forEach(record => {
            if (record.nextDueDate) {
              const dueDate = new Date(record.nextDueDate);
              const recordWithCar = { ...record, carInfo: car };
              
              if (dueDate < now) {
                overdue.push(recordWithCar);
              } else {
                upcoming.push(recordWithCar);
              }
            }
          });
        } catch (error) {
          // Error loading maintenance for this car, continue with others
        }
      }

      // Sort by date
      upcoming.sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());
      overdue.sort((a, b) => new Date(b.nextDueDate!).getTime() - new Date(a.nextDueDate!).getTime());

      setUpcomingMaintenance(upcoming);
      setOverdueMaintenance(overdue);
    } catch (error) {
      // Error loading maintenance schedule
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMaintenanceSchedule();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMaintenanceSchedule();
  };

  const handleAddMaintenance = () => {
    navigation.navigate('Cars');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const now = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else if (diffDays <= 30) {
      return `Due in ${Math.ceil(diffDays / 7)} weeks`;
    } else {
      return `Due in ${Math.ceil(diffDays / 30)} months`;
    }
  };

  const renderMaintenanceCard = (item: MaintenanceWithCar, index: number, isOverdue: boolean = false) => (
    <Animatable.View
      key={item.id}
      animation="fadeInUp"
      duration={800}
      delay={index * 100}
    >
      <Card
        style={[
          styles.maintenanceCard,
          { backgroundColor: isOverdue ? theme.colors.errorContainer : theme.colors.surface },
        ]}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="wrench"
                size={24}
                color={isOverdue ? theme.colors.onErrorContainer : theme.colors.primary}
              />
            </View>
            <View style={styles.cardInfo}>
              <Text
                variant="titleMedium"
                style={{
                  color: isOverdue ? theme.colors.onErrorContainer : theme.colors.onSurface,
                  fontWeight: 'bold',
                }}
              >
                {item.serviceType}
              </Text>
              {item.carInfo && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.carInfo.make} {item.carInfo.model} ({item.carInfo.year})
                </Text>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.dateContainer}>
            <Chip
              icon="calendar"
              style={styles.chip}
              textStyle={{ fontSize: 12 }}
            >
              {formatDate(item.nextDueDate!)}
            </Chip>
            <Chip
              icon="clock-outline"
              style={[
                styles.chip,
                isOverdue && { backgroundColor: theme.colors.error },
              ]}
              textStyle={{
                fontSize: 12,
                color: isOverdue ? theme.colors.onError : undefined,
              }}
            >
              {getDaysUntil(item.nextDueDate!)}
            </Chip>
          </View>

          {item.notes && (
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="calendar-check"
        size={120}
        color={theme.colors.onSurfaceDisabled}
      />
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No Scheduled Maintenance
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Add maintenance records to your cars to see upcoming service reminders
      </Text>
      <FAB
        icon="car"
        label="View My Cars"
        onPress={handleAddMaintenance}
        style={[styles.emptyFab, { backgroundColor: theme.colors.primary }]}
      />
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="calendar-clock" size={60} color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Loading schedule...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {upcomingMaintenance.length === 0 && overdueMaintenance.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Overdue Maintenance */}
          {overdueMaintenance.length > 0 && (
            <Animatable.View animation="fadeInDown" duration={800}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color={theme.colors.error}
                />
                <Text
                  variant="titleLarge"
                  style={[styles.sectionTitle, { color: theme.colors.error }]}
                >
                  Overdue ({overdueMaintenance.length})
                </Text>
              </View>
              {overdueMaintenance.map((item, index) => renderMaintenanceCard(item, index, true))}
            </Animatable.View>
          )}

          {/* Upcoming Maintenance */}
          {upcomingMaintenance.length > 0 && (
            <Animatable.View animation="fadeInUp" duration={800} delay={200}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleLarge"
                  style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
                >
                  Upcoming ({upcomingMaintenance.length})
                </Text>
              </View>
              {upcomingMaintenance.map((item, index) => renderMaintenanceCard(item, index, false))}
            </Animatable.View>
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        onPress={handleAddMaintenance}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  maintenanceCard: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  notes: {
    fontStyle: 'italic',
    marginTop: 8,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CalendarScreen;
