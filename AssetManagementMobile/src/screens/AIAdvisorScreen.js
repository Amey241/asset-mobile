import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Alert, Linking } from 'react-native';
import { Text, Appbar, Surface, Card, Button, Avatar, useTheme, Chip, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

const AIAdvisorScreen = ({ navigation, route }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    const handleInvestNow = async (rec) => {
        try {
            // Simplified "One-click" invest for demo
            await api.post('/finance/invest', {
                type: rec.suggested_investments[0],
                amount: 500, // Fixed amount for trial
                risk_level: 'High',
                date: new Date().toISOString()
            });
            navigation.navigate('Main', { screen: 'Dashboard' });
        } catch (error) {
            console.error('Investment error:', error);
            Alert.alert('Error', 'Failed to process investment');
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
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="AI Investment Advisor" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Surface style={styles.hero} elevation={2}>
                    <Avatar.Icon size={64} icon="brain" style={styles.aiAvatar} color="#fff" />
                    <View style={styles.heroText}>
                        <Text variant="headlineSmall" style={styles.greeting}>Smart Recommendations</Text>
                        <Text variant="bodyMedium" style={styles.subGreeting}>
                            Based on your spending habits and medium risk profile.
                        </Text>
                        <Button
                            mode="contained-tonal"
                            icon="file-download"
                            style={styles.downloadBtn}
                            onPress={downloadReport}
                            compact
                        >
                            Monthly PDF
                        </Button>
                    </View>
                </Surface>

                <View style={styles.insightBox}>
                    <MaterialCommunityIcons name="lightbulb-on" size={24} color="#fbc02d" />
                    <Text variant="bodyMedium" style={styles.insightText}>
                        You saved $450 more than last month. We recommend allocating this to medium-risk assets.
                    </Text>
                </View>

                {recommendations.map((rec, index) => (
                    <Card key={index} style={styles.recCard}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text variant="titleLarge" style={styles.recTitle}>{rec.title}</Text>
                                <Chip icon="star" style={styles.confidenceChip}>
                                    {(rec.confidence_score * 100).toFixed(0)}% Match
                                </Chip>
                            </View>
                            <Text variant="bodyMedium" style={styles.recDesc}>{rec.description}</Text>

                            <View style={styles.assetList}>
                                {rec.suggested_investments.map((asset, i) => (
                                    <Surface key={i} style={styles.assetItem} elevation={0}>
                                        <Text variant="labelLarge" style={styles.assetName}>{asset}</Text>
                                    </Surface>
                                ))}
                            </View>
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <Button
                                mode="contained"
                                onPress={() => handleInvestNow(rec)}
                                style={styles.investBtn}
                            >
                                Invest $500 Now
                            </Button>
                        </Card.Actions>
                    </Card>
                ))}

                <View style={styles.disclaimer}>
                    <Text variant="bodySmall" style={styles.disclaimerText}>
                        AI suggestions are based on historical data and current market trends. Always consult a human financial advisor before major investments.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    hero: {
        flexDirection: 'row',
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#1a237e',
        alignItems: 'center',
        marginBottom: 20,
    },
    aiAvatar: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    heroText: {
        flex: 1,
        marginLeft: 16,
    },
    greeting: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subGreeting: {
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    downloadBtn: {
        marginTop: 8,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    insightBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff9c4',
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    insightText: {
        flex: 1,
        marginLeft: 12,
        color: '#f57f17',
        fontWeight: 'bold',
    },
    recCard: {
        marginBottom: 20,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recTitle: {
        fontWeight: 'bold',
        color: '#1a237e',
        flex: 1,
    },
    confidenceChip: {
        backgroundColor: '#e8f5e9',
    },
    recDesc: {
        color: '#616161',
        lineHeight: 22,
    },
    assetList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    assetItem: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    assetName: {
        color: '#424242',
    },
    cardActions: {
        marginTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    investBtn: {
        flex: 1,
        borderRadius: 12,
    },
    disclaimer: {
        marginTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    disclaimerText: {
        color: '#9e9e9e',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default AIAdvisorScreen;
