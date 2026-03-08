import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Appbar, Surface, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.5:3000'; // Make sure this matches your backend Socket.io URL

const DashboardScreen = ({ navigation }) => {
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
                population: Number(catData[key]) || 0,
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

        // Setup Socket.io connection for real-time updates
        const socket = io(SOCKET_URL);

        socket.on('portfolioUpdated', (data) => {
            console.log('Real-time update received:', data);
            fetchStats(); // Refresh data smoothly
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
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
                <Appbar.Action icon="bell-ring-outline" color="#0F172A" onPress={() => { }} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
                showsVerticalScrollIndicator={false}
            >
                <Surface style={styles.heroBanner} elevation={4}>
                    <View style={styles.heroTopRow}>
                        <View>
                            <Text variant="titleSmall" style={styles.heroGreeting}>Welcome back,</Text>
                            <Text variant="titleLarge" style={styles.heroName}>{user?.name}</Text>
                        </View>
                        <Surface style={styles.riskBadge} elevation={0}>
                            <Text style={styles.riskText}>{user?.risk_profile?.toUpperCase() || 'MEDIUM'} RISK</Text>
                        </Surface>
                    </View>

                    <View style={styles.heroCenter}>
                        <Text variant="bodyMedium" style={styles.netWorthLabel}>Net Portfolio Value</Text>
                        <Text variant="displaySmall" style={styles.netWorthAmount}>
                            ₹{totalValue.toLocaleString('en-IN')}
                        </Text>
                        <Text variant="labelLarge" style={styles.monthlySavings}>
                            + ₹{portfolio?.remaining_money?.toLocaleString('en-IN') || '0'} monthly reserve
                        </Text>
                    </View>

                    <View style={styles.heroActions}>
                        <Button
                            mode="contained"
                            buttonColor="#10B981"
                            textColor="#fff"
                            icon="trending-up"
                            onPress={() => navigation.navigate('Invest')}
                            style={styles.heroBtn}
                            contentStyle={styles.heroBtnContent}
                        >
                            Invest
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor="rgba(255,255,255,0.15)"
                            textColor="#fff"
                            icon="plus"
                            onPress={() => navigation.navigate('Scan')}
                            style={styles.heroBtn}
                            contentStyle={styles.heroBtnContent}
                        >
                            Add Asset
                        </Button>
                    </View>
                </Surface>

                <View style={styles.statsGrid}>
                    <View style={styles.row}>
                        <StatCard title="Total Assets" value={stats.total} icon="database" color="#0F172A" />
                        <StatCard title="Available" value={stats.available} icon="check-circle" color="#10B981" />
                    </View>
                    <View style={styles.row}>
                        <StatCard title="Assigned" value={stats.assigned} icon="account-check" color="#3B82F6" />
                        <StatCard title="Maintenance" value={stats.maintenance} icon="tools" color="#EF4444" />
                    </View>
                </View>

                {stats.overdue > 0 && (
                    <Surface style={styles.overdueSurface} elevation={1}>
                        <View style={styles.overdueHeader}>
                            <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
                            <Text variant="titleMedium" style={styles.overdueTitle}>Overdue Assets ({stats.overdue})</Text>
                        </View>
                        <Text variant="bodySmall" style={styles.overdueText}>
                            Attention required: Some assigned assets are past their return date.
                        </Text>
                    </Surface>
                )}

                <Surface style={styles.chartSurface} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Asset Allocation</Text>
                    {chartData.length > 0 ? (
                        <View style={styles.chartWrapper}>
                            <PieChart
                                data={chartData}
                                width={Dimensions.get('window').width - 72}
                                height={220}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="0"
                                absolute
                            />
                        </View>
                    ) : (
                        <View style={styles.emptyChart}>
                            <MaterialCommunityIcons name="chart-pie" size={48} color="#E2E8F0" />
                            <Text style={styles.emptyChartText}>Add assets to view your allocation.</Text>
                        </View>
                    )}
                </Surface>

                <View style={styles.timelineHeader}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>
                    <Button mode="text" textColor="#3B82F6" compact>View All</Button>
                </View>

                <Surface style={styles.timelineContainer} elevation={1}>
                    {recentActivity.length > 0 ? (
                        recentActivity.slice(0, 5).map((item, index) => (
                            <View key={item._id} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View style={[styles.timelineDot, { backgroundColor: item.action === 'create' ? '#10B981' : '#3B82F6' }]} />
                                    {index !== recentActivity.slice(0, 5).length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <View style={styles.timelineContentHeader}>
                                        <Text variant="titleSmall" style={styles.timelineTitle} numberOfLines={1}>{item.asset?.name || 'Asset action'}</Text>
                                        <Text variant="labelSmall" style={styles.timelineTime}>
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}
                                        </Text>
                                    </View>
                                    <Text variant="bodySmall" style={styles.timelineDesc} numberOfLines={2}>{item.message}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyActivity}>
                            <MaterialCommunityIcons name="history" size={32} color="#E2E8F0" />
                            <Text variant="bodyMedium" style={styles.emptyActivityText}>No recent activities to display.</Text>
                        </View>
                    )}
                </Surface>
                <View style={{ height: 100 }} />
            </ScrollView>
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    heroBanner: {
        backgroundColor: '#0F172A',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroGreeting: {
        color: '#94A3B8',
    },
    heroName: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    riskBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.5)',
    },
    riskText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#10B981',
        letterSpacing: 0.5,
    },
    heroCenter: {
        marginTop: 24,
        marginBottom: 24,
    },
    netWorthLabel: {
        color: '#94A3B8',
        marginBottom: 4,
    },
    netWorthAmount: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    monthlySavings: {
        color: '#10B981',
        marginTop: 4,
    },
    heroActions: {
        flexDirection: 'row',
        gap: 12,
    },
    heroBtn: {
        flex: 1,
        borderRadius: 16,
    },
    heroBtnContent: {
        paddingVertical: 4,
    },
    statsGrid: {
        marginBottom: 24,
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#0F172A',
        fontSize: 18,
    },
    chartSurface: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    chartWrapper: {
        alignItems: 'center',
        marginTop: 12,
    },
    emptyChart: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyChartText: {
        color: '#94A3B8',
        marginTop: 8,
        fontWeight: '500',
    },
    overdueSurface: {
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    overdueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    overdueTitle: {
        color: '#B91C1C',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    overdueText: {
        color: '#7F1D1D',
        marginLeft: 32,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timelineContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 12,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 20,
    },
    timelineContentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    timelineTitle: {
        fontWeight: 'bold',
        color: '#0F172A',
        flex: 1,
        marginRight: 8,
    },
    timelineTime: {
        color: '#94A3B8',
    },
    timelineDesc: {
        color: '#64748B',
    },
    emptyActivity: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyActivityText: {
        color: '#94A3B8',
        marginTop: 8,
    },
});

export default DashboardScreen;
