import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AssetCard = ({ asset, onPress }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return '#10B981'; // Emerald
            case 'assigned': return '#3B82F6';  // Blue
            case 'maintenance': return '#EF4444'; // Red
            default: return '#94A3B8';
        }
    };

    const statusColor = getStatusColor(asset.status);

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />

            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons
                        name={asset.category?.toLowerCase() === 'laptop' ? 'laptop' : 'package-variant'}
                        size={24}
                        color="#0F172A"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                        {asset.name}
                    </Text>
                    <View style={styles.metaRow}>
                        <Text variant="bodySmall" style={styles.metaText}>{asset.assetCode}</Text>
                        <View style={styles.dot} />
                        <Text variant="labelSmall" style={[styles.statusText, { color: statusColor }]}>
                            {(asset.status || 'unknown').toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionContainer}>
                    {asset.currentValue !== undefined && (
                        <Text style={styles.valueText}>₹{asset.currentValue.toLocaleString('en-IN')}</Text>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusIndicator: {
        width: 4,
        backgroundColor: '#10B981',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#0F172A',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        color: '#64748B',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 8,
    },
    statusText: {
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    actionContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingLeft: 8,
    },
    valueText: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
});

export default AssetCard;
