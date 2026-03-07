import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Appbar, Searchbar, FAB, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AssetCard from '../components/AssetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const AssetsScreen = ({ navigation }) => {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [scrollY] = useState(new Animated.Value(0));

    const fetchAssets = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await api.get('/assets');
            setAssets(response.data);

            const query = searchQuery.toLowerCase();
            if (query) {
                const filtered = response.data.filter(asset =>
                    asset.name.toLowerCase().includes(query) ||
                    asset.assetCode.toLowerCase().includes(query)
                );
                setFilteredAssets(filtered);
            } else {
                setFilteredAssets(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch assets', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [searchQuery]);

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

    const handleSearch = (query) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        const filtered = assets.filter(asset =>
            asset.name.toLowerCase().includes(lowerQuery) ||
            asset.assetCode.toLowerCase().includes(lowerQuery)
        );
        setFilteredAssets(filtered);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a237e', '#3949ab']}
                style={styles.headerGradient}
            >
                <Appbar.Header style={styles.header}>
                    <Appbar.Content
                        title="Inventory"
                        titleStyle={styles.headerTitle}
                        subtitle={`${filteredAssets.length} Active Items`}
                        subtitleStyle={styles.headerSubtitle}
                    />
                    <Appbar.Action icon="magnify" color="#fff" onPress={() => { }} />
                </Appbar.Header>

                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Scan or Search Assets..."
                        onChangeText={handleSearch}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                        iconColor="#1a237e"
                    />
                </View>
            </LinearGradient>

            <FlatList
                data={filteredAssets}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <AssetCard
                        asset={item}
                        onPress={() => navigation.navigate('AssetDetail', { assetId: item._id })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1a237e']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Surface style={styles.emptyIconCircle} elevation={1}>
                            <FAB icon="package-variant" style={styles.emptyIcon} disabled />
                        </Surface>
                        <Text variant="titleMedium" style={styles.emptyTitle}>No Assets Found</Text>
                        <Text variant="bodySmall" style={styles.emptySubtitle}>Try adjusting your filters or add a new asset below.</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                label="New Asset"
                style={styles.fab}
                onPress={() => navigation.navigate('AddAsset')}
                color="#fff"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fa',
    },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
    },
    header: {
        backgroundColor: 'transparent',
        elevation: 0,
    },
    headerTitle: {
        fontWeight: '900',
        color: '#fff',
        fontSize: 24,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    searchBar: {
        borderRadius: 16,
        backgroundColor: '#fff',
        height: 50,
    },
    searchInput: {
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a237e',
        borderRadius: 28,
        elevation: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        backgroundColor: 'transparent',
    },
    emptyTitle: {
        color: '#1a237e',
        fontWeight: 'bold',
    },
    emptySubtitle: {
        color: '#757575',
        textAlign: 'center',
        paddingHorizontal: 40,
        marginTop: 8,
    },
});

export default AssetsScreen;
