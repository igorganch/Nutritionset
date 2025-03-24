import { Image, StyleSheet, Platform, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function RecipeScreen() {
  return (
    <SafeAreaView style={styles.recipePage}>
      <View style={styles.upperPage}>
        <View style={styles.header}>
          <Text style={styles.dashboardText}>RECIPES</Text>
          <Text style={styles.welcomeText}></Text>
        </View>
        <Image source={require('../../assets/images/recipe.png')} style={styles.image} />
      </View>

      <View style={styles.lowerPage}>
        <ScrollView contentContainerStyle={styles.recipeList}>
          {[...Array(4)].map((_, index) => (
            <TouchableOpacity key={index} style={styles.Item}>
              <View style={styles.uppersectionitem}>
                <Text style={styles.recipeName}>Chicken Pasta</Text>
                <View style={styles.recipetime}>
                  <FontAwesome name="clock-o" size={15} color="#333" />
                  <Text style={styles.recipeTimeText}>45min</Text>
                </View>
              </View>
              <View style={styles.lowerSection}>
                <Text style={styles.recipeIngredients} numberOfLines={2} ellipsizeMode="tail">
                  Ingredients: Apples, spinach, tomatoes, olive oil, garlic, salt, pepper
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.refreshbutton}>
            <Text style={styles.refreshText}>Refresh</Text>
            <FontAwesome name="refresh" size={15} color="#333" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  recipePage: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light gray background for the entire screen
  },
  upperPage: {
    backgroundColor: 'black',
    height: screenHeight * 0.4,
    width: screenWidth,
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenHeight * 0.05,
    alignItems: 'center', // Center content
  },
  lowerPage: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Match the SafeAreaView background
    paddingHorizontal: screenWidth * 0.05,
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  dashboardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#333',
  },
  image: {
    width: screenWidth * 0.6, 
    height: screenWidth * 0.6, 
    resizeMode: 'cover',
    borderRadius: screenWidth * 0.3, 
    position: 'absolute',
    top: screenHeight * 0.25 - (screenWidth * 0.3), // Center vertically in upperPage
    left: screenWidth * 0.2, // Center horizontally
  },
  recipeList: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  Item: {
    width: screenWidth * 0.9,
    borderRadius: 18,
    backgroundColor: '#fff', 
    height: screenHeight * 0.12, 
    padding: screenWidth * 0.05,
    marginBottom: 15, // Space between items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  uppersectionitem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 16, 
    fontWeight: '700',
    color: '#333',
  },
  recipetime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screenWidth * 0.15,
  },
  recipeTimeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 5,
  },
  lowerSection: {
    marginTop: 5,
  },
  recipeIngredients: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  refreshbutton: {
    height: screenHeight * 0.04,
    width: screenWidth * 0.35,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 18,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },
  refreshText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});