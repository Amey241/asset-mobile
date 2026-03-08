import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Appbar, Surface, Text, SegmentedButtons } from 'react-native-paper';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EditAssetScreen = ({ route, navigation }) => {
    const { assetId } = route.params;
    const [name, setName] = useState('');
    const [assetCode, setAssetCode] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('good');
    const [status, setStatus] = useState('available');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await api.get(`/assets`);
                const asset = response.data.find(a => a._id === assetId);
                if (asset) {
                    setName(asset.name);
                    setAssetCode(asset.assetCode);
                    setCategory(asset.category);
                    setDescription(asset.description || '');
                    setCondition(asset.conditionStatus);
                    setStatus(asset.status);
                    setPurchasePrice(asset.purchasePrice?.toString() || '0');
                    setCurrentValue(asset.currentValue?.toString() || '0');
                    setPurchaseDate(asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '');
                    setDueDate(asset.dueDate ? new Date(asset.dueDate).toISOString().split('T')[0] : '');
                }
            } catch (error) {
                console.error('Failed to load asset', error);
                Alert.alert('Error', 'Failed to load asset data');
            } finally {
                setLoading(false);
            }
        };
        fetchAsset();
    }, [assetId]);

    const handleUpdate = async () => {
        if (!name || !assetCode || !category) {
            Alert.alert('Error', 'Please fill name, code and category');
            return;
        }

        setSaving(true);
        try {
            await api.patch(`/assets/${assetId}`, {
                name,
                assetCode,
                category,
                description,
                conditionStatus: condition,
                status: status,
                purchasePrice: purchasePrice ? Number(purchasePrice.replace(/[^0-9.-]+/g, "")) : 0,
                currentValue: currentValue ? Number(currentValue.replace(/[^0-9.-]+/g, "")) : 0,
                purchaseDate: purchaseDate,
                dueDate: dueDate || null
            });
            Alert.alert('Success', 'Asset updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update asset');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Edit Asset" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Surface style={styles.form} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionLabel}>Basic Information</Text>
                    <TextInput
                        label="Asset Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Asset Code / Serial Number"
                        value={assetCode}
                        onChangeText={setAssetCode}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Category"
                        value={category}
                        onChangeText={setCategory}
                        mode="outlined"
                        style={styles.input}
                    />

                    <Text variant="titleMedium" style={styles.sectionLabel}>Financial Details</Text>
                    <TextInput
                        label="Purchase Price (₹)"
                        value={purchasePrice}
                        onChangeText={setPurchasePrice}
                        mode="outlined"
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <TextInput
                        label="Current Value (₹)"
                        value={currentValue}
                        onChangeText={setCurrentValue}
                        mode="outlined"
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <TextInput
                        label="Purchase Date (YYYY-MM-DD)"
                        value={purchaseDate}
                        onChangeText={setPurchaseDate}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Due Date (YYYY-MM-DD) - Optional"
                        value={dueDate}
                        onChangeText={setDueDate}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g. 2026-12-31"
                    />

                    <Text variant="titleMedium" style={styles.sectionLabel}>Status</Text>
                    <SegmentedButtons
                        value={status}
                        onValueChange={setStatus}
                        buttons={[
                            { value: 'available', label: 'Avail' },
                            { value: 'assigned', label: 'Assign' },
                            { value: 'maintenance', label: 'Maint' },
                        ]}
                        style={styles.segmented}
                    />

                    <Text variant="titleMedium" style={styles.sectionLabel}>Condition</Text>
                    <SegmentedButtons
                        value={condition}
                        onValueChange={setCondition}
                        buttons={[
                            { value: 'new', label: 'New' },
                            { value: 'good', label: 'Good' },
                            { value: 'fair', label: 'Fair' },
                            { value: 'poor', label: 'Poor' },
                        ]}
                        style={styles.segmented}
                    />

                    <Text variant="titleMedium" style={styles.sectionLabel}>Description</Text>
                    <TextInput
                        label="Notes / Description"
                        value={description}
                        onChangeText={setDescription}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                    />

                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        loading={saving}
                        style={styles.saveButton}
                        contentStyle={styles.saveButtonContent}
                    >
                        Update Asset
                    </Button>
                </Surface>
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
    form: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    sectionLabel: {
        marginTop: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    segmented: {
        marginBottom: 12,
    },
    saveButton: {
        marginTop: 24,
        borderRadius: 12,
    },
    saveButtonContent: {
        paddingVertical: 8,
    },
});

export default EditAssetScreen;
