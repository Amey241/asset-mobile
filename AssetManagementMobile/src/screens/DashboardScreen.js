import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Appbar, Surface, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../services/api';

const DashboardScreen = () => {
    const { user } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        overdue: 0,
    });
    const [totalValue, setTotalValue] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const theme = useTheme();

    const fetchStats = async () => {
        try {
            const [statsRes, activityRes, portfolioRes] = await Promise.all([
                api.get('/assets/stats'),
                api.get('/assets/activity'),
                api.get('/finance/portfolio')
            ]);

            const statsData = statsRes.data || {};
            const activity = activityRes.data || [];

            setStats({
                total: statsData.total || 0,
                available: statsData.available || 0,
                assigned: statsData.assigned || 0,
                maintenance: statsData.maintenance || 0,
                overdue: statsData.overdue || 0,
            });
            setTotalValue(statsData.totalValue || 0);

            const colors = ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb', '#9fa8da'];
            const catData = statsData.categoryData || {};
            const formattedChartData = Object.keys(catData).map((key, index) => ({
                name: key,
                population: catData[key],
                color: colors[index % colors.length],
                legendFontColor: '#757575',
                legendFontSize: 12
            }));
            setChartData(formattedChartData);
            setRecentActivity(activity);
            setPortfolio(portfolioRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Dashboard" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Surface style={styles.welcomeSurface} elevation={1}>
                    <View style={styles.welcomeHeader}>
                        <View>
                            <Text variant="headlineSmall" style={styles.welcomeText}>Welcome back,</Text>
                            <Text variant="titleLarge" style={styles.userName}>{user?.name} 👋</Text>
                        </View>
                        <Surface style={styles.riskBadge} elevation={0}>
                            <Text style={styles.riskText}>{user?.risk_profile?.toUpperCase() || 'MEDIUM'} RISK</Text>
                        </Surface>
                    </View>

                    <View style={styles.budgetContainer}>
                        <Text variant="labelLarge" style={styles.budgetLabel}>Monthly Savings</Text>
                        <Text variant="displaySmall" style={styles.budgetAmount}>
                            ${portfolio?.remaining_money?.toFixed(2) || '0.00'}
                        </Text>
                        <Button
                            mode="text"
                            icon="trending-up"
                            onPress={() => navigation.navigate('Invest')}
                            compact
                        >
                            Invest Wisely
                        </Button>
                    </View>
                </Surface>

                <View style={styles.statsGrid}>
                    <View style={styles.row}>
                        <StatCard title="Total Assets" value={stats.total} icon="database" color="#1a237e" />
                        <StatCard title="Available" value={stats.available} icon="check-circle" color="#4caf50" />
                    </View>
                    <View style={styles.row}>
                        <StatCard title="Assigned" value={stats.assigned} icon="account-check" color="#1976d2" />
                        <StatCard title="Maintenance" value={stats.maintenance} icon="tools" color="#f44336" />
                    </View>
                </View>

                {stats.overdue > 0 && (
                    <Surface style={styles.overdueSurface} elevation={2}>
                        <View style={styles.overdueHeader}>
                            <MaterialCommunityIcons name="alert-decagram" size={24} color="#f44336" />
                            <Text variant="titleMedium" style={styles.overdueTitle}>Overdue Assets ({stats.overdue})</Text>
                        </View>
                        <Text variant="bodySmall" style={styles.overdueText}>
                            Attention required: Some assigned assets are past their return date.
                        </Text>
                    </Surface>
                )}

                <Surface style={styles.chartSurface} elevation={1}>
                    <Text variant="titleMedium" style={styles.chartTitle}>Portfolio Investment</Text>
                    <View style={styles.totalValueContainer}>
                        <Text variant="labelLarge" style={styles.totalValueLabel}>Total Portfolio Value</Text>
                        <Text variant="headlineMedium" style={styles.totalValueText}>${totalValue.toLocaleString()}</Text>
                    </View>
                    {chartData.length > 0 ? (
                        <PieChart
                            data={chartData}
                            width={Dimensions.get('window').width - 64}
                            height={200}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyChartText}>Add assets with value to see analysis</Text>
                    )}
                </Surface>

                <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>
                {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((item) => (
                        <Surface key={item._id} style={styles.activityItem} elevation={1}>
                            <View style={[styles.activityIcon, { backgroundColor: item.action === 'create' ? '#e8f5e9' : '#f3e5f5' }]}>
                                <MaterialCommunityIcons
                                    name={item.action === 'create' ? 'plus-circle' : 'update'}
                                    size={24}
                                    color={item.action === 'create' ? '#4caf50' : '#1a237e'}
                                />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text variant="titleSmall" numberOfLines={1}>{item.asset?.name || 'Asset action'}</Text>
                                <Text variant="bodySmall" numberOfLines={1}>{item.message}</Text>
                            </View>
                            <Text variant="labelSmall" style={styles.activityTime}>
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                            </Text>
                        </Surface>
                    ))
                ) : (
                    <Surface style={styles.activityCard} elevation={1}>
                        <Text variant="bodyMedium" style={styles.emptyActivity}>No recent activities to display.</Text>
                    </Surface>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fa',
    },
    header: {
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#1a237e',
    },
    scrollContent: {
        padding: 16,
    },
    welcomeSurface: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    riskBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    riskText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    budgetContainer: {
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
    },
    budgetLabel: {
        color: '#757575',
    },
    budgetAmount: {
        fontWeight: 'bold',
        color: '#1a237e',
        marginVertical: 4,
    },
    welcomeText: {
        color: '#757575',
    },
    userName: {
        fontWeight: 'bold',
        color: '#212121',
    },
    statsGrid: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
        color: '#1a237e',
    },
    activityCard: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3e5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTime: {
        color: '#9e9e9e',
    },
    emptyActivity: {
        color: '#9e9e9e',
    },
    chartSurface: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    chartTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a237e',
    },
    totalValueContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    totalValueLabel: {
        color: '#757575',
    },
    totalValueText: {
        fontWeight: 'bold',
        color: '#1a237e',
    },
    emptyChartText: {
        textAlign: 'center',
        color: '#9e9e9e',
        marginVertical: 40,
    },
    overdueSurface: {
        backgroundColor: '#fff1f0',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ffa39e',
    },
    overdueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    overdueTitle: {
        color: '#cf1322',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    overdueText: {
        color: '#595959',
        marginLeft: 32,
    },
});

export default DashboardScreen;
