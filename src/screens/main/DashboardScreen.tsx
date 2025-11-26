import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  Card,
  FAB,
  useTheme,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import { RootStackParamList } from '../../types';
import * as Animatable from 'react-native-animatable';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

interface DashboardStats {
  totalCars: number;
  totalMaintenanceRecords: number;
  totalMaintenanceCost: number;
  upcomingMaintenance: number;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    totalMaintenanceRecords: 0,
    totalMaintenanceCost: 0,
    upcomingMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const dashboardStats = await DatabaseService.getDashboardStats(user.id);
      setStats(dashboardStats);
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddCar = () => {
    navigation.navigate('AddCar');
  };

  const handleViewCars = () => {
    navigation.navigate('Cars');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleFindWorkshops = () => {
    navigation.navigate('WorkshopFinder');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={48} 
                label={user?.firstName?.charAt(0) || 'U'} 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.greetingContainer}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {getGreeting()}, {user?.firstName}!
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Manage your vehicles efficiently
                </Text>
              </View>
            </View>
            
            <IconButton
              icon="bell"
              iconColor={theme.colors.onSurface}
              size={24}
              onPress={handleNotifications}
            />
          </View>
        </Animatable.View>

        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Overview
              </Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons 
                      name="car-multiple" 
                      size={24} 
                      color={theme.colors.onPrimaryContainer} 
                    />
                  </View>
                  <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                    {stats.totalCars}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Total Cars
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <MaterialCommunityIcons 
                      name="wrench" 
                      size={24} 
                      color={theme.colors.onSecondaryContainer} 
                    />
                  </View>
                  <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                    {stats.totalMaintenanceRecords}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Maintenance
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Financial Overview */}
        <Animatable.View animation="fadeInUp" duration={800} delay={300}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Financial Overview
              </Text>
              
              <View style={styles.financialContainer}>
                <View style={styles.financialItem}>
                  <MaterialCommunityIcons 
                    name="cash" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <View style={styles.financialText}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
                      {formatCurrency(stats.totalMaintenanceCost)}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Total Maintenance Cost
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Upcoming Maintenance */}
        {stats.upcomingMaintenance > 0 && (
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Upcoming Maintenance
                </Text>
                
                <View style={styles.alertContainer}>
                  <MaterialCommunityIcons 
                    name="alert-circle" 
                    size={24} 
                    color={theme.colors.secondary} 
                  />
                  <Text variant="bodyLarge" style={[styles.alertText, { color: theme.colors.onSurface }]}>
                    You have {stats.upcomingMaintenance} upcoming maintenance{stats.upcomingMaintenance > 1 ? 's' : ''}
                  </Text>
                </View>
                
                <Chip 
                  icon="calendar" 
                  onPress={() => navigation.navigate('Calendar')}
                  style={styles.viewCalendarChip}
                >
                  View Calendar
                </Chip>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={800} delay={500}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Quick Actions
              </Text>
              
              <View style={styles.quickActions}>
                <Card 
                  style={styles.actionCard} 
                  onPress={handleAddCar}
                >
                  <Card.Content style={styles.actionContent}>
                    <MaterialCommunityIcons 
                      name="plus-circle" 
                      size={32} 
                      color={theme.colors.primary} 
                    />
                    <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onSurface }]}>
                      Add Car
                    </Text>
                  </Card.Content>
                </Card>

                <Card 
                  style={styles.actionCard} 
                  onPress={handleViewCars}
                >
                  <Card.Content style={styles.actionContent}>
                    <MaterialCommunityIcons 
                      name="car-multiple" 
                      size={32} 
                      color={theme.colors.primary} 
                    />
                    <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onSurface }]}>
                      View Cars
                    </Text>
                  </Card.Content>
                </Card>

                <Card 
                  style={styles.actionCard} 
                  onPress={handleFindWorkshops}
                >
                  <Card.Content style={styles.actionContent}>
                    <MaterialCommunityIcons 
                      name="map-marker-radius" 
                      size={32} 
                      color={theme.colors.primary} 
                    />
                    <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onSurface }]}>
                      Find Hedin
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>

      <FAB
        icon="plus"
        onPress={handleAddCar}
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
    paddingBottom: 80,
  },
  header: {
    marginVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: 16,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  financialContainer: {
    alignItems: 'center',
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialText: {
    marginLeft: 16,
    alignItems: 'center',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertText: {
    marginLeft: 12,
    flex: 1,
  },
  viewCalendarChip: {
    alignSelf: 'flex-start',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
