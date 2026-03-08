import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Alert, Linking } from 'react-native';
import { Text, Appbar, Surface, Card, Button, Avatar, useTheme, Chip, List, Portal, Dialog, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

const AIAdvisorScreen = ({ navigation, route }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [investDialogVisible, setInvestDialogVisible] = useState(false);
    const [investAmount, setInvestAmount] = useState('500');
    const [selectedRec, setSelectedRec] = useState(null);
    const theme = useTheme();

    const fetchRecommendations = async () => {
        try {
            const response = await api.get('/finance/recommendations');
            setRecommendations(response.data);
        } catch (error) {
            console.error('AI Advisor error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecommendations();
    };

    const handleInvestNow = (rec) => {
        setSelectedRec(rec);
        setInvestAmount('500'); // Default suggestion
        setInvestDialogVisible(true);
    };

    const confirmInvest = async () => {
        const amount = parseFloat(investAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }

        try {
            setInvestDialogVisible(false);
            await api.post('/finance/invest', {
                type: selectedRec.suggested_investments[0],
                amount: amount,
                risk_level: 'High',
                date: new Date().toISOString()
            });
            Alert.alert('Success', `Successfully invested ₹${amount} based on AI strategy!`);
            navigation.navigate('Main', { screen: 'Dashboard' });
        } catch (error) {
            console.error('Investment error:', error);
            Alert.alert('Investment Failed', error.response?.data?.message || 'Failed to process investment');
        }
    };

    const downloadReport = async () => {
        try {
            const url = `${api.defaults.baseURL}/finance/report`;
            Alert.alert('Report Ready', 'You can download your monthly financial summary now.', [
                { text: 'Open in Browser', onPress: () => Linking.openURL(url) },
                { text: 'Cancel', style: 'cancel' }
            ]);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="AI Insights" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#10B981"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Dashboard */}
                <Surface style={styles.hero} elevation={5}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.avatarGlow}>
                            <Avatar.Icon size={56} icon="brain" style={styles.aiAvatar} color="#10B981" />
                        </View>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>AI Active</Text>
                        </View>
                    </View>

                    <Text variant="headlineMedium" style={styles.greeting}>Portfolio Analysis</Text>
                    <Text variant="bodyMedium" style={styles.subGreeting}>
                        Your assets are performing well. We found 3 new optimization strategies based on market trends.
                    </Text>

                    <View style={styles.heroActions}>
                        <Button
                            mode="contained"
                            icon="download"
                            style={styles.downloadBtn}
                            labelStyle={styles.downloadBtnText}
                            buttonColor="rgba(16, 185, 129, 0.15)"
                            onPress={downloadReport}
                        >
                            Monthly Report
                        </Button>
                    </View>
                </Surface>

                <View style={styles.insightBox}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F59E0B" style={styles.insightIcon} />
                    <Text variant="bodyMedium" style={styles.insightText}>
                        You saved ₹450 more than last month. Consider allocating this to medium-risk tech assets.
                    </Text>
                </View>

                {recommendations.map((rec, index) => (
                    <Surface key={index} style={styles.recCard} elevation={2}>
                        <View style={styles.cardHeader}>
                            <Text variant="titleMedium" style={styles.recTitle}>{rec.title}</Text>
                            <View style={styles.confidenceChip}>
                                <MaterialCommunityIcons name="star-four-points" size={14} color="#10B981" />
                                <Text style={styles.confidenceText}>{(rec.confidence_score * 100).toFixed(0)}% Match</Text>
                            </View>
                        </View>

                        <Text variant="bodyMedium" style={styles.recDesc}>{rec.description}</Text>

                        <View style={styles.assetList}>
                            {rec.suggested_investments.map((asset, i) => (
                                <View key={i} style={styles.assetItem}>
                                    <Text variant="labelMedium" style={styles.assetName}>{asset}</Text>
                                </View>
                            ))}
                        </View>

                        <Button
                            mode="contained"
                            onPress={() => handleInvestNow(rec)}
                            style={styles.investBtn}
                            buttonColor="#3B82F6"
                        >
                            Execute Strategy
                        </Button>
                    </Surface>
                ))}

                <View style={styles.disclaimer}>
                    <MaterialCommunityIcons name="shield-alert-outline" size={20} color="#64748B" />
                    <Text variant="bodySmall" style={styles.disclaimerText}>
                        AI suggestions are based on historical data. Always consult a human financial advisor before major investments.
                    </Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Portal>
                <Dialog visible={investDialogVisible} onDismiss={() => setInvestDialogVisible(false)} style={{ backgroundColor: '#1E293B' }}>
                    <Dialog.Title style={{ color: '#FFFFFF' }}>Execute Strategy</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: '#94A3B8', marginBottom: 16 }}>
                            Enter the amount you would like to allocate to {selectedRec?.suggested_investments?.[0]}.
                        </Text>
                        <TextInput
                            label="Investment Amount (₹)"
                            value={investAmount}
                            onChangeText={setInvestAmount}
                            keyboardType="numeric"
                            mode="outlined"
                            textColor="#FFFFFF"
                            theme={{ colors: { background: '#0F172A', primary: '#10B981', onSurfaceVariant: '#94A3B8' } }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setInvestDialogVisible(false)} textColor="#FF4D4D">Cancel</Button>
                        <Button onPress={confirmInvest} textColor="#10B981">Confirm Investment</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Slate 900
    },
    header: {
        backgroundColor: '#0F172A',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerTitle: {
        fontWeight: '900',
        color: '#FFFFFF',
        fontSize: 22,
    },
    content: {
        padding: 16,
    },
    hero: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#1E293B', // Slate 800
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarGlow: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 32,
        padding: 4,
    },
    aiAvatar: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    greeting: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 24,
    },
    subGreeting: {
        color: '#94A3B8',
        marginTop: 8,
        lineHeight: 22,
    },
    heroActions: {
        marginTop: 20,
        flexDirection: 'row',
    },
    downloadBtn: {
        borderRadius: 12,
    },
    downloadBtnText: {
        color: '#10B981',
        fontWeight: 'bold',
    },
    insightBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    insightIcon: {
        marginRight: 12,
    },
    insightText: {
        flex: 1,
        color: '#FDE68A',
        lineHeight: 20,
    },
    recCard: {
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    recTitle: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        fontSize: 18,
    },
    confidenceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    confidenceText: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 12,
    },
    recDesc: {
        color: '#94A3B8',
        lineHeight: 22,
        marginBottom: 16,
    },
    assetList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    assetItem: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    assetName: {
        color: '#CBD5E1',
        fontWeight: '600',
    },
    investBtn: {
        borderRadius: 12,
        paddingVertical: 4,
    },
    disclaimer: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    disclaimerText: {
        flex: 1,
        color: '#64748B',
        lineHeight: 18,
    },
});

export default AIAdvisorScreen;
