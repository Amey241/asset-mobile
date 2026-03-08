import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Appbar, Searchbar, FAB, Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AssetCard from '../components/AssetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const FILTERS = ['All', 'Available', 'Assigned', 'Maintenance'];

const AssetsScreen = ({ navigation }) => {
    const [assets, setAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAssets = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await api.get('/assets');
            setAssets(response.data);
        } catch (error) {
            console.error('Failed to fetch assets', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchAssets(assets.length === 0);
        }, [fetchAssets, assets.length])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAssets(false);
        setRefreshing(false);
    };

    const displayAssets = useMemo(() => {
        let filtered = assets;
        if (activeFilter !== 'All') {
            filtered = filtered.filter(a => a.status.toLowerCase() === activeFilter.toLowerCase());
        }
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(lowerQuery) ||
                a.assetCode.toLowerCase().includes(lowerQuery)
            );
        }
        return filtered;
    }, [assets, activeFilter, searchQuery]);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Inventory</Text>
                    <Text style={styles.headerSubtitle}>{displayAssets.length} Items</Text>
                </View>
                <Appbar.Action icon="barcode-scan" color="#0F172A" onPress={() => navigation.navigate('Scan')} />
            </Appbar.Header>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search by name or serial..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#94A3B8"
                    placeholderTextColor="#94A3B8"
                    elevation={0}
                />
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={FILTERS}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.filterList}
                    renderItem={({ item }) => {
                        const isActive = activeFilter === item;
                        return (
                            <TouchableOpacity
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => setActiveFilter(item)}
                            >
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <FlatList
                data={displayAssets}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <AssetCard
                        asset={item}
                        onPress={() => navigation.navigate('AssetDetail', { assetId: item._id })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#3B82F6"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="package-variant" size={48} color="#CBD5E1" />
                        </View>
                        <Text variant="titleMedium" style={styles.emptyTitle}>No Assets Found</Text>
                        <Text variant="bodySmall" style={styles.emptySubtitle}>Try adjusting your filters or add a new asset.</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('AddAsset')}
                color="#FFFFFF"
                customSize={56}
            />
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontWeight: '900',
        color: '#0F172A',
        fontSize: 28,
    },
    headerSubtitle: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 2,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    searchBar: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        fontSize: 15,
        color: '#0F172A',
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    filterText: {
        color: '#64748B',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    fab: {
        position: 'absolute',
        margin: 24,
        right: 0,
        bottom: 70, // Above floating tab bar
        backgroundColor: '#3B82F6',
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyTitle: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: 18,
    },
    emptySubtitle: {
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default AssetsScreen;
