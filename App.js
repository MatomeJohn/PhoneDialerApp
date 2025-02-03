import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import KeypadScreen from './screens/KeypadScreen';
import ContactsScreen from './screens/ContactsScreen';
import RecentCallsScreen from './screens/RecentCallsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            // Update the icon names here
            if (route.name === 'Keypad') {
              iconName = 'keypad-outline'; // Correct icon for Keypad
            } else if (route.name === 'Contacts') {
              iconName = 'person-outline'; // Correct icon for Contacts
            } else if (route.name === 'Recent Calls') {
              iconName = 'call-outline'; // Correct icon for Recent Calls
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007aff', // Active tab color
          tabBarInactiveTintColor: 'gray', // Inactive tab color
          headerStyle: { backgroundColor: '#f8f8f8' }, // Header style
          headerTitleStyle: { fontWeight: 'bold', color: '#007aff' }, // Header text style
        })}
      >
        <Tab.Screen name="Keypad" component={KeypadScreen} />
        <Tab.Screen name="Contacts" component={ContactsScreen} />
        <Tab.Screen name="Recent Calls" component={RecentCallsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
