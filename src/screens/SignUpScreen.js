/**
 * Sign Up Screen
 * 
 * Provides user registration interface for new users.
 * Handles email/password account creation with validation and error feedback.
 * 
 * @module screens/SignUpScreen
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { registerUser } from '../services/authService';

/**
 * SignUpScreen component for new user registration.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object
 * @returns {React.Component} Registration form interface
 */
export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secureEntry, setSecureEntry] = useState(true);

    /**
     * Handles the registration form submission.
     * Validates inputs and attempts Firebase account creation.
     */
    const handleSignUp = async () => {
        // Clear previous errors
        setError('');

        // Basic validation
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Please fill in all fields');
            return;
        }

        // Password match validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Password length validation (Firebase requires min 6 characters)
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await registerUser(email.trim(), password);
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
                    Create Account
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Start syncing your vocabulary across devices
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

                <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={secureEntry}
                    autoCapitalize="none"
                    style={styles.input}
                />

                {error ? (
                    <HelperText type="error" visible={true}>
                        {error}
                    </HelperText>
                ) : null}

                <Button
                    mode="contained"
                    onPress={handleSignUp}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Create Account
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.linkButton}
                >
                    Already have an account? Sign In
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