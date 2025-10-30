import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Surface, Text, useTheme, List, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { exportAllData } from '../../utils/dataExport';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to export data');
      return;
    }

    Alert.alert(
      'Export Data',
      'This will create a JSON backup of all your cars, maintenance records, and reminders. You can save this file and use it to restore your data if needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              setExporting(true);
              await exportAllData(user.id);
              Alert.alert(
                'Success',
                'Your data has been exported successfully! Choose where to save the backup file.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              Alert.alert(
                'Export Failed',
                error.message || 'Failed to export data. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setExporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Settings
          </Text>

          <Divider style={styles.divider} />

          {/* Account Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Account
          </Text>
          <List.Item
            title="Email"
            description={user?.email || 'Not logged in'}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Name"
            description={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set'}
            left={(props) => <List.Icon {...props} icon="account" />}
          />

          <Divider style={styles.divider} />

          {/* Data Management Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Data Management
          </Text>

          <List.Item
            title="Export Data"
            description="Backup all your data to a JSON file"
            left={(props) => <List.Icon {...props} icon="database-export" />}
            right={() => (
              exporting ? (
                <ActivityIndicator size="small" style={{ marginRight: 16 }} />
              ) : (
                <Button mode="contained" onPress={handleExportData} compact>
                  Export
                </Button>
              )
            )}
          />

          <View style={styles.infoBox}>
            <List.Icon icon="information" color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
              Regular backups are recommended to prevent data loss. Export your data and save it to a safe location.
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* App Info Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            App Information
          </Text>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
          <List.Item
            title="Firebase Project"
            description="car-workshop-mobile"
            left={(props) => <List.Icon {...props} icon="cloud" />}
          />
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginHorizontal: 16,
  },
});

export default SettingsScreen;
