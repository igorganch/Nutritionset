import { Image, StyleSheet, Platform, Text, View } from 'react-native';


export default function WelcomeScreen() {
  return (
  <View style={styles.container}>
    <Image source={require('../assets/images/logo.jpg')} style={styles.logo} />
    <Text style={styles.text}>Welcome to Food Guard!</Text>
  </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#C3F2FD'

    },
    logo: {
        width: 150,
        height: 150, 
        marginBottom: 20
    },
    text: {
        fontSize: 35, 
        fontWeight: 'bold'
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
