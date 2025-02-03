import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import CallLogs from 'react-native-call-log';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import moment from 'moment'; // For better date formatting

export default function RecentCallsScreen() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalling, setIsCalling] = useState(false); // Track if call is ongoing
  const [currentCall, setCurrentCall] = useState(null); // Track the current call being made
  const [selectedSim, setSelectedSim] = useState(null); // Track the selected SIM (SIM 1 or SIM 2)
  
  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const permission = await request(PERMISSIONS.ANDROID.READ_CALL_LOG);
        if (permission === RESULTS.GRANTED) {
          const logs = await CallLogs.loadAll();
          setCallLogs(logs);
        } else {
          Alert.alert('Permission Denied', 'Cannot access call logs without permission');
        }
      } catch (error) {
        console.error('Error fetching call logs:', error);
        Alert.alert('Error', 'Unable to fetch recent call logs');
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSelectSim = (phoneNumber) => {
    // Ask the user to choose which SIM card to use
    Alert.alert(
      'Select SIM',
      'Which SIM would you like to use to make the call?',
      [
        {
          text: 'SIM 1',
          onPress: () => handleCall(phoneNumber, 'SIM 1'),
        },
        {
          text: 'SIM 2',
          onPress: () => handleCall(phoneNumber, 'SIM 2'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleCall = (phoneNumber, sim) => {
    setCurrentCall(phoneNumber); // Track the call being made
    setIsCalling(true); // Mark call as ongoing
    setSelectedSim(sim); // Set selected SIM
    // Here, initiate the VoIP call or dialer call using the selected SIM:
    Alert.alert('Calling', `Calling ${phoneNumber} using ${sim}...`);
    
    // For real phone dialing with SIM selection:
    if (Platform.OS === 'android') {
      // Use 'tel' URL scheme and specify the SIM card if the Android device supports it
      // This would be dependent on the Android version and manufacturer-specific APIs
      Linking.openURL(`tel:${phoneNumber}?sim=${sim}`).catch(err => Alert.alert('Error', 'Failed to initiate call'));
    }
    // For VoIP or other libraries like 'react-native-callkeep', you would initiate the call using that library
  };

  const handleEndCall = () => {
    setIsCalling(false); // End the call
    setCurrentCall(null); // Reset the current call
    // Simulate ending the call, replace with actual logic
    Alert.alert('Call Ended', `The call to ${currentCall} has ended.`);
    // If using VoIP library, you would end the call here
  };

  const filteredCallLogs = callLogs.filter(
    (log) =>
      log.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phoneNumber?.includes(searchQuery)
  );

  const renderCallLog = ({ item }) => (
    <TouchableOpacity
      style={styles.callLogItem}
      onPress={() => handleSelectSim(item.phoneNumber)} // Ask to select SIM when tapping on call log
    >
      <Text style={styles.name}>{item.name || 'Unknown'}</Text>
      <Text style={styles.number}>{item.phoneNumber}</Text>
      <Text style={styles.type}>
        {item.type === '1' ? 'Incoming' : item.type === '2' ? 'Outgoing' : 'Missed'}
      </Text>
      <Text style={styles.date}>{moment(item.timestamp).format('LLL')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Calls</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search calls by name or number"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <Text style={styles.loadingText}>Loading recent calls...</Text>
      ) : (
        <FlatList
          data={filteredCallLogs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCallLog}
          ListEmptyComponent={<Text style={styles.emptyText}>No recent calls found</Text>}
        />
      )}
      {isCalling && currentCall && (
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Text style={styles.buttonText}>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  callLogItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  number: { fontSize: 16, color: '#555' },
  type: { fontSize: 14, color: '#777' },
  date: { fontSize: 12, color: '#aaa' },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 20, color: '#007aff' },
  emptyText: { fontSize: 18, textAlign: 'center', marginTop: 20, color: '#888' },
  endCallButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
