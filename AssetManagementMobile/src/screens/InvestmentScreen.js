import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions, Alert } from 'react-native';
import { Text, Appbar, Surface, Button, useTheme, Card, List, IconButton, ProgressBar, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.5:3000'; // Make sure this matches your backend Socket.io URL

const InvestmentScreen = ({ navigation }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Live Market Risks
    const [marketRisks, setMarketRisks] = useState({
        Gold: { risk: 'Low Risk', price: 0, change: 0 },
        Crypto: { risk: 'High Risk', price: 0, change: 0 },
        Stocks: { risk: 'Medium Risk', price: 0, change: 0 },
        Bonds: { risk: 'Low Risk', price: 0, change: 0 },
        RealEstate: { risk: 'Medium Risk', price: 0, change: 0 },
        MutualFunds: { risk: 'Medium Risk', price: 0, change: 0 }
    });

    // History for graph
    const [priceHistory, setPriceHistory] = useState({
        Gold: [0, 0, 0, 0, 0, 0],
        Crypto: [0, 0, 0, 0, 0, 0],
        Stocks: [0, 0, 0, 0, 0, 0],
        Bonds: [0, 0, 0, 0, 0, 0],
        RealEstate: [0, 0, 0, 0, 0, 0],
        MutualFunds: [0, 0, 0, 0, 0, 0],
    });

    const [selectedGraph, setSelectedGraph] = useState('Crypto');

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

        // Setup Socket.io connection for real-time updates
        const socket = io(SOCKET_URL);

        socket.on('portfolioUpdated', (data) => {
            console.log('Real-time update received:', data);
            fetchPortfolio(); // Refresh data smoothly
        });

        socket.on('marketUpdate', (updates) => {
            console.log('Market updates received');
            setMarketRisks({
                Gold: { risk: `${updates.Gold?.risk || 'Low'} Risk`, price: updates.Gold?.price || 0, change: updates.Gold?.change || 0 },
                Crypto: { risk: `${updates.Crypto?.risk || 'High'} Risk`, price: updates.Crypto?.price || 0, change: updates.Crypto?.change || 0 },
                Stocks: { risk: `${updates.Stocks?.risk || 'Medium'} Risk`, price: updates.Stocks?.price || 0, change: updates.Stocks?.change || 0 },
                Bonds: { risk: `${updates.Bonds?.risk || 'Low'} Risk`, price: updates.Bonds?.price || 0, change: updates.Bonds?.change || 0 },
                RealEstate: { risk: `${updates.RealEstate?.risk || 'Medium'} Risk`, price: updates.RealEstate?.price || 0, change: updates.RealEstate?.change || 0 },
                MutualFunds: { risk: `${updates.MutualFunds?.risk || 'Medium'} Risk`, price: updates.MutualFunds?.price || 0, change: updates.MutualFunds?.change || 0 }
            });

            // Append history for all graphs
            setPriceHistory(prev => ({
                Gold: [...prev.Gold.slice(1), updates.Gold?.price || prev.Gold[prev.Gold.length - 1]],
                Crypto: [...prev.Crypto.slice(1), updates.Crypto?.price || prev.Crypto[prev.Crypto.length - 1]],
                Stocks: [...prev.Stocks.slice(1), updates.Stocks?.price || prev.Stocks[prev.Stocks.length - 1]],
                Bonds: [...prev.Bonds.slice(1), updates.Bonds?.price || prev.Bonds[prev.Bonds.length - 1]],
                RealEstate: [...prev.RealEstate.slice(1), updates.RealEstate?.price || prev.RealEstate[prev.RealEstate.length - 1]],
                MutualFunds: [...prev.MutualFunds.slice(1), updates.MutualFunds?.price || prev.MutualFunds[prev.MutualFunds.length - 1]],
            }));
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, [fetchPortfolio]);

    const handleInvest = (type) => {
        navigation.navigate('AIAdvisor', { investmentType: type });
    };

    if (!portfolio && loading) return <View style={styles.center}><Text>Calculating Portfolio...</Text></View>;

    const savingsRate = portfolio ? (portfolio.remaining_money / portfolio.total_income) : 0;
    const progressColor = savingsRate > 0.3 ? '#4caf50' : savingsRate > 0.1 ? '#ff9800' : '#f44336';

    const getRiskColor = (riskLabel) => {
        if (riskLabel.includes('Extreme')) return '#d50000'; // Dark Red
        if (riskLabel.includes('High')) return '#f44336'; // Red
        if (riskLabel.includes('Medium')) return '#ff9800'; // Orange
        return '#4caf50'; // Green (Low)
    };

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
                        ₹{portfolio?.remaining_money?.toFixed(2) || '0.00'}
                    </Text>

                    <View style={styles.incomeExpenseRow}>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="arrow-up-circle" size={20} color="#4caf50" />
                            <Text variant="bodyMedium" style={styles.incomeText}>₹{portfolio?.total_income?.toFixed(0)}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="arrow-down-circle" size={20} color="#f44336" />
                            <Text variant="bodyMedium" style={styles.expenseText}>₹{portfolio?.total_expenses?.toFixed(0)}</Text>
                        </View>
                    </View>

                    <Text variant="bodySmall" style={styles.progressLabel}>
                        Savings Rate: {(savingsRate * 100).toFixed(0)}%
                    </Text>
                    <ProgressBar progress={savingsRate} color={progressColor} style={styles.progressBar} />
                </Surface>

                <View style={styles.sectionHeader}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Real-Time Market Data</Text>
                    <Text variant="bodySmall" style={styles.sectionSubtitle}>Live analytics powered by CoinGecko</Text>
                </View>

                {/* Live Graph Section */}
                <Surface style={styles.graphSurface} elevation={2}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                        {[
                            { value: 'Crypto', label: 'Crypto', icon: 'bitcoin' },
                            { value: 'Gold', label: 'Gold', icon: 'gold' },
                            { value: 'Stocks', label: 'Stocks', icon: 'trending-up' },
                            { value: 'Bonds', label: 'Bonds', icon: 'file-chart' },
                            { value: 'RealEstate', label: 'Real Estate', icon: 'home-city' },
                            { value: 'MutualFunds', label: 'Mutual Funds', icon: 'chart-pie' },
                        ].map((item) => (
                            <Button
                                key={item.value}
                                mode={selectedGraph === item.value ? 'contained' : 'outlined'}
                                onPress={() => setSelectedGraph(item.value)}
                                icon={item.icon}
                                style={styles.graphChip}
                                labelStyle={{ fontSize: 12 }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </ScrollView>

                    <View style={styles.livePriceHeader}>
                        <Text variant="headlineMedium" style={styles.livePrice}>
                            ₹{marketRisks[selectedGraph]?.price?.toLocaleString('en-IN') || 0}
                        </Text>
                        <Text style={[styles.liveChange, { color: marketRisks[selectedGraph]?.change >= 0 ? '#4caf50' : '#f44336' }]}>
                            {marketRisks[selectedGraph]?.change >= 0 ? '+' : ''}{marketRisks[selectedGraph]?.change?.toFixed(2)}% (24h)
                        </Text>
                    </View>

                    <LineChart
                        data={{
                            labels: ['-75s', '-60s', '-45s', '-30s', '-15s', 'Now'],
                            datasets: [
                                {
                                    data: priceHistory[selectedGraph].every(v => v === 0) ? [1, 1, 1, 1, 1, 1] : priceHistory[selectedGraph], // Prevent flatline crash on 0s
                                    strokeWidth: 3,
                                }
                            ]
                        }}
                        width={Dimensions.get('window').width - 64} // from react-native
                        height={220}
                        withDots={true}
                        withInnerLines={false}
                        withOuterLines={false}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => {
                                switch (selectedGraph) {
                                    case 'Crypto': return `rgba(2, 136, 209, ${opacity})`;
                                    case 'Gold': return `rgba(251, 192, 45, ${opacity})`;
                                    case 'Stocks': return `rgba(56, 142, 60, ${opacity})`;
                                    case 'Bonds': return `rgba(123, 31, 162, ${opacity})`;
                                    case 'RealEstate': return `rgba(245, 124, 0, ${opacity})`;
                                    case 'MutualFunds': return `rgba(25, 118, 210, ${opacity})`;
                                    default: return `rgba(2, 136, 209, ${opacity})`;
                                }
                            },
                            labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                            marginLeft: -10,
                        }}
                    />
                </Surface>

                <View style={styles.investmentGrid}>
                    <Card style={styles.investCard} onPress={() => handleInvest('Gold')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#fff9c4' }]}>
                                <MaterialCommunityIcons name="gold" size={32} color="#fbc02d" />
                            </Surface>
                            <Text variant="titleMedium">Gold</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: getRiskColor(marketRisks.Gold.risk) }]}>{marketRisks.Gold.risk}</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('Crypto')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#e1f5fe' }]}>
                                <MaterialCommunityIcons name="bitcoin" size={32} color="#0288d1" />
                            </Surface>
                            <Text variant="titleMedium">Crypto</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: getRiskColor(marketRisks.Crypto.risk) }]}>{marketRisks.Crypto.risk}</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('Stocks')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                                <MaterialCommunityIcons name="trending-up" size={32} color="#388e3c" />
                            </Surface>
                            <Text variant="titleMedium">Stocks</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: getRiskColor(marketRisks.Stocks.risk) }]}>{marketRisks.Stocks.risk}</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('Bonds')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#f3e5f5' }]}>
                                <MaterialCommunityIcons name="file-chart" size={32} color="#7b1fa2" />
                            </Surface>
                            <Text variant="titleMedium">Bonds</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: getRiskColor(marketRisks.Bonds.risk) }]}>{marketRisks.Bonds.risk}</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('RealEstate')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
                                <MaterialCommunityIcons name="home-city" size={32} color="#f57c00" />
                            </Surface>
                            <Text variant="titleMedium">Real Estate</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: getRiskColor(marketRisks.RealEstate.risk) }]}>{marketRisks.RealEstate.risk}</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.investCard} onPress={() => handleInvest('MutualFunds')}>
                        <Card.Content style={styles.cardContent}>
                            <Surface style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                                <MaterialCommunityIcons name="chart-pie" size={32} color="#1976d2" />
                            </Surface>
                            <Text variant="titleMedium">Mutual Funds</Text>
                            <Text variant="bodySmall" style={[styles.riskLabel, { color: getRiskColor(marketRisks.MutualFunds.risk) }]}>{marketRisks.MutualFunds.risk}</Text>
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
                                right={() => <Text style={styles.historyAmount}>₹{inv.amount}</Text>}
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
    graphSurface: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
    },
    chipScroll: {
        paddingBottom: 16,
        gap: 8,
    },
    graphChip: {
        borderRadius: 20,
        marginRight: 8,
    },
    livePriceHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        paddingHorizontal: 8,
    },
    livePrice: {
        fontWeight: 'bold',
        color: '#1a237e',
    },
    liveChange: {
        fontWeight: 'bold',
        fontSize: 16,
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
