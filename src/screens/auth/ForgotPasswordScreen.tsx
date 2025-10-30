import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Snackbar,
  Card,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import * as Animatable from 'react-native-animatable';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('error');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setEmailSent(true);
      setSnackbarType('success');
      setSnackbarMessage('Password reset email sent! Check your inbox.');
      setSnackbarVisible(true);
    } catch (error: any) {
      setSnackbarType('error');
      setSnackbarMessage(error.message || 'Failed to send reset email');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
              onPress={handleBackToLogin}
              style={styles.backButton}
            />
            
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="lock-reset" 
                size={64} 
                color={theme.colors.primary} 
              />
            </View>
            
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Reset Password
            </Text>
            
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {emailSent 
                ? 'We\'ve sent a password reset link to your email'
                : 'Enter your email address and we\'ll send you a link to reset your password'
              }
            </Text>
          </Animatable.View>

          {/* Reset Form */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.formContent}>
                {!emailSent ? (
                  <>
                    <TextInput
                      label="Email Address"
                      value={email}
                      onChangeText={setEmail}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      left={<TextInput.Icon icon="email" />}
                      error={!!emailError}
                      style={styles.input}
                    />
                    {emailError ? (
                      <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                        {emailError}
                      </Text>
                    ) : null}

                    <Button
                      mode="contained"
                      onPress={handleResetPassword}
                      loading={loading}
                      disabled={loading}
                      style={styles.resetButton}
                      contentStyle={styles.buttonContent}
                    >
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                  </>
                ) : (
                  <View style={styles.successContainer}>
                    <MaterialCommunityIcons 
                      name="email-check" 
                      size={48} 
                      color={theme.colors.primary} 
                      style={styles.successIcon}
                    />
                    
                    <Text variant="bodyLarge" style={[styles.successText, { color: theme.colors.onSurface }]}>
                      Check your email inbox and follow the instructions to reset your password.
                    </Text>
                    
                    <Button
                      mode="outlined"
                      onPress={() => setEmailSent(false)}
                      style={styles.resendButton}
                      contentStyle={styles.buttonContent}
                    >
                      Send Another Email
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Additional Information */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400} style={styles.infoSection}>
            <Card style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons 
                    name="information" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                    The password reset link will expire in 1 hour
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons 
                    name="email-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                    Check your spam folder if you don't see the email
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Back to Login */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600} style={styles.loginSection}>
            <Text variant="bodyMedium" style={[styles.loginText, { color: theme.colors.onSurfaceVariant }]}>
              Remember your password?
            </Text>
            
            <Button
              mode="text"
              onPress={handleBackToLogin}
              style={styles.loginButton}
              labelStyle={{ color: theme.colors.primary }}
            >
              Back to Sign In
            </Button>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ 
          backgroundColor: snackbarType === 'success' ? theme.colors.tertiary : theme.colors.error 
        }}
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
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
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
  resetButton: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  resendButton: {
    marginTop: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    elevation: 2,
  },
  infoContent: {
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  loginSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
