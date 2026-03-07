import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text, Button, List, Divider, Surface, Chip } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const AssetDetailScreen = ({ route, navigation }) => {
    const { assetId } = route.params;
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetRes, historyRes] = await Promise.all([
                    api.get(`/assets/${assetId}`),
                    api.get(`/assets/${assetId}/history`)
                ]);
                setAsset(assetRes.data);
                setHistory(historyRes.data);
            } catch (error) {
                console.error('Failed to fetch asset details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assetId]);

    if (loading) return <LoadingSpinner />;
    if (!asset) return <View style={styles.container}><Text>Asset not found</Text></View>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return '#4caf50';
            case 'assigned': return '#2196f3';
            case 'maintenance': return '#f44336';
            default: return 'gray';
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Asset Details" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Surface style={styles.mainCard} elevation={2}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text variant="headlineSmall" style={styles.name}>{asset.name}</Text>
                            <Text variant="bodyMedium" style={styles.code}>{asset.assetCode}</Text>
                        </View>
                        <Chip style={{ backgroundColor: getStatusColor(asset.status) + '20' }} textStyle={{ color: getStatusColor(asset.status) }}>
                            {asset.status.toUpperCase()}
                        </Chip>
                    </View>

                    <Divider style={styles.divider} />

                    <List.Item
                        title="Category"
                        description={asset.category || 'N/A'}
                        left={props => <List.Icon {...props} icon="tag-outline" />}
                    />
                    <List.Item
                        title="Condition"
                        description={asset.conditionStatus.toUpperCase()}
                        left={props => <List.Icon {...props} icon="shield-outline" />}
                    />
                    <List.Item
                        title="Assigned To"
                        description={asset.assignedTo?.name || 'Unassigned'}
                        left={props => <List.Icon {...props} icon="account-outline" />}
                    />
                    {asset.dueDate && (
                        <List.Item
                            title="Return Due Date"
                            description={new Date(asset.dueDate).toLocaleDateString()}
                            left={props => <List.Icon {...props} icon="calendar-clock" color="#ff9800" />}
                            titleStyle={{ color: '#ff9800', fontWeight: 'bold' }}
                        />
                    )}
                </Surface>

                <Surface style={styles.descriptionCard} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Financial Overview</Text>
                    <View style={styles.financialRow}>
                        <View style={styles.financialItem}>
                            <Text variant="labelMedium" style={styles.financialLabel}>Purchase Price</Text>
                            <Text variant="titleLarge" style={styles.financialValue}>${asset.purchasePrice || 0}</Text>
                        </View>
                        <View style={styles.financialItem}>
                            <Text variant="labelMedium" style={styles.financialLabel}>Current Value</Text>
                            <Text variant="titleLarge" style={[styles.financialValue, { color: '#4caf50' }]}>${asset.currentValue || 0}</Text>
                        </View>
                    </View>
                    <Text variant="bodySmall" style={styles.purchaseDate}>
                        Purchased on: {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                    </Text>
                </Surface>

                <Surface style={styles.descriptionCard} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
                    <Text variant="bodyMedium" style={styles.description}>
                        {asset.description || 'No description provided for this asset.'}
                    </Text>
                </Surface>

                <Surface style={styles.descriptionCard} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Activity History</Text>
                    {history.length > 0 ? (
                        history.map((log, index) => (
                            <View key={log._id}>
                                <List.Item
                                    title={log.message}
                                    description={`${log.user?.name || 'System'} • ${new Date(log.createdAt).toLocaleDateString()}`}
                                    left={props => <List.Icon {...props} icon={
                                        log.action === 'create' ? 'plus-circle' :
                                            log.action === 'assign' ? 'account-check' : 'update'
                                    } color={
                                        log.action === 'create' ? '#4caf50' :
                                            log.action === 'assign' ? '#2196f3' : '#757575'
                                    } />}
                                    titleNumberOfLines={2}
                                />
                                {index < history.length - 1 && <Divider style={styles.logDivider} />}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No activity recorded yet.</Text>
                    )}
                </Surface>

                <View style={styles.actionContainer}>
                    <Button mode="contained" icon="qrcode" style={styles.actionButton} onPress={() => setQrModalVisible(true)}>
                        View QR Code
                    </Button>
                    <Button mode="outlined" icon="pencil" style={[styles.actionButton, styles.editButton]} onPress={() => navigation.navigate('EditAsset', { assetId: asset._id })}>
                        Edit Details
                    </Button>
                </View>

                <Modal
                    visible={qrModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setQrModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setQrModalVisible(false)}
                    >
                        <Surface style={styles.qrCard} elevation={5}>
                            <Text variant="titleLarge" style={styles.qrTitle}>{asset.name}</Text>
                            <Text variant="bodyMedium" style={styles.qrCodeText}>{asset.assetCode}</Text>
                            <View style={styles.qrContainer}>
                                <QRCode
                                    value={asset.assetCode}
                                    size={200}
                                    color="#000"
                                    backgroundColor="#fff"
                                />
                            </View>
                            <Button onPress={() => setQrModalVisible(false)} style={styles.closeButton}>
                                Close
                            </Button>
                        </Surface>
                    </TouchableOpacity>
                </Modal>
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
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    name: {
        fontWeight: 'bold',
    },
    code: {
        color: '#757575',
    },
    divider: {
        marginVertical: 8,
    },
    descriptionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        color: '#616161',
        lineHeight: 20,
    },
    actionContainer: {
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 6,
    },
    editButton: {
        borderColor: '#6200ee',
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    financialItem: {
        flex: 1,
    },
    financialLabel: {
        color: '#757575',
        marginBottom: 4,
    },
    financialValue: {
        fontWeight: 'bold',
    },
    purchaseDate: {
        color: '#9e9e9e',
        fontStyle: 'italic',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    qrCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
    },
    qrTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    qrCodeText: {
        color: '#757575',
        marginBottom: 20,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    closeButton: {
        marginTop: 20,
    },
    emptyText: {
        color: '#9e9e9e',
        fontStyle: 'italic',
        paddingVertical: 8,
    },
    logDivider: {
        backgroundColor: '#f0f0f0',
    },
});

export default AssetDetailScreen;
