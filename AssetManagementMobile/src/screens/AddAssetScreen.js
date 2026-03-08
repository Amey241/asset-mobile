import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Appbar, Surface, Text, SegmentedButtons } from 'react-native-paper';
import api from '../services/api';

const AddAssetScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [assetCode, setAssetCode] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('good');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !assetCode || !category) {
            Alert.alert('Error', 'Please fill name, code and category');
            return;
        }

        setLoading(true);
        try {
            await api.post('/assets', {
                name,
                assetCode,
                category,
                description,
                conditionStatus: condition,
                purchasePrice: parseFloat(purchasePrice) || 0,
                purchaseDate,
                dueDate: dueDate || null
            });
            Alert.alert('Success', 'Asset added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Add New Asset" titleStyle={styles.headerTitle} />
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
                        placeholder="e.g. IT, Furniture, Vehicle"
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
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                        contentStyle={styles.saveButtonContent}
                    >
                        Save Asset
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

export default AddAssetScreen;
