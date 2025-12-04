/**
 * Login Screen
 * 
 * Provides user authentication interface for existing users.
 * Handles email/password sign-in with validation and error feedback.
 * 
 * @module screens/LoginScreen
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { loginUser } from '../services/authService';

/**
 * LoginScreen component for user sign-in.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object
 * @returns {React.Component} Login form interface
 */
export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secureEntry, setSecureEntry] = useState(true);

    /**
     * Handles the login form submission.
     * Validates inputs and attempts Firebase authentication.
     */
    const handleLogin = async () => {
        // Clear previous errors
        setError('');

        // Basic validation
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        const result = await loginUser(email.trim(), password);
        setLoading(false);

        if (!result.success) {
            setError(result.error);
        }
        // If successful, AuthContext will detect the change automatically
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Welcome Back
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Sign in to sync your vocabulary
                </Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                />

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={secureEntry}
                    autoCapitalize="none"
                    right={
                        <TextInput.Icon
                            icon={secureEntry ? 'eye' : 'eye-off'}
                            onPress={() => setSecureEntry(!secureEntry)}
                        />
                    }
                    style={styles.input}
                />

                {error ? (
                    <HelperText type="error" visible={true}>
                        {error}
                    </HelperText>
                ) : null}

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Sign In
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('SignUp')}
                    style={styles.linkButton}
                >
                    Don't have an account? Sign Up
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 32,
        color: '#666',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 4,
    },
    linkButton: {
        marginTop: 16,
    },
});