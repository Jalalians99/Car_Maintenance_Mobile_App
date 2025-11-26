import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  Avatar,
  List,
  Divider,
  Button,
  Dialog,
  Portal,
  Card,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import * as Animatable from 'react-native-animatable';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
      setLogoutDialogVisible(false);
    }
  };

  const showLogoutDialog = () => setLogoutDialogVisible(true);
  const hideLogoutDialog = () => setLogoutDialogVisible(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animatable.View animation="fadeInDown" duration={800}>
          <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.profileContent}>
              <Avatar.Text
                size={80}
                label={`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`}
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              />
              
              <Text variant="headlineMedium" style={[styles.userName, { color: theme.colors.onSurface }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              
              <Text variant="bodyMedium" style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
                {user?.email}
              </Text>

              {user?.username && (
                <Text variant="bodySmall" style={[styles.username, { color: theme.colors.onSurfaceVariant }]}>
                  @{user.username}
                </Text>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Account Information */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Account Information
              </Text>

              <List.Item
                title="First Name"
                description={user?.firstName || 'Not set'}
                left={props => <List.Icon {...props} icon="account" />}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <Divider />

              <List.Item
                title="Last Name"
                description={user?.lastName || 'Not set'}
                left={props => <List.Icon {...props} icon="account" />}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <Divider />

              <List.Item
                title="Email"
                description={user?.email || 'Not set'}
                left={props => <List.Icon {...props} icon="email" />}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <Divider />

              {user?.phoneNumber && (
                <>
                  <List.Item
                    title="Phone Number"
                    description={user.phoneNumber}
                    left={props => <List.Icon {...props} icon="phone" />}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  />
                  <Divider />
                </>
              )}

              {user?.dateOfBirth && (
                <>
                  <List.Item
                    title="Date of Birth"
                    description={user.dateOfBirth}
                    left={props => <List.Icon {...props} icon="calendar" />}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  />
                  <Divider />
                </>
              )}

              <List.Item
                title="Member Since"
                description={new Date(user?.createdAt || '').toLocaleDateString()}
                left={props => <List.Icon {...props} icon="clock-outline" />}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* App Settings */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                App Settings
              </Text>


              <List.Item
                title="Dark Mode"
                description={isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                left={props => <List.Icon {...props} icon={isDarkMode ? 'weather-night' : 'white-balance-sunny'} />}
                right={() => (
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    color={theme.colors.primary}
                  />
                )}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <Divider />

            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Logout Button */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <Button
            mode="contained"
            onPress={showLogoutDialog}
            icon="logout"
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            contentStyle={styles.logoutButtonContent}
          >
            Logout
          </Button>
        </Animatable.View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            CarWorkshop Mobile v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={hideLogoutDialog}>
          <Dialog.Icon icon="logout" />
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideLogoutDialog}>Cancel</Button>
            <Button onPress={handleLogout} loading={loading}>
              Logout
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    marginBottom: 4,
  },
  username: {
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});

export default ProfileScreen;
