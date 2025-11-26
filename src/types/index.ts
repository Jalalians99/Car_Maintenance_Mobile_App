// User Interface
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: 'USER' | 'ADMIN';
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Car Interface
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  subType: CarSubType;
  mileage: number;
  color?: string;
  vin?: string;
  firstMaintenance?: string;
  firstOilChangeDate?: string;
  mileageAtFirstOilChange?: number;
  oilChangeInterval?: number;
  imageUrls: string[];
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

// Car Sub Types
export type CarSubType = 
  | 'Sedan'
  | 'SUV'
  | 'Hatchback'
  | 'Crossover'
  | 'Truck'
  | 'Van'
  | 'Coupe'
  | 'Convertible'
  | 'Wagon'
  | 'MPV'
  | 'Pickup'
  | 'Minivan'
  | 'Sports Car'
  | 'Electric'
  | 'Hybrid'
  | 'Other';

// Maintenance Record Interface
export interface MaintenanceRecord {
  id: string;
  carId: string;
  car?: Car;
  maintenanceDate: string;
  mileage?: number;
  description: string;
  performedBy?: string;
  cost?: number;
  category?: MaintenanceCategory;
  imageUrls: string[];
  location?: Location;
  nextDueDate?: string;
  nextDueMileage?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance Categories
export type MaintenanceCategory = 
  | 'Oil Change'
  | 'Brake Service'
  | 'Tire Rotation'
  | 'Engine Repair'
  | 'Transmission'
  | 'Battery'
  | 'Inspection'
  | 'Other';

// Reminder Interface
export interface Reminder {
  id: string;
  userId: string;
  carId?: string;
  car?: Car;
  title: string;
  description?: string;
  reminderDate: string; // YYYY-MM-DD
  reminderTime?: string; // HH:MM (24-hour format)
  type: ReminderType;
  status: 'pending' | 'completed' | 'dismissed';
  notifyBefore?: number; // Days before to send notification
  createdAt: string;
  updatedAt: string;
}

// Reminder Types
export type ReminderType = 
  | 'Oil Change'
  | 'Tire Rotation'
  | 'Inspection'
  | 'Registration Renewal'
  | 'Insurance Renewal'
  | 'Service Appointment'
  | 'Car Wash'
  | 'Custom';


// Location Interface
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

// Service Station Interface
export interface ServiceStation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  services: string[];
  location: Location;
  distance?: number;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'MAINTENANCE_DUE'
  | 'OIL_CHANGE_DUE'
  | 'INSPECTION_DUE'
  | 'GENERAL'
  | 'REMINDER';

// Navigation Types
export type RootStackParamList = {
  // Auth Stack
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Car Stack
  CarDetails: { carId: string };
  AddCar: undefined;
  EditCar: { carId: string };
  
  // Maintenance Stack
  MaintenanceList: { carId: string };
  AddMaintenance: { carId: string };
  EditMaintenance: { maintenanceId: string };
  MaintenanceDetails: { maintenanceId: string };
  
  // Reminder Stack
  ManageReminders: undefined;
  AddReminder: { carId?: string };
  EditReminder: { reminderId: string };
  
  // Other
  Profile: undefined;
  Settings: undefined;
  WorkshopFinder: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Cars: undefined;
  Calendar: undefined;
  Profile: undefined;
};

// Form Data Types
export interface CarFormData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  subType: CarSubType;
  mileage: number;
  color?: string;
  vin?: string;
  firstMaintenance?: string;
  firstOilChangeDate?: string;
  mileageAtFirstOilChange?: number;
  oilChangeInterval?: number;
}

export interface MaintenanceFormData {
  maintenanceDate: string;
  mileage?: number;
  description: string;
  performedBy?: string;
  cost?: number;
  category: MaintenanceCategory;
  notes?: string;
  nextDueDate?: string;
  nextDueMileage?: number;
}


// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search and Filter Types
export interface SearchFilters {
  make?: string;
  model?: string;
  year?: number;
  subType?: CarSubType;
  minYear?: number;
  maxYear?: number;
}

export interface MaintenanceFilters {
  category?: MaintenanceCategory;
  startDate?: string;
  endDate?: string;
  minCost?: number;
  maxCost?: number;
}

// Statistics Types
export interface CarStatistics {
  totalMileage: number;
  totalMaintenanceCost: number;
  maintenanceCount: number;
  oilChangeCount: number;
  averageMileageBetweenServices: number;
  lastServiceDate?: string;
  nextServiceDue?: string;
  fuelEfficiency?: number;
}

// Export Types
export interface ExportData {
  user: User;
  cars: Car[];
  maintenanceRecords: MaintenanceRecord[];
  exportDate: string;
  format: 'JSON' | 'PDF' | 'CSV';
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  text: string;
  onSurface: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
}

export interface AppTheme {
  colors: ThemeColors;
  dark: boolean;
}
