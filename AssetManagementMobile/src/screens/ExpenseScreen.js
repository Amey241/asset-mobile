import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Appbar, Surface, Text, SegmentedButtons, List, useTheme } from 'react-native-paper';
import api from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ExpenseScreen = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('food');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const categories = [
        { value: 'food', icon: 'food', label: 'Food' },
        { value: 'travel', icon: 'car', label: 'Travel' },
        { value: 'shopping', icon: 'cart', label: 'Shop' },
        { value: 'bills', icon: 'file-document', label: 'Bills' },
        { value: 'other', icon: 'dots-horizontal', label: 'Other' },
    ];

    const handleSave = async () => {
        if (!amount || isNaN(amount)) {
            Alert.alert('Invalid Amount', 'Please enter a valid numeric amount.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/finance/expenses', {
                amount: parseFloat(amount),
                category,
                description,
                date: new Date().toISOString()
            });
            Alert.alert('Success', 'Expense logged successfully!', [
                {
                    text: 'OK', onPress: () => {
                        setAmount('');
                        setDescription('');
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to log expense. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Log Expense" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Surface style={styles.card} elevation={2}>
                    <View style={styles.amountContainer}>
                        <Text variant="labelLarge" style={styles.label}>Amount Spent</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="numeric"
                            mode="flat"
                            style={styles.amountInput}
                            contentStyle={styles.amountInputContent}
                            left={<TextInput.Affix text="₹" />}
                        />
                    </View>

                    <Text variant="labelLarge" style={[styles.label, { marginTop: 20 }]}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((cat) => (
                            <Surface
                                key={cat.value}
                                style={[
                                    styles.categoryItem,
                                    category === cat.value && { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }
                                ]}
                                elevation={category === cat.value ? 2 : 0}
                            >
                                <TouchableOpacity
                                    onPress={() => setCategory(cat.value)}
                                    style={styles.categoryTouchable}
                                >
                                    <MaterialCommunityIcons
                                        name={cat.icon}
                                        size={24}
                                        color={category === cat.value ? theme.colors.primary : '#757575'}
                                    />
                                    <Text style={[styles.categoryLabel, category === cat.value && { color: theme.colors.primary, fontWeight: 'bold' }]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            </Surface>
                        ))}
                    </View>

                    <TextInput
                        label="Description (Optional)"
                        value={description}
                        onChangeText={setDescription}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                        placeholder="What was this for?"
                    />

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                        contentStyle={styles.saveButtonContent}
                    >
                        Save Monthly Expense
                    </Button>
                </Surface>

                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information-outline" size={20} color="#616161" />
                    <Text variant="bodySmall" style={styles.infoText}>
                        Your expenses are used by the AI to calculate your monthly savings and suggest the best investment plans.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

// Simple internal TouchableOpacity because of specific styling needs
import { TouchableOpacity } from 'react-native';

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
    card: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#fff',
    },
    label: {
        color: '#757575',
        marginBottom: 8,
    },
    amountContainer: {
        alignItems: 'center',
    },
    amountInput: {
        backgroundColor: 'transparent',
        fontSize: 40,
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
    },
    amountInputContent: {
        textAlign: 'center',
        fontWeight: '900',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 20,
    },
    categoryItem: {
        width: '18%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fdfdfd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTouchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryLabel: {
        fontSize: 10,
        marginTop: 4,
        color: '#757575',
    },
    input: {
        marginTop: 8,
        backgroundColor: '#fff',
    },
    saveButton: {
        marginTop: 32,
        borderRadius: 12,
    },
    saveButtonContent: {
        paddingVertical: 8,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        color: '#1976d2',
    },
});

export default ExpenseScreen;
