import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import moment from 'moment'; // For better date formatting

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalling, setIsCalling] = useState(false); // Track if call is ongoing
  const [currentContact, setCurrentContact] = useState(null); // Track the current contact being called
  const [showSIMPrompt, setShowSIMPrompt] = useState(false); // To show SIM selection modal
  const [simChoice, setSimChoice] = useState(null); // Store SIM choice (SIM 1 or SIM 2)

  // Request permissions and load contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (Platform.OS === 'android') {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission denied', 'Cannot access contacts');
            setLoading(false);
            return;
          }
        }

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(data.sort((a, b) => a.name?.localeCompare(b.name)));
        } else {
          Alert.alert('No Contacts Found', 'You have no contacts in your phone.');
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to load contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Handle search query change
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle press on a contact to initiate a call
  const handlePressContact = (contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      setCurrentContact(contact); // Set the current contact being called
      setShowSIMPrompt(true); // Show SIM selection prompt
    } else {
      Alert.alert('Error', `${contact.name} has no phone number.`);
    }
  };

  // Handle SIM selection for call initiation
  const handleSIMSelection = (sim) => {
    setSimChoice(sim);
    setShowSIMPrompt(false); // Close SIM selection prompt
    setIsCalling(true); // Start the call
    // Simulate initiating the call, replace with real call logic
    Alert.alert('Calling', `Calling ${currentContact.name} at ${currentContact.phoneNumbers[0].number} via ${sim}`);
  };

  // End the ongoing call
  const handleEndCall = () => {
    setIsCalling(false); // End the call
    setCurrentContact(null); // Reset the current contact
    Alert.alert('Call Ended', `The call has been ended.`);
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render individual contact item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.callLogItem}
      onPress={() => handlePressContact(item)}
    >
      <Text style={styles.name}>{item.name}</Text>
      {item.phoneNumbers && item.phoneNumbers.length > 0 ? (
        <Text style={styles.number}>{item.phoneNumbers[0].number}</Text>
      ) : (
        <Text style={styles.noNumber}>No phone number available</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Contacts"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <Text style={styles.loadingText}>Loading contacts...</Text>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No contacts available</Text>}
        />
      )}

      {isCalling && currentContact && (
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Text style={styles.buttonText}>End Call</Text>
        </TouchableOpacity>
      )}

      {/* SIM Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSIMPrompt}
        onRequestClose={() => setShowSIMPrompt(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select SIM to Call</Text>
            <TouchableOpacity style={styles.simButton} onPress={() => handleSIMSelection('SIM 1')}>
              <Text style={styles.simButtonText}>SIM 1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simButton} onPress={() => handleSIMSelection('SIM 2')}>
              <Text style={styles.simButtonText}>SIM 2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSIMPrompt(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  noNumber: { fontSize: 16, color: '#f44336' },
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

  // Modal Styles
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  simButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  simButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
