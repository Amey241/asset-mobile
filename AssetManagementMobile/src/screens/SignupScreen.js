import React, { useState, useContext } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Alert, ScrollView, Dimensions } from 'react-native';
import { TextInput, Button, Text, Surface, IconButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signup } = useContext(AuthContext);

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Incomplete Form', 'Please fill in all security fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match. Please verify.');
            return;
        }
        setLoading(true);
        const result = await signup(name, email, password);
        setLoading(false);
        if (result.success) {
            Alert.alert(
                'Account Created',
                'Your enterprise account is ready. You can now log in.',
                [{ text: 'Great!', onPress: () => navigation.navigate('Login') }]
            );
        } else {
            Alert.alert('Registration Error', result.message);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0d47a1', '#1976d2', '#42a5f5']}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <Surface style={styles.iconCircle} elevation={5}>
                            <IconButton
                                icon="account-plus"
                                size={40}
                                iconColor="#0d47a1"
                            />
                        </Surface>
                        <Text variant="headlineMedium" style={styles.title}>New Account</Text>
                        <Text variant="titleSmall" style={styles.subtitle}>Register for AssetPro access</Text>
                    </View>

                    <Surface style={styles.card} elevation={3}>
                        <TextInput
                            label="Full Identity Name"
                            value={name}
                            onChangeText={setName}
                            mode="flat"
                            style={styles.input}
                            left={<TextInput.Icon icon="account-badge-outline" />}
                        />

                        <TextInput
                            label="Work Email Address"
                            value={email}
                            onChangeText={setEmail}
                            mode="flat"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                            left={<TextInput.Icon icon="email-outline" />}
                        />

                        <TextInput
                            label="Security Password"
                            value={password}
                            onChangeText={setPassword}
                            mode="flat"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            left={<TextInput.Icon icon="shield-lock-outline" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <TextInput
                            label="Confirm Security Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            mode="flat"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            left={<TextInput.Icon icon="lock-check-outline" />}
                        />

                        <Button
                            mode="contained"
                            onPress={handleSignup}
                            loading={loading}
                            style={styles.signupButton}
                            contentStyle={styles.buttonContent}
                            buttonColor="#0d47a1"
                        >
                            Create Identity
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.loginLink}
                            textColor="#0d47a1"
                        >
                            Return to Login
                        </Button>
                    </Surface>

                    <View style={styles.legalContainer}>
                        <Text variant="bodySmall" style={styles.legalText}>
                            By registering, you agree to our Enterprise Security Protocols.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#e3f2fd',
        opacity: 0.9,
    },
    card: {
        padding: 28,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    signupButton: {
        marginTop: 12,
        borderRadius: 12,
    },
    buttonContent: {
        height: 50,
    },
    loginLink: {
        marginTop: 12,
    },
    legalContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    legalText: {
        color: '#fff',
        textAlign: 'center',
        opacity: 0.7,
        fontSize: 10,
    },
});

export default SignupScreen;
