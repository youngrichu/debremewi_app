import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeJWT, getTokenExpirationTime, isTokenExpiringSoon } from '../services/auth';

export const TokenDebugComponent: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadTokenInfo = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const payload = decodeJWT(token);
        const expirationTime = getTokenExpirationTime(token);
        const isExpiringSoon = isTokenExpiringSoon(token, 30);
        
        setTokenInfo({
          hasToken: true,
          payload,
          expirationTime: expirationTime ? new Date(expirationTime).toISOString() : 'Unknown',
          isExpiringSoon,
          timeUntilExpiration: expirationTime ? Math.round((expirationTime - Date.now()) / 1000 / 60) : 'Unknown'
        });
      } else {
        setTokenInfo({ hasToken: false });
      }
    } catch (error) {
      console.error('Error loading token info:', error);
      Alert.alert('Error', 'Failed to load token information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokenInfo();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Token Debug Information
      </Text>
      
      {loading ? (
        <Text>Loading...</Text>
      ) : tokenInfo ? (
        <View>
          {tokenInfo.hasToken ? (
            <View>
              <Text>✅ Token exists</Text>
              <Text>Expiration: {tokenInfo.expirationTime}</Text>
              <Text>Expires in: {tokenInfo.timeUntilExpiration} minutes</Text>
              <Text>Expiring soon (30min): {tokenInfo.isExpiringSoon ? 'Yes' : 'No'}</Text>
              {tokenInfo.payload && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>Token Payload:</Text>
                  <Text style={{ fontSize: 12 }}>{JSON.stringify(tokenInfo.payload, null, 2)}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text>❌ No token found</Text>
          )}
        </View>
      ) : (
        <Text>No token information available</Text>
      )}
      
      <Button title="Refresh Token Info" onPress={loadTokenInfo} />
    </View>
  );
};