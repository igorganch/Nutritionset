import { Image, StyleSheet, Platform, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Text, View, Button, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
  const [permission, setPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState<string>('');
  const [token,setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MjY2NDMwNX0.S17thMRzfj1oL8zABXAup8Qf2RTyso8QlyxkmrWlMt4")

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>We need your permission to take a picture</Text>
        <Button onPress={setPermission} title="Grant permission" />
      </View>
    );
  }

  const addProduct = async () => {
    try {
      // Hardcode userId for testing
      const userId = '1'; // Assuming userId 1 for testing purposes
  
      // Format expiration date to YYYY/MM/DD (required by your backend)
      const [month, year] = expiration.split('/');
      const formattedExpiration = `20${year}/${month}/01`; // Assuming day as 01 for MM/YY format
  
      // Log the data being sent
      console.log('Sending data:', {
        userId,
        food_name: name,
        expiry_date: formattedExpiration,
      });
  
      // Send the product data to the test endpoint (no token required)
      const response = await fetch(`http://10.0.0.83:8080/api/product/create?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Change to JSON
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          food_name: name,
          expiry_date: formattedExpiration,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', 'Product added successfully!');
        console.log('Added product:', result);
        setName('');
        setExpiration('');
        Keyboard.dismiss();
      } else {
        Alert.alert('Error', result.message || 'Failed to add product.');
        console.log('Error response:', result);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      Alert.alert('Error', 'An error occurred while adding the product.');
    }
  };
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhotos((prevPhoto) => [...prevPhoto, photo.uri]);
        setShowCamera(false);
      }
    }
  };

  const validateMonth = (text: string) => {
    if (text.length < 3) return true;
    const month = parseInt(text.slice(0, 2), 10);
    return month >= 1 && month <= 12;
  };

  const handleExpiration = (text: string) => {
    let cleaned = text.replace(/[^0-9/]/g, '');
    if (cleaned.length === 2 && !cleaned.includes('/')) {
      cleaned += '/';
    }

    if (cleaned.length <= 5) {
      setExpiration(cleaned);
    }

    if (!validateMonth(cleaned)) {
      setError('Invalid month. Please enter a month between 01 and 12.');
    } else {
      setError('');
    }
  };

  const isSubmitDisabled = !(
    name.trim().length > 0 && expiration.length === 5 && validateMonth(expiration)
  );

  const cancelInput = () => {
    setName('');
    setExpiration('');
    Keyboard.dismiss();
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  return (
    <View style={{ backgroundColor: 'white', padding: 60, flex: 1, alignItems: 'center' }}>
      <Text style={styles.title}>Add Product</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name of Product:</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />
        <Text style={styles.label}>Expiration Date:</Text>
        <TextInput
          maxLength={5}
          value={expiration}
          onChangeText={handleExpiration}
          style={styles.input}
          placeholder="MM/YY"
          keyboardType="numeric"
        />
        {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
        <View style={styles.buttonContain}>
          <View style={styles.buttonWrapCancel}>
            <Button onPress={cancelInput} color="white" title="Cancel" />
          </View>
          <View style={styles.buttonWrapAdd}>
            <Button disabled={isSubmitDisabled} onPress={addProduct} color="white" title="Add" />
          </View>
        </View>
      </View>

      <View style={styles.lineContainer}>
        <View style={styles.line}></View>
        <Text style={{ marginHorizontal: 20 }}>Or</Text>
        <View style={styles.line}></View>
      </View>

      {showCamera ? (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <FontAwesome name="camera" size={35} onPress={takePicture} />
            <FontAwesome name="close" size={35} onPress={closeCamera} />
          </View>
        </CameraView>
      ) : (
        <TouchableOpacity onPress={openCamera} style={styles.photoButton}>
          <FontAwesome name="camera" size={25} />
          <Text style={{ marginLeft: 10 }}>Take Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 15,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    marginTop: 30,
    borderRadius: 8,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    width: '100%',
  },
  buttonWrapCancel: {
    flexDirection: 'row',
    width: '48%',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: 'black',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonWrapAdd: {
    flexDirection: 'row',
    width: '48%',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: 'red',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.85,
    elevation: 5, // for android only
    borderRadius: 5,
  },
  buttonContain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  inputContainer: {
    width: 300,
    height: 300,
    borderWidth: 1,
    margin: 20,
    padding: 20,
    borderRadius: 20,
    boxShadow: '',
  },
  input: {
    borderWidth: 0.4,
    padding: 7,
    borderRadius: 11,
  },
  label: {
    fontSize: 19,
    padding: 7,
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  camera: {
    flex: 1,
    width: 420,
    height: 100,
    borderRadius: 3,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    fontWeight: '400',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});