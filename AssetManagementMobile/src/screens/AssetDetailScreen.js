import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Card, Text, Button, List, Divider, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

    const handleDelete = () => {
        Alert.alert(
            "Delete Asset",
            "Are you sure you want to permanently delete this asset? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/assets/${assetId}`);
                            navigation.navigate('Main', { screen: 'Dashboard' });
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete asset');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

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
                <Appbar.BackAction color="#0F172A" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Asset Profile" titleStyle={styles.headerTitle} />
                <Appbar.Action icon="pencil" color="#3B82F6" onPress={() => navigation.navigate('EditAsset', { assetId: asset._id })} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Profile Card */}
                <Surface style={styles.heroCard} elevation={4}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons
                                name={asset.category?.toLowerCase() === 'laptop' ? 'laptop' : 'package-variant'}
                                size={40}
                                color="#FFFFFF"
                            />
                        </View>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: getStatusColor(asset.status) + '1A' }]}
                            textStyle={[styles.statusChipText, { color: getStatusColor(asset.status) }]}
                        >
                            {(asset.status || 'unknown').toUpperCase()}
                        </Chip>
                    </View>

                    <Text variant="headlineMedium" style={styles.heroName}>{asset.name}</Text>
                    <Text variant="titleMedium" style={styles.heroCode}>{asset.assetCode}</Text>

                    <View style={styles.heroBadges}>
                        <View style={styles.badgeItem}>
                            <MaterialCommunityIcons name="tag-outline" size={16} color="#94A3B8" />
                            <Text style={styles.badgeText}>{asset.category || 'N/A'}</Text>
                        </View>
                        <View style={styles.badgeItem}>
                            <MaterialCommunityIcons name="shield-check-outline" size={16} color="#94A3B8" />
                            <Text style={styles.badgeText}>{(asset.conditionStatus || 'N/A').toUpperCase()}</Text>
                        </View>
                        <View style={styles.badgeItem}>
                            <MaterialCommunityIcons name="account-outline" size={16} color="#94A3B8" />
                            <Text style={styles.badgeText}>{asset.assignedTo?.name || 'Unassigned'}</Text>
                        </View>
                    </View>
                </Surface>

                {/* Financial Data Card */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Financials</Text>
                <View style={styles.financeGrid}>
                    <Surface style={styles.financeBox} elevation={1}>
                        <Text style={styles.financeLabel}>Purchase Price</Text>
                        <Text style={styles.financeValue}>₹{asset.purchasePrice?.toLocaleString('en-IN') || 0}</Text>
                        <Text style={styles.financeSubText}>
                            On {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                        </Text>
                    </Surface>

                    <Surface style={[styles.financeBox, styles.financeBoxHighlight]} elevation={1}>
                        <Text style={styles.financeLabelDark}>Current Value</Text>
                        <Text style={styles.financeValueHighlight}>₹{asset.currentValue?.toLocaleString('en-IN') || 0}</Text>
                        <Text style={styles.financeSubTextHighlight}>
                            Depreciated
                        </Text>
                    </Surface>
                </View>

                {/* Description */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Notes</Text>
                <Surface style={styles.infoCard} elevation={1}>
                    <Text style={styles.descriptionText}>
                        {asset.description || 'No additional notes provided.'}
                    </Text>
                </Surface>

                {/* Due Date if applicable */}
                {asset.dueDate && (
                    <Surface style={styles.warningCard} elevation={0}>
                        <MaterialCommunityIcons name="calendar-alert" size={24} color="#D97706" />
                        <View style={styles.warningTextContainer}>
                            <Text style={styles.warningTitle}>Return Due Date</Text>
                            <Text style={styles.warningDesc}>{new Date(asset.dueDate).toLocaleDateString()}</Text>
                        </View>
                    </Surface>
                )}

                <View style={styles.actionButtonsRow}>
                    <Button
                        mode="contained"
                        icon="qrcode"
                        buttonColor="#0F172A"
                        textColor="#FFF"
                        style={[styles.actionBtn, { flex: 2 }]}
                        contentStyle={{ paddingVertical: 8 }}
                        onPress={() => setQrModalVisible(true)}
                    >
                        Show QR
                    </Button>
                    <Button
                        mode="contained"
                        icon="delete"
                        buttonColor="#EF4444"
                        textColor="#FFF"
                        style={[styles.actionBtn, { flex: 1 }]}
                        contentStyle={{ paddingVertical: 8 }}
                        onPress={handleDelete}
                    >
                        Delete
                    </Button>
                </View>

                {/* History Timeline */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Activity History</Text>
                <Surface style={styles.infoCard} elevation={1}>
                    {history.length > 0 ? (
                        history.map((log, index) => (
                            <View key={log._id} style={styles.timelineRow}>
                                <View style={styles.timelineLeft}>
                                    <View style={[
                                        styles.timelineDot,
                                        { backgroundColor: log.action === 'create' ? '#10B981' : log.action === 'assign' ? '#3B82F6' : '#94A3B8' }
                                    ]} />
                                    {index < history.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineMessage}>{log.message}</Text>
                                    <View style={styles.timelineMeta}>
                                        <Text style={styles.timelineDate}>{new Date(log.createdAt).toLocaleDateString()}</Text>
                                        <Text style={styles.timelineUser}> • {log.user?.name || 'System'}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No activity recorded yet.</Text>
                    )}
                </Surface>

                <View style={{ height: 40 }} />

                {/* QR Modal */}
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
                            <View style={styles.qrCodeContainer}>
                                <QRCode
                                    value={asset.assetCode}
                                    size={200}
                                    color="#0F172A"
                                    backgroundColor="#fff"
                                />
                            </View>
                            <Button
                                mode="contained"
                                buttonColor="#3B82F6"
                                style={styles.closeButton}
                                onPress={() => setQrModalVisible(false)}
                            >
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
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#F8FAFC',
        elevation: 0,
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#0F172A',
        fontSize: 20,
    },
    content: {
        padding: 16,
    },
    heroCard: {
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
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusChip: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statusChipText: {
        fontWeight: '900',
        fontSize: 10,
        letterSpacing: 0.5,
    },
    heroName: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 26,
    },
    heroCode: {
        color: '#94A3B8',
        marginTop: 4,
        marginBottom: 20,
    },
    heroBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    badgeText: {
        color: '#E2E8F0',
        fontSize: 12,
        fontWeight: '500',
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#0F172A',
        fontSize: 18,
        marginLeft: 4,
        marginBottom: 12,
    },
    financeGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    financeBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    financeBoxHighlight: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    financeLabel: {
        color: '#64748B',
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    financeLabelDark: {
        color: '#166534',
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    financeValue: {
        color: '#0F172A',
        fontSize: 24,
        fontWeight: 'bold',
    },
    financeValueHighlight: {
        color: '#16A34A',
        fontSize: 24,
        fontWeight: 'bold',
    },
    financeSubText: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 4,
    },
    financeSubTextHighlight: {
        color: '#22C55E',
        fontSize: 12,
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    descriptionText: {
        color: '#475569',
        lineHeight: 22,
        fontSize: 15,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FDE68A',
        gap: 12,
    },
    warningTitle: {
        color: '#92400E',
        fontWeight: 'bold',
    },
    warningDesc: {
        color: '#B45309',
        fontSize: 13,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionBtn: {
        borderRadius: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    timelineRow: {
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
        marginTop: 4,
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
    timelineMessage: {
        color: '#0F172A',
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 4,
    },
    timelineMeta: {
        flexDirection: 'row',
    },
    timelineDate: {
        color: '#64748B',
        fontSize: 12,
    },
    timelineUser: {
        color: '#94A3B8',
        fontSize: 12,
    },
    emptyText: {
        color: '#94A3B8',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    qrCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    qrTitle: {
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    qrCodeText: {
        color: '#64748B',
        marginBottom: 24,
    },
    qrCodeContainer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    closeButton: {
        marginTop: 32,
        width: '100%',
        borderRadius: 12,
    },
});

export default AssetDetailScreen;
