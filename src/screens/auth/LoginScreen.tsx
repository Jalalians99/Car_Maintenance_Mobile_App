import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  useTheme,
  Snackbar,
  ActivityIndicator,
  Card,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import * as Animatable from 'react-native-animatable';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { signIn } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [emailOrUsernameError, setEmailOrUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmailOrUsername = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    return emailRegex.test(input) || usernameRegex.test(input);
  };

  const validateForm = () => {
    let isValid = true;

    if (!emailOrUsername.trim()) {
      setEmailOrUsernameError('Email or username is required');
      isValid = false;
    } else if (!validateEmailOrUsername(emailOrUsername.trim())) {
      setEmailOrUsernameError('Please enter a valid email or username');
      isValid = false;
    } else {
      setEmailOrUsernameError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(emailOrUsername.trim(), password);
      // Navigation handled by AuthContext
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to sign in');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleBackToWelcome = () => {
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              size={24}
              onPress={handleBackToWelcome}
              style={styles.backButton}
            />
            
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="car-wrench" 
                size={48} 
                color={theme.colors.primary} 
              />
            </View>
            
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Welcome Back
            </Text>
            
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to manage your cars
            </Text>
          </Animatable.View>

          {/* Login Form */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.formContent}>
                <TextInput
                  label="Email or Username"
                  value={emailOrUsername}
                  onChangeText={setEmailOrUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholder="Enter your email or username"
                  left={<TextInput.Icon icon="account" />}
                  error={!!emailOrUsernameError}
                  style={styles.input}
                />
                {emailOrUsernameError ? (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {emailOrUsernameError}
                  </Text>
                ) : null}

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  error={!!passwordError}
                  style={styles.input}
                />
                {passwordError ? (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {passwordError}
                  </Text>
                ) : null}

                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordButton}
                  labelStyle={{ color: theme.colors.primary }}
                >
                  Forgot Password?
                </Button>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Register Section */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400} style={styles.registerSection}>
            <Text variant="bodyMedium" style={[styles.registerText, { color: theme.colors.onSurfaceVariant }]}>
              Don't have an account?
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleRegister}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  formCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 24,
  },
  formContent: {
    padding: 24,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 16,
    marginLeft: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    marginBottom: 16,
  },
  registerButton: {
    minWidth: 200,
  },
});

export default LoginScreen;
