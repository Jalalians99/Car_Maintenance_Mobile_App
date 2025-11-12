# Car Workshop Mobile App

A comprehensive React Native mobile application for managing car maintenance records, built with modern technologies for optimal user experience.

## 🚗 Features

### Core Functionality
- **Multi-car Management**: Add, edit, and track multiple vehicles
- **Maintenance Records**: Detailed maintenance history with photos and receipts
- **Oil Change Tracking**: Specialized oil change monitoring with intervals
- **Smart Reminders**: Push notifications for upcoming maintenance
- **Analytics Dashboard**: Visual insights into maintenance costs and patterns

### Advanced Features (Grade 5 Requirements)
- **Firebase Authentication**: Secure user registration and login
- **Cloud Sync**: Real-time data synchronization across devices
- **Camera Integration**: Photo capture for maintenance records
- **Location Services**: Find nearby service stations
- **QR Code Scanner**: Quick parts and service lookup
- **Export Functionality**: PDF and CSV data exports
- **Offline Support**: Work without internet connection
- **Biometric Auth**: Fingerprint/Face ID security

### Device APIs Used
- **Camera**: Photo capture for cars and maintenance records
- **Location**: GPS for service station finder
- **Push Notifications**: Maintenance reminders
- **Calendar**: Schedule integration
- **File System**: Local storage and exports
- **Secure Store**: Sensitive data protection

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
│   └── other/       # Utility screens (camera, scanner, etc.)
├── services/        # API services and data layer
├── theme/           # Theme configuration and styling
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

<<<<<<< HEAD

=======
>>>>>>> c38733e468c812127a7f6582e94fb4ab883c1c08
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

3. Configure Firebase
- Create a Firebase project
- Enable Authentication, Firestore, and Storage
- Download configuration file
- Update `src/config/firebase.ts` with your credentials

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
Create a `.env` file in the root directory:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 📱 Key Features Implementation

### Authentication System
- Email/password registration and login
- Password reset functionality
- Secure token management
- Profile management

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

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📦 Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Create universal build
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

Created as a final project for Mobile Programming Course to demonstrate:
- Advanced React Native development skills
- Firebase integration expertise
- Modern UI/UX design principles
- Professional code organization
<<<<<<< HEAD
- Complex application architecture
=======
- Complex application architecture

# Car_Maintenance_Mobile_App
>>>>>>> c38733e468c812127a7f6582e94fb4ab883c1c08
