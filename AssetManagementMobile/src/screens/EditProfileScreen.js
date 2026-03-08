import React, { useState, useContext } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Appbar, Surface, Text, SegmentedButtons } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [income, setIncome] = useState(user?.monthly_income?.toString() || '0');
    const [risk, setRisk] = useState(user?.risk_profile || 'medium');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.patch('/auth/profile', {
                name,
                monthly_income: parseFloat(income) || 0,
                risk_profile: risk
            });

            // Update local context
            updateUser(response.data);

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Update profile error', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Edit Profile" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Surface style={styles.form} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionLabel}>Personal Information</Text>
                    <TextInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                    />

                    <Text variant="titleMedium" style={styles.sectionLabel}>Financial Settings</Text>
                    <TextInput
                        label="Monthly Income (₹)"
                        value={income}
                        onChangeText={setIncome}
                        mode="outlined"
                        keyboardType="numeric"
                        style={styles.input}
                        placeholder="e.g. 5000"
                    />

                    <Text variant="titleMedium" style={styles.sectionLabel}>Risk Tolerance</Text>
                    <Text variant="bodySmall" style={styles.helperText}>
                        This affects your AI investment recommendations.
                    </Text>
                    <SegmentedButtons
                        value={risk}
                        onValueChange={setRisk}
                        buttons={[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
                        ]}
                        style={styles.segmented}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                        contentStyle={styles.saveButtonContent}
                    >
                        Save Changes
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
    helperText: {
        color: '#757575',
        marginBottom: 8,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    segmented: {
        marginBottom: 24,
    },
    saveButton: {
        marginTop: 8,
        borderRadius: 12,
    },
    saveButtonContent: {
        paddingVertical: 8,
    },
});

export default EditProfileScreen;
