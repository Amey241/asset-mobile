import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AssetCard = ({ asset, onPress }) => {
    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content style={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="package-variant" size={30} color="#6200ee" />
                </View>
                <View style={styles.info}>
                    <Text variant="titleMedium" style={styles.name}>{asset.name}</Text>
                    <Text variant="bodySmall" style={styles.code}>{asset.assetCode}</Text>
                    <View style={[styles.badge, { backgroundColor: asset.status === 'available' ? '#4caf50' : '#ff9800' }]}>
                        <Text style={styles.badgeText}>{asset.status}</Text>
                    </View>
                </View>
                <IconButton icon="chevron-right" size={24} />
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: '#fff',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f3e5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontWeight: 'bold',
    },
    code: {
        color: '#757575',
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
});

export default AssetCard;
