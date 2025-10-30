import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, TabParamList } from '../types';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import CarsScreen from '../screens/main/CarsScreen';
import { MaintenanceListScreen as MaintenanceTabScreen } from '../screens/main/MaintenanceListScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Car Screens
import CarDetailsScreen from '../screens/cars/CarDetailsScreen';
import AddCarScreen from '../screens/cars/AddCarScreen';
import EditCarScreen from '../screens/cars/EditCarScreen';
import CarPhotosScreen from '../screens/cars/CarPhotosScreen';

// Maintenance Screens
import { AddMaintenanceScreen } from '../screens/maintenance/AddMaintenanceScreen';
import { EditMaintenanceScreen } from '../screens/maintenance/EditMaintenanceScreen';
import { CarMaintenanceRecordsScreen } from '../screens/maintenance/CarMaintenanceRecordsScreen';
import { MaintenanceDetailsScreen } from '../screens/maintenance/MaintenanceDetailsScreen';

// Oil Change Screens
import OilChangeListScreen from '../screens/oilchange/OilChangeListScreen';
import AddOilChangeScreen from '../screens/oilchange/AddOilChangeScreen';
import EditOilChangeScreen from '../screens/oilchange/EditOilChangeScreen';
import OilChangeDetailsScreen from '../screens/oilchange/OilChangeDetailsScreen';

// Reminder Screens
import { ManageRemindersScreen } from '../screens/reminders/ManageRemindersScreen';
import { AddReminderScreen } from '../screens/reminders/AddReminderScreen';
import { EditReminderScreen } from '../screens/reminders/EditReminderScreen';

// Other Screens
import SettingsScreen from '../screens/other/SettingsScreen';
import QRCodeScannerScreen from '../screens/other/QRCodeScannerScreen';
import ServiceStationsScreen from '../screens/other/ServiceStationsScreen';
import NotificationsScreen from '../screens/other/NotificationsScreen';
import ExportScreen from '../screens/other/ExportScreen';
import CameraScreen from '../screens/other/CameraScreen';

// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Loading Screen Component
const LoadingScreen = () => {
  const theme = useTheme();
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    }}>
      <Text>Loading...</Text>
    </View>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Cars':
              iconName = focused ? 'car' : 'car-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'wrench' : 'wrench-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Cars" 
        component={CarsScreen} 
        options={{ title: 'My Cars' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={MaintenanceTabScreen} 
        options={{ title: 'Maintenance' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      
      {/* Car Screens */}
      <Stack.Screen 
        name="CarDetails" 
        component={CarDetailsScreen} 
        options={{ title: 'Car Details' }}
      />
      <Stack.Screen 
        name="AddCar" 
        component={AddCarScreen} 
        options={{ title: 'Add New Car' }}
      />
      <Stack.Screen 
        name="EditCar" 
        component={EditCarScreen} 
        options={{ title: 'Edit Car' }}
      />
      <Stack.Screen 
        name="CarPhotos" 
        component={CarPhotosScreen} 
        options={{ title: 'Car Photos' }}
      />
      
      {/* Maintenance Screens */}
      <Stack.Screen 
        name="MaintenanceList" 
        component={CarMaintenanceRecordsScreen} 
        options={{ title: 'Maintenance Records' }}
      />
      <Stack.Screen 
        name="AddMaintenance" 
        component={AddMaintenanceScreen} 
        options={{ title: 'Add Maintenance' }}
      />
      <Stack.Screen 
        name="EditMaintenance" 
        component={EditMaintenanceScreen} 
        options={{ title: 'Edit Maintenance' }}
      />
      <Stack.Screen 
        name="MaintenanceDetails" 
        component={MaintenanceDetailsScreen} 
        options={{ title: 'Maintenance Details' }}
      />
      
      {/* Oil Change Screens */}
      <Stack.Screen 
        name="OilChangeList" 
        component={OilChangeListScreen} 
        options={{ title: 'Oil Change Records' }}
      />
      <Stack.Screen 
        name="AddOilChange" 
        component={AddOilChangeScreen} 
        options={{ title: 'Add Oil Change' }}
      />
      <Stack.Screen 
        name="EditOilChange" 
        component={EditOilChangeScreen} 
        options={{ title: 'Edit Oil Change' }}
      />
      <Stack.Screen 
        name="OilChangeDetails" 
        component={OilChangeDetailsScreen} 
        options={{ title: 'Oil Change Details' }}
      />
      
      {/* Reminder Screens */}
      <Stack.Screen 
        name="ManageReminders" 
        component={ManageRemindersScreen} 
        options={{ title: 'Manage Reminders' }}
      />
      <Stack.Screen 
        name="AddReminder" 
        component={AddReminderScreen} 
        options={{ title: 'Add Reminder' }}
      />
      <Stack.Screen 
        name="EditReminder" 
        component={EditReminderScreen} 
        options={{ title: 'Edit Reminder' }}
      />
      
      {/* Other Screens */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="QRCodeScanner" 
        component={QRCodeScannerScreen} 
        options={{ title: 'Scan QR Code' }}
      />
      <Stack.Screen 
        name="ServiceStations" 
        component={ServiceStationsScreen} 
        options={{ title: 'Service Stations' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="Export" 
        component={ExportScreen} 
        options={{ title: 'Export Data' }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ 
          title: 'Camera',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
