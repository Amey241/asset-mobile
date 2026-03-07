import React, { useContext } from 'react';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { Appbar, List, Button, Avatar, Surface, Text, Divider } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <View style={styles.content}>
                <Surface style={styles.profileHeader} elevation={2}>
                    <Avatar.Text size={80} label={user?.name?.substring(0, 2).toUpperCase() || 'U'} style={styles.avatar} />
                    <Text variant="headlineSmall" style={styles.name}>{user?.name}</Text>
                    <Text variant="bodyMedium" style={styles.role}>{user?.role?.toUpperCase()}</Text>
                    <Text variant="bodySmall" style={styles.email}>{user?.email}</Text>
                </Surface>

                <Surface style={styles.menuContainer} elevation={1}>
                    <List.Item
                        title="Account Settings"
                        left={props => <List.Icon {...props} icon="account-cog" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <Divider />
                    {user?.role === 'admin' && (
                        <>
                            <List.Item
                                title="User Management"
                                left={props => <List.Icon {...props} icon="account-group-outline" color="#6200ee" />}
                                right={props => <List.Icon {...props} icon="chevron-right" />}
                                onPress={() => navigation.navigate('UserManagement')}
                                titleStyle={{ color: '#6200ee', fontWeight: 'bold' }}
                            />
                            <Divider />
                        </>
                    )}
                    <List.Item
                        title="Notifications"
                        left={props => <List.Icon {...props} icon="bell-outline" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => Alert.alert('Notifications', 'No new notifications')}
                    />
                    <Divider />
                    <List.Item
                        title="Dark Mode"
                        left={props => <List.Icon {...props} icon="theme-light-dark" />}
                        right={props => <List.Icon {...props} icon="toggle-switch-off" />}
                    />
                    <Divider />
                    <List.Item
                        title="Privacy Policy"
                        left={props => <List.Icon {...props} icon="shield-check-outline" />}
                        onPress={() => Alert.alert('Privacy', 'Privacy Policy is available on our website.')}
                    />
                    <Divider />
                    <List.Item
                        title="Support"
                        left={props => <List.Icon {...props} icon="help-circle-outline" />}
                        onPress={() => Alert.alert('Support', 'Contact us at support@assettracker.com')}
                    />
                </Surface>

                <Button
                    mode="outlined"
                    onPress={logout}
                    style={styles.logoutButton}
                    textColor="#f44336"
                    icon="logout"
                >
                    Logout
                </Button>
            </View>
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
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    avatar: {
        backgroundColor: '#6200ee',
        marginBottom: 16,
    },
    name: {
        fontWeight: 'bold',
    },
    role: {
        color: '#6200ee',
        fontWeight: 'bold',
        fontSize: 12,
        marginTop: 4,
    },
    email: {
        color: '#757575',
        marginTop: 4,
    },
    menuContainer: {
        borderRadius: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
        marginBottom: 24,
    },
    logoutButton: {
        borderColor: '#f44336',
        borderWidth: 1.5,
        borderRadius: 12,
    },
});

export default ProfileScreen;
