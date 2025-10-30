import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ServiceStationsScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium">Service Stations</Text>
        <Text variant="bodyMedium">Nearby service stations will be displayed here</Text>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  surface: { flex: 1, justifyContent: 'center', alignItems: 'center', margin: 16, padding: 16 },
});

export default ServiceStationsScreen;
