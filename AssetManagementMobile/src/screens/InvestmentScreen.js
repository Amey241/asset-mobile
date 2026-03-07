import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions, Alert } from 'react-native';
import { Text, Appbar, Surface, Button, useTheme, Card, List, IconButton, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

const InvestmentScreen = ({ navigation }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const fetchPortfolio = useCallback(async () => {
        try {
            const response = await api.get('/finance/portfolio');
            setPortfolio(response.data);
        } catch (error) {
            console.error('Failed to fetch portfolio', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const handleInvest = (type) => {
        navigation.navigate('AIAdvisor', { investmentType: type });
    };

    if (!portfolio && loading) return <View style={styles.center}><Text>Calculating Portfolio...</Text></View>;

    const savingsRate = portfolio ? (portfolio.remaining_money / portfolio.total_income) : 0;
    const progressColor = savingsRate > 0.3 ? '#4caf50' : savingsRate > 0.1 ? '#ff9800' : '#f44336';

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="My Portfolio" titleStyle={styles.headerTitle} />
                <Appbar.Action icon="brain" onPress={() => navigation.navigate('AIAdvisor')} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPortfolio(); }} />}
            >
                <Surface style={styles.mainSummary} elevation={4}>
                    <Text variant="labelLarge" style={styles.summaryLabel}>Remaining This Month</Text>
                    <Text variant="displayMedium" style={styles.remainingAmount}>
                        ${portfolio?.remaining_money?.toFixed(2) || '0.00'}
                    </Text>

                    <View style={styles.incomeExpenseRow}>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="arrow-up-circle" size={20} color="#4caf50" />
                            <Text variant="bodyMedium" style={styles.incomeText}>${portfolio?.total_income?.toFixed(0)}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="arrow-down-circle" size={20} color="#f44336" />
                            <Text variant="bodyMedium" style={styles.expenseText}>${portfolio?.total_expenses?.toFixed(0)}</Text>
                        </View>
                    </View>

                    <Text variant="bodySmall" style={styles.progressLabel}>
                        Savings Rate: {(savingsRate * 100).toFixed(0)}%
                    </Text>
                    <ProgressBar progress={savingsRate} color={progressColor} style={styles.progressBar} />
                </Surface>

                <View style={styles.sectionHeader}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Grow Your Wealth</Text>
                    <Text variant="bodySmall" style={styles.sectionSubtitle}>Choose based on your risk profile</Text>
                </View>

                <View style={styles.investmentGrid}>
                    <Card style={styles.investCard} onPress={() => handleInvest('Gold')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#fff9c4' }]}>
                                <MaterialCommunityIcons name="gold" size={32} color="#fbc02d" />
                            </Surface>
                            <Text variant="titleMedium">Gold</Text>
                            <Text variant="bodySmall" style={styles.riskLabel}>Low Risk</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('Crypto')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#e1f5fe' }]}>
                                <MaterialCommunityIcons name="bitcoin" size={32} color="#0288d1" />
                            </Surface>
                            <Text variant="titleMedium">Crypto</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: '#f44336' }]}>High Risk</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('Stocks')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                                <MaterialCommunityIcons name="trending-up" size={32} color="#388e3c" />
                            </Surface>
                            <Text variant="titleMedium">Stocks</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: '#ff9800' }]}>Medium Risk</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('Bonds')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#f3e5f5' }]}>
                                <MaterialCommunityIcons name="file-chart" size={32} color="#7b1fa2" />
                            </Surface>
                            <Text variant="titleMedium">Bonds</Text>
                            <Text variant="bodySmall" style={styles.riskLabel}>Low Risk</Text>
                        </Card.Content>
                    </Card>
                </View>

                {portfolio?.investments?.length > 0 && (
                    <>
                        <Text variant="titleMedium" style={styles.historyTitle}>Recent Investments</Text>
                        {portfolio.investments.map((inv, idx) => (
                            <List.Item
                                key={idx}
                                title={inv.type}
                                description={`Invested on ${new Date(inv.date).toLocaleDateString()}`}
                                left={props => <List.Icon {...props} icon="check-circle" color="#4caf50" />}
                                right={() => <Text style={styles.historyAmount}>${inv.amount}</Text>}
                                style={styles.historyItem}
                            />
                        ))}
                    </>
                )}
            </ScrollView>

            <Button
                mode="contained"
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('Expense')}
            >
                Log Expense
            </Button>
        </View>
    );
};

// Fixing the missing icon name for Gold which was japenese by mistake
const GoldIcon = () => <MaterialCommunityIcons name="gold" size={32} color="#fbc02d" />;

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
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainSummary: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#1a237e',
        alignItems: 'center',
    },
    summaryLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    remainingAmount: {
        color: '#fff',
        fontWeight: 'bold',
        marginVertical: 8,
    },
    incomeExpenseRow: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 8,
    },
    statBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    incomeText: {
        color: '#fff',
        marginLeft: 4,
        fontWeight: 'bold',
    },
    expenseText: {
        color: '#fff',
        marginLeft: 4,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        width: '100%',
        marginTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressLabel: {
        color: '#fff',
        marginTop: 16,
        alignSelf: 'flex-start',
        opacity: 0.8,
    },
    sectionHeader: {
        marginTop: 32,
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#1a237e',
    },
    sectionSubtitle: {
        color: '#757575',
    },
    investmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    investCard: {
        width: '48%',
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    cardContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    riskLabel: {
        marginTop: 4,
        color: '#4caf50',
        fontWeight: 'bold',
    },
    historyTitle: {
        marginTop: 32,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    historyItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
    },
    historyAmount: {
        alignSelf: 'center',
        fontWeight: 'bold',
        color: '#1a237e',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        borderRadius: 16,
        backgroundColor: '#1a237e',
    },
});

export default InvestmentScreen;
