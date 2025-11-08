import { Link } from 'expo-router';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Face Recognition</Text>
      
      <Link href="/login" asChild>
        <Button title="Login (Recognize Face)" />
      </Link>
      <Link href="/register" asChild>
        <Button title="Register New User" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});