import { Image, StyleSheet, Platform, TouchableOpacity,SafeAreaView,Dimensions , ScrollView} from 'react-native';
import {Text, View, } from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export default function RecipeScreen() {
  return (

    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Recipe</Text>
  </View>

  );
}


