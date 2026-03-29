import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, Alert, Modal, Animated, Easing } from 'react-native';
import { TextInput, Button, Appbar, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const WalletScreen = ({ navigation }) => {
    const { user, updateUser } = useContext(AuthContext);

    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Mock Payment Gateway State
    const [showGateway, setShowGateway] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('initiating'); // initiating, processing, success, failed
    const [spinAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            setBalance(user?.wallet_balance || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const runSpinner = () => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();
    };

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const handleAddMoney = () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum < 1) {
            Alert.alert('Invalid Amount', 'Please enter an amount of at least ₹1');
            return;
        }

        // Start Simulated Payment Flow
        setShowGateway(true);
        setPaymentStatus('initiating');
        runSpinner();

        setTimeout(() => {
            setPaymentStatus('processing');
            processMockPayment(amountNum);
        }, 1500);
    };

    const processMockPayment = async (amountNum) => {
        try {
            // Hit our simulated backend endpoint
            const response = await api.post('/payment/simulate', { amount: amountNum });
            
            if (response.data.success) {
                setTimeout(() => {
                    setPaymentStatus('success');
                    spinAnim.stopAnimation();
                    setBalance(response.data.wallet_balance);
                    
                    // Globally update the app's User context so Dashboard sees the change!
                    if (updateUser) {
                        updateUser({ wallet_balance: response.data.wallet_balance });
                    }
                    
                    // Close gateway after viewing success
                    setTimeout(() => {
                        setShowGateway(false);
                        setAmount('');
                        Alert.alert("Success", "Funds added securely to your wallet!");
                    }, 2000);
                }, 1500);
            } else {
                setPaymentStatus('failed');
                spinAnim.stopAnimation();
                setTimeout(() => setShowGateway(false), 2000);
            }
        } catch (error) {
            console.error('Simulated payment error:', error);
            setPaymentStatus('failed');
            spinAnim.stopAnimation();
            setTimeout(() => setShowGateway(false), 2000);
            Alert.alert('Error', 'Server unreachable. Ensure the backend is running.');
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color="#0F172A" />
                <Appbar.Content title="Wallet" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <View style={styles.content}>
                <Surface style={styles.balanceCard} elevation={2}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
                    <Icon name="wallet" size={48} color="rgba(255,255,255,0.2)" style={styles.walletIcon} />
                </Surface>

                <Surface style={styles.addMoneyCard} elevation={1}>
                    <Text style={styles.cardTitle}>Add Money to Wallet</Text>
                    
                    <TextInput
                        label="Amount (₹)"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        mode="outlined"
                        outlineColor="#E2E8F0"
                        activeOutlineColor="#3B82F6"
                        left={<TextInput.Icon icon="currency-inr" color="#64748B" />}
                        style={styles.input}
                    />

                    <View style={styles.quickAmounts}>
                        {[100, 500, 1000, 5000].map((amt) => (
                            <Button
                                key={amt}
                                mode="outlined"
                                onPress={() => setAmount(amt.toString())}
                                style={styles.quickBtn}
                                labelStyle={{ color: '#3B82F6', fontSize: 12 }}
                                textColor="#3B82F6"
                            >
                                +₹{amt}
                            </Button>
                        ))}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleAddMoney}
                        loading={loading}
                        disabled={loading}
                        buttonColor="#10B981"
                        textColor="#fff"
                        style={styles.submitBtn}
                        contentStyle={{ paddingVertical: 8 }}
                        icon="shield-check"
                    >
                        Secure Sandbox Pay
                    </Button>
                </Surface>

                <View style={styles.infoBox}>
                    <Icon name="information" size={20} color="#3B82F6" />
                    <Text style={styles.infoText}>
                        This is a simulated testing environment. No real money or payment accounts are required. 
                    </Text>
                </View>
            </View>

            {/* Simulated Payment Gateway Modal */}
            <Modal visible={showGateway} transparent animationType="fade">
                <View style={styles.gatewayOverlay}>
                    <Surface style={styles.gatewayBox} elevation={5}>
                        {paymentStatus === 'initiating' && (
                            <>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <Icon name="sync" size={48} color="#3B82F6" />
                                </Animated.View>
                                <Text style={styles.gatewayTitle}>Connecting to Bank...</Text>
                                <Text style={styles.gatewaySub}>Securing connection via Sandbox API</Text>
                            </>
                        )}
                        {paymentStatus === 'processing' && (
                            <>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <Icon name="loading" size={48} color="#F59E0B" />
                                </Animated.View>
                                <Text style={styles.gatewayTitle}>Processing Transaction</Text>
                                <Text style={styles.gatewaySub}>Authorizing payment of ₹{amount}...</Text>
                            </>
                        )}
                        {paymentStatus === 'success' && (
                            <>
                                <Icon name="check-circle" size={56} color="#10B981" />
                                <Text style={[styles.gatewayTitle, { color: '#10B981' }]}>Payment Successful</Text>
                                <Text style={styles.gatewaySub}>₹{amount} has been added to wallet.</Text>
                            </>
                        )}
                        {paymentStatus === 'failed' && (
                            <>
                                <Icon name="close-circle" size={56} color="#EF4444" />
                                <Text style={[styles.gatewayTitle, { color: '#EF4444' }]}>Transaction Failed</Text>
                                <Text style={styles.gatewaySub}>There was an error processing test payment.</Text>
                            </>
                        )}
                    </Surface>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#F8FAFC',
        elevation: 0,
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#0F172A',
        fontSize: 22,
    },
    content: {
        padding: 16,
    },
    balanceCard: {
        backgroundColor: '#0F172A',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        overflow: 'hidden',
    },
    balanceLabel: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
    },
    walletIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    addMoneyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    quickAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickBtn: {
        borderColor: '#E2E8F0',
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 4,
    },
    submitBtn: {
        borderRadius: 12,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoText: {
        color: '#1D4ED8',
        fontSize: 12,
        flex: 1,
        marginLeft: 12,
        lineHeight: 18,
    },
    gatewayOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gatewayBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '80%',
    },
    gatewayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginTop: 16,
        marginBottom: 8,
    },
    gatewaySub: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    }
});

export default WalletScreen;
