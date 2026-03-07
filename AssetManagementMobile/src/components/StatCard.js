import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StatCard = ({ title, value, icon, color }) => {
    return (
        <Card style={styles.card}>
            <Card.Content style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <MaterialCommunityIcons name={icon} size={24} color={color} />
                </View>
                <View>
                    <Text variant="labelMedium" style={styles.title}>{title}</Text>
                    <Text variant="headlineSmall" style={[styles.value, { color }]}>{value}</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        elevation: 3,
        backgroundColor: '#fff',
    },
    content: {
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: '#757575',
        textAlign: 'center',
    },
    value: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default StatCard;
