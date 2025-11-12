import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  Card,
  Chip,
  ActivityIndicator,
  FAB,
  IconButton,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import { Reminder, RootStackParamList } from '../../types';
import * as Animatable from 'react-native-animatable';

type ManageRemindersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManageReminders'>;

interface Props {
  navigation: ManageRemindersScreenNavigationProp;
}

export const ManageRemindersScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [user])
  );

  const loadReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userReminders = await DatabaseService.getUserReminders(user.id);
      setReminders(userReminders);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await DatabaseService.updateReminder(reminderId, { status: 'completed' });
      await loadReminders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update reminder status');
    }
  };

  const handleDismissReminder = async (reminderId: string) => {
    try {
      await DatabaseService.updateReminder(reminderId, { status: 'dismissed' });
      await loadReminders();
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss reminder');
    }
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${reminder.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteReminder(reminder.id);
              await loadReminders();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const getReminderStatus = (reminder: Reminder) => {
    if (reminder.status !== 'pending') return reminder.status;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.reminderDate);
    reminderDate.setHours(0, 0, 0, 0);
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (reminder.notifyBefore && diffDays <= reminder.notifyBefore) return 'due_soon';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#f44336';
      case 'today':
        return '#ff9800';
      case 'due_soon':
        return '#ffc107';
      case 'upcoming':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      case 'dismissed':
        return '#9e9e9e';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'alert-circle';
      case 'today':
        return 'calendar-today';
      case 'due_soon':
        return 'alert';
      case 'upcoming':
        return 'calendar-clock';
      case 'completed':
        return 'check-circle';
      case 'dismissed':
        return 'close-circle';
      default:
        return 'bell';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'Oil Change': 'oil',
      'Tire Rotation': 'car-tire-alert',
      'Inspection': 'clipboard-check',
      'Registration Renewal': 'card-account-details',
      'Insurance Renewal': 'shield-car',
      'Service Appointment': 'wrench-clock',
      'Car Wash': 'car-wash',
      'Custom': 'bell',
    };
    return icons[type] || 'bell';
  };

  const filteredReminders = reminders
    .filter((reminder) => {
      if (filterStatus === 'pending' && reminder.status !== 'pending') return false;
      if (filterStatus === 'completed' && reminder.status !== 'completed') return false;

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          reminder.title.toLowerCase().includes(searchLower) ||
          reminder.description?.toLowerCase().includes(searchLower) ||
          reminder.type.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime();
    });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onBackground }}>
            Loading reminders...
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
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="format-list-checks" size={32} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
              Manage Reminders
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {reminders.length} total reminder{reminders.length !== 1 ? 's' : ''}
          </Text>
        </Animatable.View>

        <Animatable.View animation="fadeIn" duration={800} delay={200}>
          <Searchbar
            placeholder="Search reminders..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </Animatable.View>

        <Animatable.View animation="fadeIn" duration={800} delay={300}>
          <SegmentedButtons
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as any)}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
            style={styles.filterButtons}
          />
        </Animatable.View>

        {filteredReminders.length === 0 ? (
          <Animatable.View animation="fadeIn" duration={800} delay={400}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="bell-off" size={64} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  {searchQuery ? 'No Matching Reminders' : filterStatus === 'completed' ? 'No Completed Reminders' : 'No Reminders'}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add a new reminder to get started'}
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        ) : (
          filteredReminders.map((reminder, index) => {
            const status = getReminderStatus(reminder);
            const statusColor = getStatusColor(status);

            return (
              <Animatable.View
                key={reminder.id}
                animation="fadeInUp"
                duration={600}
                delay={400 + index * 100}
              >
                <Card style={[styles.reminderCard, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.typeIconContainer}>
                        <MaterialCommunityIcons
                          name={getTypeIcon(reminder.type)}
                          size={24}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                          {reminder.title}
                        </Text>
                        <Chip
                          icon={getStatusIcon(status)}
                          style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                          textStyle={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </View>
                      <View style={styles.actions}>
                        {reminder.status === 'pending' && (
                          <>
                            <IconButton
                              icon="check"
                              size={20}
                              iconColor="#4caf50"
                              onPress={() => handleCompleteReminder(reminder.id)}
                            />
                            <IconButton
                              icon="close"
                              size={20}
                              iconColor="#ff9800"
                              onPress={() => handleDismissReminder(reminder.id)}
                            />
                          </>
                        )}
                        <IconButton
                          icon="pencil"
                          size={20}
                          iconColor={theme.colors.primary}
                          onPress={() => navigation.navigate('EditReminder', { reminderId: reminder.id })}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          iconColor="#f44336"
                          onPress={() => handleDeleteReminder(reminder)}
                        />
                      </View>
                    </View>

                    {reminder.description && (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                        {reminder.description}
                      </Text>
                    )}

                    <View style={styles.detailsContainer}>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurface, marginLeft: 4, fontWeight: 'bold' }}>
                          {formatDate(reminder.reminderDate)}
                          {reminder.reminderTime && ` at ${reminder.reminderTime}`}
                        </Text>
                      </View>
                      {reminder.carId && (
                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons name="car" size={16} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                            Car-specific reminder
                          </Text>
                        </View>
                      )}
                      {reminder.notifyBefore && (
                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons name="bell-alert" size={16} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                            Notify {reminder.notifyBefore} day{reminder.notifyBefore !== 1 ? 's' : ''} before
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              </Animatable.View>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="Add Reminder"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddReminder', {})}
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
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filterButtons: {
    marginBottom: 16,
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
  reminderCard: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  typeIconContainer: {
    marginTop: 4,
  },
  statusChip: {
    height: 20,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  detailsContainer: {
    marginTop: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});


