# Car Workshop Mobile App

A comprehensive React Native mobile application for managing car maintenance records, built with modern technologies for optimal user experience.

## 🚗 Features

### Core Functionality
- **Multi-car Management**: Add, edit, and track multiple vehicles
- **Maintenance Records**: Detailed maintenance history
- **Oil Change Tracking**: Specialized oil change monitoring with intervals
- **Smart Reminders**: Push notifications for upcoming maintenance
- **Analytics Dashboard**: Visual insights into maintenance costs and patterns

### Advanced Features
- **Firebase Authentication**: Secure user registration and login (Email or Username)
- **Cloud Sync**: Real-time data synchronization across devices
- **Location Services**: Find Hedin Automotive workshops with Google Maps
- **Export Functionality**: PDF and CSV data exports
- **Dark Mode**: System-wide theme switching

### Device APIs Used
- **Location**: GPS for workshop finder
- **File System**: Local storage and exports
- **AsyncStorage**: Persistent data storage

## 🛠 Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Library**: React Native Paper (Material Design 3)
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Navigation**: React Navigation v6
- **State Management**: React Context + Hooks
- **Animations**: React Native Animatable
- **Icons**: Material Community Icons

## 🏗 Project Structure

```
src/
├── config/          # Firebase and app configuration
├── context/         # React Context providers
├── navigation/      # Navigation setup and routing
├── screens/         # All application screens
│   ├── auth/        # Authentication screens
│   ├── main/        # Main app screens (tabs)
│   ├── cars/        # Car management screens
│   ├── maintenance/ # Maintenance tracking screens
│   ├── oilchange/   # Oil change specific screens
│   ├── reminders/   # Reminder management screens
│   └── other/       # Utility screens (settings, export, etc.)
├── services/        # API services and data layer
├── theme/           # Theme configuration and styling
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd CarWorkshopMobile
```

2. Install dependencies
```bash
npm install
```

3. Setup Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

Then edit `.env` and add your actual API keys:
- Google Maps API key (from Google Cloud Console)
- Firebase configuration (from Firebase Console)

4. Run the application
```bash
# For development
npm start

# For specific platform
npm run android
npm run ios
npm run web
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable the following services:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Storage
3. Add your configuration to `src/config/firebase.ts`

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note:** Never commit `.env` to version control. It's already in `.gitignore`.

## 📱 Key Features Implementation

### Authentication System
- Email or Username login
- Email/password registration
- Password reset functionality
- Secure token management
- Profile management with username display

### Car Management
- Add/edit/delete vehicles
- Photo gallery for each car
- Detailed car information tracking
- Search and filter capabilities

### Maintenance Tracking
- Add maintenance records with photos
- Category-based organization
- Cost tracking and analytics
- Scheduling future maintenance

### Smart Notifications
- Automatic maintenance reminders
- Customizable notification preferences
- Calendar integration

## 🎨 Design System

The app follows Material Design 3 principles with:
- Consistent color palette
- Typography hierarchy
- Proper spacing and layout
- Accessibility considerations
- Animation guidelines

## 📦 Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS  
expo build:ios

# Or use EAS Build
eas build --platform android
eas build --platform ios
```

## 👨‍💻 Developer

Created as a final project for Mobile Programming Course to demonstrate:
- Advanced React Native development skills
- Firebase integration expertise
- Modern UI/UX design principles
- Professional code organization
- Complex application architecture
