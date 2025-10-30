import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  Surface, 
  Text, 
  Button, 
  useTheme,
  Card
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        {/* Logo and Title Section */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={1000}
          style={styles.headerSection}
        >
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.surface }]}>
            <MaterialCommunityIcons 
              name="car-wrench" 
              size={64} 
              color={theme.colors.primary} 
            />
          </View>
          
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onPrimary }]}>
            Car Workshop
          </Text>
          
          <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
            Your Personal Car Maintenance Assistant
          </Text>
        </Animatable.View>

        {/* Features Section */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          delay={300}
          style={styles.featuresSection}
        >
          <Card style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.featureContent}>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons 
                    name="car-multiple" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodyMedium" style={styles.featureText}>
                    Manage Multiple Cars
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons 
                    name="wrench" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodyMedium" style={styles.featureText}>
                    Track Maintenance
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodyMedium" style={styles.featureText}>
                    Schedule Reminders
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons 
                    name="chart-line" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodyMedium" style={styles.featureText}>
                    View Analytics
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          delay={600}
          style={styles.actionSection}
        >
          <Button
            mode="contained"
            onPress={handleLogin}
            style={[styles.primaryButton, { backgroundColor: theme.colors.surface }]}
            labelStyle={{ color: theme.colors.primary }}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleRegister}
            style={[styles.secondaryButton, { borderColor: theme.colors.onPrimary }]}
            labelStyle={{ color: theme.colors.onPrimary }}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
          
          <Text 
            variant="bodySmall" 
            style={[styles.versionText, { color: theme.colors.onPrimary }]}
          >
            Version 1.0.0
          </Text>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresSection: {
    marginVertical: 32,
  },
  featureCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureContent: {
    padding: 16,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  actionSection: {
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondaryButton: {
    marginBottom: 24,
    borderWidth: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 12,
  },
});

export default WelcomeScreen;
