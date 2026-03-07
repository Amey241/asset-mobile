import React, { useState, useContext } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { TextInput, Button, Text, Surface, IconButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Please enter your credentials to continue.');
            return;
        }
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (!result.success) {
            Alert.alert('Access Denied', result.message);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a237e', '#3949ab', '#5c6bc0']}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.headerContainer}>
                    <Surface style={styles.logoCircle} elevation={5}>
                        <IconButton
                            icon="shield-key"
                            size={40}
                            iconColor="#1a237e"
                        />
                    </Surface>
                    <Text variant="displaySmall" style={styles.title}>AssetPro</Text>
                    <Text variant="titleMedium" style={styles.subtitle}>Intelligent Inventory Management</Text>
                </View>

                <Surface style={styles.loginCard} elevation={3}>
                    <Text variant="headlineSmall" style={styles.cardTitle}>Welcome Back</Text>

                    <TextInput
                        label="Corporate Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="flat"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        left={<TextInput.Icon icon="email-outline" />}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="flat"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock-outline" />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                        contentStyle={styles.buttonContent}
                        buttonColor="#1a237e"
                    >
                        Sign In
                    </Button>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('Signup')}
                        style={styles.signupButton}
                        textColor="#1a237e"
                    >
                        Create Account
                    </Button>
                </Surface>

                <View style={styles.footer}>
                    <Text variant="bodySmall" style={styles.footerText}>
                        © 2026 AssetPro Enterprise v2.0
                    </Text>
                </View>
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
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
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
        fontWeight: '900',
        letterSpacing: 1,
    },
    subtitle: {
        color: '#e0e0e0',
        opacity: 0.9,
    },
    loginCard: {
        padding: 32,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
    },
    cardTitle: {
        color: '#1a237e',
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    loginButton: {
        marginTop: 12,
        borderRadius: 12,
        paddingVertical: 4,
    },
    buttonContent: {
        height: 48,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9e9e9e',
        fontSize: 12,
        fontWeight: 'bold',
    },
    signupButton: {
        borderRadius: 12,
        borderColor: '#1a237e',
        borderWidth: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    footerText: {
        color: '#fff',
        opacity: 0.7,
    },
});

export default LoginScreen;
