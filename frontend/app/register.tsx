import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, Button, StyleSheet, TextInput, Image, Alert, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { registerUser } from '../api.js';

export default function RegisterScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photo gallery.');
      return; 
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
      setShowCamera(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!name || !email || !imageUri) {
      Alert.alert("Error", "Please fill in all fields and take a photo.");
      return;
    }
    try {
      const result = await registerUser(name, email, imageUri);
      Alert.alert(
        "Success!", 
        `User ${result.user_id} registered.`,
        [
          { 
            text: "OK", 
            onPress: () => router.push('/')
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Registration Failed", "An error occurred.");
    }
  };
  
  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text>We need your permission to show the camera.</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
          <Button onPress={() => setShowCamera(false)} title="Cancel" />
        </View>
      );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={styles.camera}
          facing="front"
          ref={cameraRef}
        />
        <Button title="Take Picture" onPress={takePicture} />
        <Button title="Cancel" onPress={() => setShowCamera(false)} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>No photo selected</Text>
          )}
        </View>

        {imageUri ? (
          <Button 
            title="Clear Photo" 
            onPress={() => setImageUri(null)} 
          />
        ) : (
          <View style={styles.buttonContainer}>
            <Button 
              title="Take Photo" 
              onPress={() => setShowCamera(true)}
            />
            <Button 
              title="Select from Gallery" 
              onPress={pickImage} 
            />
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Enter your Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          title="Register"
          onPress={handleSubmit}
          disabled={!name || !email || !imageUri}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 250,
    height: 250,
    aspectRatio: 1,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: '#888',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
});