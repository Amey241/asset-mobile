import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Appbar, List, Avatar, Button, Text, Surface, IconButton, Portal, Dialog, RadioButton } from 'react-native-paper';
import api from '../services/api';

const UserManagementScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleDialogVisible, setRoleDialogVisible] = useState(false);
    const [newRole, setNewRole] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            Alert.alert('Error', 'Failed to load users. Admin access required.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleRoleUpdate = async () => {
        try {
            await api.patch(`/auth/users/${selectedUser._id}?role=${newRole}`);
            setRoleDialogVisible(false);
            fetchUsers();
            Alert.alert('Success', 'User role updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to update user role');
        }
    };

    const handleDeleteUser = (user) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${user.name}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/auth/users/${user._id}`);
                            fetchUsers();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="User Management" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Surface style={styles.summaryCard} elevation={2}>
                    <Text variant="titleMedium">Total Users</Text>
                    <Text variant="displaySmall">{users.length}</Text>
                </Surface>

                <View style={styles.userList}>
                    {users.map((user) => (
                        <List.Item
                            key={user._id}
                            title={user.name}
                            description={`${user.email} • ${user.role.toUpperCase()}`}
                            left={props => <Avatar.Text {...props} label={user.name.charAt(0)} size={48} />}
                            right={props => (
                                <View style={styles.actionRow}>
                                    <IconButton
                                        icon="account-cog"
                                        onPress={() => {
                                            setSelectedUser(user);
                                            setNewRole(user.role);
                                            setRoleDialogVisible(true);
                                        }}
                                    />
                                    <IconButton
                                        icon="delete-outline"
                                        iconColor="#f44336"
                                        onPress={() => handleDeleteUser(user)}
                                    />
                                </View>
                            )}
                            style={styles.userItem}
                        />
                    ))}
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={roleDialogVisible} onDismiss={() => setRoleDialogVisible(false)}>
                    <Dialog.Title>Update Role for {selectedUser?.name}</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group onValueChange={value => setNewRole(value)} value={newRole}>
                            <View style={styles.radioItem}>
                                <RadioButton value="admin" />
                                <Text>Admin</Text>
                            </View>
                            <View style={styles.radioItem}>
                                <RadioButton value="staff" />
                                <Text>Staff</Text>
                            </View>
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setRoleDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleRoleUpdate}>Update</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    summaryCard: {
        margin: 16,
        padding: 24,
        borderRadius: 20,
        backgroundColor: '#1a237e',
        alignItems: 'center',
    },
    summaryText: {
        color: '#fff',
    },
    userList: {
        paddingHorizontal: 8,
    },
    userItem: {
        backgroundColor: '#fff',
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 12,
        elevation: 1,
    },
    actionRow: {
        flexDirection: 'row',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default UserManagementScreen;
