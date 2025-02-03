import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import SimData from 'react-native-sim-data';

export default function KeypadScreen() {
  const [dialedNumber, setDialedNumber] = useState('');
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false); // Track if call is ongoing
  const [simCount, setSimCount] = useState(1); // Default to 1 SIM
  const [simInfo, setSimInfo] = useState([]);
  const [currentSIM, setCurrentSIM] = useState(null); // Track the selected SIM

  // Fetch SIM information
  useEffect(() => {
    const fetchSimInfo = async () => {
      const sims = await SimData.getSimInfo();
      setSimInfo(sims);
      setSimCount(sims.length);
    };

    fetchSimInfo();
  }, []);

  // Handle key press
  const handlePress = (num) => setDialedNumber(dialedNumber + num);

  // Handle backspace to remove a number
  const handleBackspace = () => setDialedNumber(dialedNumber.slice(0, -1));

  // Handle saving the number
  const handleSave = () => {
    if (name.trim() && dialedNumber) {
      Alert.alert('Saved', `Saved ${name} (${dialedNumber})`);
      setName('');
      setDialedNumber('');
      setIsSaveModalVisible(false);
    } else {
      Alert.alert('Error', 'Please provide a valid name and number');
    }
  };

  // Handle initiating a call
  const handleCall = () => {
    if (dialedNumber) {
      if (simCount === 1) {
        // Automatically call using the single SIM
        setLoading(true);
        setIsCalling(true);
        Alert.alert('Calling', `Calling ${dialedNumber}...`);
        setLoading(false);
      } else {
        // Show SIM selection modal if there are two SIMs
        setIsCalling(true); // Prevent further actions until SIM is selected
      }
    } else {
      Alert.alert('Error', 'No number to call');
    }
  };

  // Handle SIM selection for calling
  const handleSimSelection = (simIndex) => {
    const sim = simInfo[simIndex];
    const simName = sim ? sim.displayName : 'Unknown';
    setLoading(true);
    setCurrentSIM(simName);

    // Simulate the call process with selected SIM
    Alert.alert('Calling', `Calling ${dialedNumber} using ${simName}`);
    setLoading(false);
    setIsCalling(false);
  };

  // Handle ending the ongoing call
  const handleEndCall = () => {
    setIsCalling(false); // End the call
    setCurrentSIM(null); // Reset the selected SIM
    Alert.alert('Call Ended', `The call to ${dialedNumber} has ended.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keypad</Text>

      {/* Editable input for the dialed number */}
      <TextInput
        style={styles.input}
        value={dialedNumber}
        onChangeText={setDialedNumber}
        placeholder="Enter Number"
        keyboardType="phone-pad"
      />

      {/* Scrollable Keypad */}
      <ScrollView style={styles.keypad} contentContainerStyle={styles.keypadContainer}>
        {/* First Row: 1, 2, 3 */}
        <View style={styles.keyRow}>
          {[1, 2, 3].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handlePress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Second Row: 4, 5, 6 */}
        <View style={styles.keyRow}>
          {[4, 5, 6].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handlePress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Third Row: 7, 8, 9 */}
        <View style={styles.keyRow}>
          {[7, 8, 9].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handlePress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fourth Row: *, 0, # */}
        <View style={styles.keyRow}>
          {['*', 0, '#'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handlePress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fifth Row: Backspace */}
        <View style={styles.keyRow}>
          <TouchableOpacity style={styles.key} onPress={handleBackspace}>
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleCall} disabled={loading || isCalling}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Call</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={() => setIsSaveModalVisible(true)}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {isCalling && (
        <View style={styles.callingScreen}>
          <Text style={styles.callingText}>
            {currentSIM ? `Calling ${dialedNumber} via ${currentSIM}` : `Calling ${dialedNumber}...`}
          </Text>
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Text style={styles.buttonText}>End Call</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SIM Selection Modal for multiple SIM cards */}
      {simCount > 1 && isCalling && (
        <Modal visible={isCalling} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select SIM</Text>
              {simInfo.map((sim, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.simOption}
                  onPress={() => handleSimSelection(index)}
                >
                  <Text style={styles.simOptionText}>
                    {sim.displayName || `SIM ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
              <Button title="Cancel" onPress={() => setIsCalling(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* Save Modal */}
      <Modal visible={isSaveModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Contact</Text>

            {/* Display dialed number on top of the name input */}
            <Text style={styles.dialedNumber}>{dialedNumber}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter Name"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setIsSaveModalVisible(false)} />
              <Button title="Save" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { fontSize: 24, borderWidth: 1, borderColor: '#ccc', marginBottom: 20, padding: 10, textAlign: 'center' },
  keypad: { flex: 1, marginBottom: 20 },
  keypadContainer: { flexDirection: 'column', justifyContent: 'center' },
  keyRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  key: { width: 70, height: 70, margin: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007aff', borderRadius: 35 },
  keyText: { fontSize: 24, color: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { flex: 1, margin: 5, padding: 15, backgroundColor: '#007aff', borderRadius: 10 },
  saveButton: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
  endCallButton: { marginTop: 10, padding: 15, backgroundColor: '#d32f2f', borderRadius: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around' },
  simOption: { padding: 10, backgroundColor: '#007aff', marginBottom: 10, borderRadius: 5 },
  simOptionText: { color: '#fff', fontSize: 18 },
  dialedNumber: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  callingScreen: { alignItems: 'center', marginTop: 20 },
  callingText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});

