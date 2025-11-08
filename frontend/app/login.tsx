import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet, Image, Alert
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { recognizeUser } from '../api.js';

export default function LoginScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false); // To show/hide camera

  useEffect(() => {
    requestPermission();
    requestLibraryPermission();
  }, []);

  const pickImage = async () => {
    if (!libraryPermission?.granted) {
      Alert.alert('Permission Denied', 'We need permission to access your photo gallery.');
      await requestLibraryPermission();
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
      setShowCamera(false); // Hide the camera
    }
  };

  const handleLogin = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select or take a photo to log in.");
      return;
    }
    try {
      const result = await recognizeUser(imageUri);
      
      Alert.alert(
        "Success!", 
        `Welcome back, ${result.user_name}!`,
        [
          { 
            text: "OK", 
            onPress: () => router.push('/') 
          }
        ]
      );
      
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Login Failed", 
        "We could not recognize your face. Please try again."
      );
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
    <View style={styles.container}>
      {/* Image preview box */}
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

      <View style={{ height: 20 }} />

      {/* Submit button */}
      <Button
        title="Login"
        onPress={handleLogin}
        disabled={!imageUri} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: '100%', // Use '100%' not '1S00%'
  },
});