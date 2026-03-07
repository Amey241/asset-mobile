import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AssetsScreen from '../screens/AssetsScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddAssetScreen from '../screens/AddAssetScreen';
import EditAssetScreen from '../screens/EditAssetScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import InvestmentScreen from '../screens/InvestmentScreen';
import AIAdvisorScreen from '../screens/AIAdvisorScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === 'Dashboard') iconName = 'view-dashboard';
                else if (route.name === 'Invest') iconName = 'wallet-giftcard';
                else if (route.name === 'Assets') iconName = 'package-variant-closed';
                else if (route.name === 'Scan') iconName = 'qrcode-scan';
                else if (route.name === 'Profile') iconName = 'account-circle';
                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
        })}
    >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Invest" component={InvestmentScreen} />
        <Tab.Screen name="Assets" component={AssetsScreen} />
        <Tab.Screen name="Scan" component={ScannerScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { user } = useContext(AuthContext);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                    <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
                    <Stack.Screen name="AddAsset" component={AddAssetScreen} />
                    <Stack.Screen name="EditAsset" component={EditAssetScreen} />
                    <Stack.Screen name="Expense" component={ExpenseScreen} />
                    <Stack.Screen name="AIAdvisor" component={AIAdvisorScreen} />
                    <Stack.Screen name="UserManagement" component={UserManagementScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
