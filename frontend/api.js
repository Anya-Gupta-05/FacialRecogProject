import axios from 'axios';

const API_URL = 'https://4c9c2c21d72e.ngrok-free.app'; 
export const registerUser = async (name, email, imageUri) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);

  const filename = imageUri.split('/').pop();
  const fileToUpload = {
    uri: imageUri,
    name: filename,
    type: 'image/jpeg',
  };
  formData.append('image_file', fileToUpload);

  try {
    const response = await axios.post(`${API_URL}/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error.response?.data || error.message);
    throw new Error("Registration failed. Check the server.");
  }
};

export const recognizeUser = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop();

  const fileToUpload = {
    uri: imageUri,
    name: filename,
    type: 'image/jpeg',
  };
  formData.append('image_file', fileToUpload);

  try {
    const response = await axios.post(`${API_URL}/recognize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during recognition:", error.response?.data || error.message);
    throw new Error("Recognition failed. Check the server.");
  }
};