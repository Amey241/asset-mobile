import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Appbar, IconButton, Surface } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

const ScannerScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        console.log(`Scanned type: ${type}, data: ${data}`);
        try {
            const response = await api.get(`/assets/code/${data}`);
            if (response.data) {
                navigation.navigate('AssetDetail', { assetId: response.data._id });
            } else {
                Alert.alert('Not Found', `Asset with code ${data} not found`, [
                    { text: 'OK', onPress: () => setScanned(false) }
                ]);
            }
        } catch (error) {
            console.error('Scan API error:', error.message);
            Alert.alert('Error', 'Failed to scan asset. Please try again.', [
                { text: 'OK', onPress: () => setScanned(false) }
            ]);
        }
    };

    if (!permission) {
        return <View style={styles.center}><Text>Requesting for camera permission</Text></View>;
    }
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{ marginBottom: 20 }}>No access to camera</Text>
                <Button mode="contained" onPress={requestPermission}>Grant Permission</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Scan QR Code" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.overlay}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.middleContainer}>
                    <View style={styles.unfocusedContainer}></View>
                    <View style={styles.focusedContainer}>
                        <View style={styles.cornerTopLeft} />
                        <View style={styles.cornerTopRight} />
                        <View style={styles.cornerBottomLeft} />
                        <View style={styles.cornerBottomRight} />
                    </View>
                    <View style={styles.unfocusedContainer}></View>
                </View>
                <View style={styles.unfocusedContainer}></View>
            </View>

            <Surface style={styles.footer} elevation={4}>
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="#6200ee" />
                <Text variant="bodyLarge" style={styles.footerText}>
                    Align the QR code within the frame to scan
                </Text>
                {scanned && (
                    <Button mode="contained" onPress={() => setScanned(false)} style={styles.rescanBtn}>
                        Tap to Scan Again
                    </Button>
                )}
            </Surface>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        backgroundColor: 'transparent',
        elevation: 0,
        zIndex: 10,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        position: 'relative',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#6200ee',
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#6200ee',
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#6200ee',
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#6200ee',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 8,
    },
    footerText: {
        textAlign: 'center',
        color: '#424242',
    },
    rescanBtn: {
        marginTop: 8,
        width: '100%',
    },
});

export default ScannerScreen;
