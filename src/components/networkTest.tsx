import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';

export default function networkTest() {
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toISOString().split('T')[1]} ${msg}`]);

    const testConnection = async () => {
        setLog([]);
        addLog('Starting test...');

        try {
            addLog('Testing fetch to google.com...');
            await fetch('https://google.com');
            addLog('✅ Google fetch success');
        } catch (e: any) {
            addLog(`❌ Google fetch failed: ${e.message}`);
        }

        try {
            addLog('Testing fetch to API...');
            const res = await fetch('https://dubaidebremewi.com/wp-json/church-events/v1/events?per_page=1');
            addLog(`✅ API fetch status: ${res.status}`);
            const text = await res.text();
            addLog(`Body length: ${text.length}`);
        } catch (e: any) {
            addLog(`❌ API fetch failed: ${e.message}`);
            addLog(`Error cause: ${e.cause}`);
        }

        try {
            addLog('Testing Axios...');
            await axios.get('https://dubaidebremewi.com/wp-json/church-events/v1/events?per_page=1');
            addLog('✅ Axios success');
        } catch (e: any) {
            addLog(`❌ Axios failed: ${e.message}`);
            if (e.response) {
                addLog(`Status: ${e.response.status}`);
            } else if (e.request) {
                addLog('No response received');
                // Log detailed error from request if available
                addLog(`Req Error: ${JSON.stringify(e)}`);
            }
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Button title="Run Network Test" onPress={testConnection} />
            <View style={styles.logContainer}>
                {log.map((l, i) => <Text key={i} style={styles.logText}>{l}</Text>)}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, marginTop: 50 },
    logContainer: { marginTop: 20 },
    logText: { fontFamily: 'monospace', fontSize: 12, marginBottom: 5 }
});
