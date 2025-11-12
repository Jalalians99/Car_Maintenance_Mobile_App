import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  Card,
  Chip,
  ActivityIndicator,
  Button,
  FAB,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database';
import { Car, Reminder } from '../../types';
import * as Animatable from 'react-native-animatable';

interface ReminderNotification {
  id: string;
  reminder: Reminder;
  car?: Car;
  status: 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  daysUntil: number;
  message: string;
}

const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [user])
  );

  const loadReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const reminders = await DatabaseService.getUserReminders(user.id);
      const cars = await DatabaseService.getUserCars(user.id);

      const reminderNotifications: ReminderNotification[] = [];

      for (const reminder of reminders) {
        if (!reminder || !reminder.id || !reminder.reminderDate) {
          continue;
        }

        if (reminder.status === 'completed' || reminder.status === 'dismissed') {
          continue;
        }

        let car: Car | undefined;
        if (reminder.carId) {
          car = cars.find(c => c.id === reminder.carId);
        }

        const notification = calculateReminderStatus(reminder, car);
        if (notification && notification.reminder) {
          reminderNotifications.push(notification);
        }
      }

      reminderNotifications.sort((a, b) => a.daysUntil - b.daysUntil);

      setNotifications(reminderNotifications);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateReminderStatus = (
    reminder: Reminder,
    car?: Car
  ): ReminderNotification | null => {
    if (!reminder || !reminder.id || !reminder.reminderDate) {
      return null;
    }

    const reminderDate = new Date(reminder.reminderDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reminderDate.setHours(0, 0, 0, 0);

    if (isNaN(reminderDate.getTime())) {
      return null;
    }

    const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
    let message: string;

    if (daysUntil < 0) {
      status = 'overdue';
      message = `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`;
    } else if (daysUntil === 0) {
      status = 'due_today';
      message = 'Due today';
    } else if (daysUntil <= (reminder.notifyBefore || 1)) {
      status = 'due_soon';
      message = `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    } else {
      status = 'upcoming';
      message = `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    }

    return {
      id: reminder.id,
      reminder,
      car,
      status,
      daysUntil,
      message,
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  const handleAddReminder = () => {
    navigation.navigate('AddReminder');
  };

  const handleManageReminders = () => {
    navigation.navigate('ManageReminders');
  };

  const handleViewReminder = (notification: ReminderNotification) => {
    navigation.navigate('EditReminder', { reminderId: notification.id });
  };

  const handleDismissReminder = async (notification: ReminderNotification) => {
    Alert.alert(
      'Dismiss Reminder',
      'Are you sure you want to dismiss this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.updateReminder(notification.id, {
                status: 'dismissed',
              });
              loadReminders();
            } catch (error) {
              Alert.alert('Error', 'Failed to dismiss reminder');
            }
          },
        },
      ]
    );
  };

  const handleCompleteReminder = async (notification: ReminderNotification) => {
    Alert.alert(
      'Complete Reminder',
      'Mark this reminder as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await DatabaseService.updateReminder(notification.id, {
                status: 'completed',
              });
              loadReminders();
            } catch (error) {
              Alert.alert('Error', 'Failed to complete reminder');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return theme.colors.error;
      case 'due_today':
        return '#FF9800'; // Orange
      case 'due_soon':
        return '#FFC107'; // Amber
      case 'upcoming':
        return theme.colors.primary;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'alert-circle';
      case 'due_today':
        return 'clock-alert';
      case 'due_soon':
        return 'clock';
      case 'upcoming':
        return 'calendar';
      default:
        return 'bell';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'OVERDUE';
      case 'due_today':
        return 'TODAY';
      case 'due_soon':
        return 'DUE SOON';
      case 'upcoming':
        return 'UPCOMING';
      default:
        return 'PENDING';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading reminders...</Text>
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
            <View>
              <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                Reminders
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {notifications.length} active reminder{notifications.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Button
              mode="outlined"
              icon="cog"
              onPress={handleManageReminders}
              compact
            >
              Manage
            </Button>
          </View>
        </Animatable.View>

        {notifications.length === 0 && (
          <Animatable.View animation="fadeIn" duration={800} delay={200}>
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={64}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.emptyIcon}
                />
                <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  No Active Reminders
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}
                >
                  Create reminders for car maintenance, inspections, insurance renewals, and more.
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={handleAddReminder}
                  style={styles.emptyButton}
                >
                  Add Reminder
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {notifications.map((notification, index) => {
          if (!notification || !notification.reminder) return null;
          
          return (
            <Animatable.View
              key={notification.id}
              animation="fadeInUp"
              duration={800}
              delay={200 + index * 100}
            >
              <Card
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderLeftColor: getStatusColor(notification.status),
                  },
                ]}
                onPress={() => handleViewReminder(notification)}
              >
                <Card.Content>
                  <View style={styles.notificationHeader}>
                    <Chip
                      icon={getStatusIcon(notification.status)}
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(notification.status) + '20' },
                      ]}
                      textStyle={{ color: getStatusColor(notification.status), fontWeight: 'bold' }}
                    >
                      {getStatusLabel(notification.status)}
                    </Chip>
                  </View>

                  <Text
                    variant="titleMedium"
                    style={[styles.reminderTitle, { color: theme.colors.onSurface }]}
                  >
                    {notification.reminder?.title || 'Untitled Reminder'}
                  </Text>

                  {notification.car && (
                    <View style={styles.carInfo}>
                      <MaterialCommunityIcons
                        name="car"
                        size={16}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text
                        variant="bodySmall"
                        style={[styles.carText, { color: theme.colors.onSurfaceVariant }]}
                      >
                        {notification.car.make} {notification.car.model} ({notification.car.licensePlate})
                      </Text>
                    </View>
                  )}

                  {notification.reminder?.description && (
                    <Text
                      variant="bodyMedium"
                      style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
                      numberOfLines={2}
                    >
                      {notification.reminder.description}
                    </Text>
                  )}

                  {notification.reminder?.reminderDate && (
                    <View style={styles.dateTimeRow}>
                      <View style={styles.dateTimeItem}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={16}
                          color={theme.colors.primary}
                        />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                          {new Date(notification.reminder.reminderDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      {notification.reminder.reminderTime && (
                        <View style={styles.dateTimeItem}>
                          <MaterialCommunityIcons
                            name="clock-outline"
                            size={16}
                            color={theme.colors.primary}
                          />
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                            {notification.reminder.reminderTime}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={[styles.messageBox, { backgroundColor: getStatusColor(notification.status) + '10' }]}>
                    <Text
                      variant="bodyMedium"
                      style={[styles.messageText, { color: getStatusColor(notification.status) }]}
                    >
                      {notification.message || 'No message'}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <Button
                      mode="outlined"
                      icon="check"
                      onPress={() => handleCompleteReminder(notification)}
                      style={styles.actionButton}
                      compact
                    >
                      Complete
                    </Button>
                    <Button
                      mode="text"
                      icon="close"
                      onPress={() => handleDismissReminder(notification)}
                      style={styles.actionButton}
                      textColor={theme.colors.error}
                      compact
                    >
                      Dismiss
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Animatable.View>
          );
        })}

        {notifications.length > 0 && (
          <Animatable.View animation="fadeIn" duration={800} delay={notifications.length * 100 + 400}>
            <Card style={[styles.infoCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content>
                <View style={styles.infoContent}>
                  <MaterialCommunityIcons
                    name="information"
                    size={24}
                    color={theme.colors.onPrimaryContainer}
                  />
                  <Text
                    variant="bodySmall"
                    style={[styles.infoText, { color: theme.colors.onPrimaryContainer }]}
                  >
                    Tap any reminder to view details or edit. Swipe down to refresh.
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        onPress={handleAddReminder}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        label="Add Reminder"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyButton: {
    minWidth: 200,
  },
  notificationCard: {
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  reminderTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  carText: {
    marginLeft: 4,
  },
  description: {
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  infoCard: {
    marginTop: 8,
    elevation: 1,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default NotificationsScreen;
