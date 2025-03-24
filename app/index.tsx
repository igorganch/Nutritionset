import { useEffect } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // replaces history so back button doesn't return here
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
     

      {/* Heading */}
      <Text style={styles.heading}>
        Easily scan receipts & barcodes to track expiration dates.
      </Text>
 {/* Scanner Icon */}
 <View style={styles.scannerContainer}>
        <Icon name="qr-code-scanner" size={width * 0.6} color="#27391C" />
      </View>
      {/* Food Item Card */}
      <View style={styles.foodCard}>
        {/* <Image source={require('../assets/broccoli.png')} style={styles.foodImage} /> */}
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>Broccoli</Text>
          <Text style={styles.foodExpiry}>Expires May 12</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={width * 0.05} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.getStartedButton}>
        <Text style={styles.getStartedText}>Get started</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    padding: width * 0.05,
  },
  scannerContainer: {
    marginBottom: height * 0.02,
  },
  heading: {
    fontSize: width * 0.045,
    fontWeight: '600',
    textAlign: 'center',
    color: '#27391C',
    marginBottom: height * 0.03,
    width: '90%',
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: height * 0.02,
    borderRadius: width * 0.03,
    width: '90%',
    marginBottom: height * 0.03,
  },
  foodImage: {
    width: width * 0.1,
    height: width * 0.1,
    marginRight: width * 0.03,
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  foodExpiry: {
    fontSize: width * 0.035,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#27391C',
    borderRadius: width * 0.02,
    padding: width * 0.03,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: height * 0.03,
  },
  dot: {
    width: width * 0.02,
    height: width * 0.02,
    backgroundColor: '#ccc',
    borderRadius: width * 0.01,
    marginHorizontal: width * 0.01,
  },
  activeDot: {
    backgroundColor: '#27391C',
  },
  getStartedButton: {
    backgroundColor: '#27391C',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.3,
    borderRadius: width * 0.03,
    marginBottom: height * 0.02,
  },
  getStartedText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  skipText: {
    fontSize: width * 0.035,
    color: '#666',
  },
});
