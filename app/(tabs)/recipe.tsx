import { Image, StyleSheet, Platform, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const router = useRouter();

export default function RecipeScreen() {
  const [userData, setUserData] = useState<{ token: string; userId: number; points: number; rank: { max_points: number; rank_badge: string; rank_name: string } } | null>(null);
  const [refreshtrigger, setRefreshtrigger] = useState(false);
  const ip = "10.0.0.83";
  const [recipes, setRecipes] = useState([]);
  const [recipeinfotoggle, setrecipeinfotoggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Load authData from AsyncStorage and set userData
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAuthData = await AsyncStorage.getItem('authData');
        if (storedAuthData) {
          const parsedAuthData = JSON.parse(storedAuthData);
          setUserData(parsedAuthData);
          console.log('Loaded authData:', parsedAuthData);
          console.log('Points:', parsedAuthData.points); // Log the user's points
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load data');
      }
    };
    loadData();
  }, [router]);

  // Fetch recipes when userData is available or refreshtrigger changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return; // Wait until userData is loaded
      try {
        setLoading(true);
        setRecipes([]);
        const response = await axios.get(`http://${ip}:8080/api/recipes/fromuser?userId=${userData.userId}`, {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });
        setRecipes(response.data);
        setLoading(false);
        console.log("Recipes:", response.data);
      } catch (error) {
        console.log("Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [userData, refreshtrigger]);

  // Generate recipe from GPT
  async function generateRecipeFromGpt() {
    if (!userData) {
      Alert.alert('Error', 'Please log in first');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://${ip}:8080/api/gpt/recipes?userId=${userData.userId}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });
      setLoading(false);
      setRefreshtrigger(prev => !prev); // Toggle to trigger fetchData
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  function returnBack() {
    setrecipeinfotoggle(false);
  }

  function toggleRecipe(recipe_item: any) {
    setrecipeinfotoggle(true);
    setRecipe(recipe_item);
    console.log("Recipe item:", recipe_item);
  }

  const openCamera = () => setShowCamera(true);
  const closeCamera = () => setShowCamera(false);
  const toggleCameraType = () => setFacing(facing === 'back' ? 'front' : 'back');

  const takePicture = async () => {
    if (!userData) {
      Alert.alert('Error', 'Please log in first');
      return;
    }
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCapturedImage(photo.uri);
          setShowCamera(false);
          setModalVisible(true);
          setSelectedProduct(null);
  
          const formData = new FormData();
          formData.append('picture', { uri: photo.uri, type: 'image/jpeg', name: 'receipt.jpg' } as any);
          setLoading(true);
          
          // Upload the picture for verification
          const response = await fetch(`http://${ip}:8080/api/gpt/upload/recipe/verification?userId=${userData.userId}&recipeId=${recipe.recipe.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${userData.token}` },
            body: formData,
          });
          const result = await response.json();
          console.log("Verification result:", result.verification);
          setLoading(false);
  
          // If verification is successful, update points
          if (response.ok) {
            // Calculate new points
            const currentPoints = userData.points || 0; // Default to 0 if undefined
            const newPoints = currentPoints + recipe.recipe.points;
            
            // Update authData in AsyncStorage
            const updatedAuthData = { ...userData, points: newPoints };
            await AsyncStorage.setItem('authData', JSON.stringify(updatedAuthData));
            
            // Update userData state to reflect new points in UI
            setUserData(updatedAuthData);
            
            console.log('Updated points:', newPoints); // Log the new total points
            Alert.alert('Success', `You just earned ${recipe.recipe.points} points! New total: ${newPoints}`);
          } else {
            Alert.alert('Error', 'Verification failed. Points not updated.');
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.recipePage}>
      <Modal animationType="slide" transparent={false} visible={showCamera} onRequestClose={closeCamera}>
        <CameraView style={styles.fullScreenCamera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <FontAwesome name="close" size={35} onPress={closeCamera} color="#fff" />
            <FontAwesome name="refresh" size={35} onPress={toggleCameraType} color="#fff" />
            <FontAwesome name="camera" size={35} onPress={takePicture} color={loading ? 'grey' : '#fff'} />
          </View>
        </CameraView>
      </Modal>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <View style={styles.upperPage}>
        <View style={styles.header}>
          {recipeinfotoggle ? (
            <View style={styles.headerReturnbtn}>
              <TouchableOpacity onPress={returnBack}>
                <View>
                  <FontAwesome style={styles.visible} name="angle-left" size={40} />
                </View>
              </TouchableOpacity>
              <Text style={styles.dashboardText}>RECIPES DESC</Text>
            </View>
          ) : (
            <View style={styles.headerReturnbtn}>
              <Text style={styles.dashboardText}>RECIPES</Text>
            </View>
          )}
          <Text style={styles.welcomeText}></Text>
        </View>
        <Image source={require('../../assets/images/recipe.png')} style={styles.image} />
      </View>

      <View style={styles.lowerPage}>
        {recipeinfotoggle ? (
          <TouchableOpacity onPress={openCamera} style={styles.refreshbutton}>
            <Text style={styles.upload}>+{recipe.recipe.points} points</Text>
            <FontAwesome name="camera" size={15} color="#333" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={generateRecipeFromGpt} style={styles.refreshbutton}>
            <Text style={styles.refreshText}>Generate</Text>
            <FontAwesome name="refresh" size={15} color="#333" />
          </TouchableOpacity>
        )}

        {recipeinfotoggle ? (
          <ScrollView style={styles.recipeDescription}>
            <Text style={styles.RecipeTitle}>{recipe.recipe.recipe_name}</Text>
            <Text style={styles.IngredientsTitle}>Ingredients</Text>
            {recipe.recipe.ingredients.map((item: any, index: number) => (
              <View key={index} style={styles.ingredientitemweight}>
                <Text style={styles.ingredientitemweighttext}>{item.food_name}</Text>
                <Text style={styles.ingredientitemweighttext}>{item.quantity}</Text>
              </View>
            ))}
            <Text style={styles.IngredientsTitle}>Steps</Text>
            {recipe.recipe.steps.map((item: any, index: number) => (
              <View key={index} style={styles.ingredientitemweight}>
                <Text style={styles.stepsrecipes}>Step {item.step_number} - {item.step_instruction}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.recipeList}>
            {Array.isArray(recipes) && recipes.length > 0 && recipes.map((recipe: any, index: number) => {
              const ingredientNames = Array.isArray(recipe.ingredients)
                ? recipe.ingredients.map((ingredient: any) => `${ingredient.quantity || '?'} ${ingredient.food_name || 'Unknown'}`).join(', ')
                : 'No ingredients';
              const isCompleted = recipe.completed === true;

              return (
                <TouchableOpacity onPress={() => toggleRecipe({ recipe })} key={index} style={styles.Item}>
                  <View style={styles.uppersectionitem}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.recipeName}>
                      {recipe.recipe_name || 'Untitled'}
                    </Text>
                    <View style={styles.recipetime}>
                      <FontAwesome name="clock-o" size={15} color="#333" />
                      <Text style={styles.recipeTimeText}>{recipe.time || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.middlesection}>
                    <Text style={styles.recipeIngredients} numberOfLines={2} ellipsizeMode="tail">
                      Ingredients: {ingredientNames}
                    </Text>
                  </View>
                  <View style={styles.lowerSection}>
                    <Text
                      style={[styles.recipeIngredients, isCompleted ? styles.completed : styles.uncompleted]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      Points: {isCompleted ? '0' : `+${recipe.points || 0}`}
                    </Text>
                    <Text
                      style={[styles.recipeIngredients, isCompleted ? styles.completed : styles.uncompleted]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {isCompleted ? 'Recipe Challenge Completed' : 'Uncompleted'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
    alignItems: 'center',
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
    paddingLeft: screenWidth * 0.02,
    marginBottom: 15, // Space between items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: 'space-evenly',
  },
  uppersectionitem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth * 0.85,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    width: screenWidth * 0.6,
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
  middlesection: {
    marginTop: 5,
  },
  lowerSection: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: screenWidth * 0.85,
  },
  recipeIngredients: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  refreshbutton: {
    height: screenHeight * 0.04,
    width: screenWidth * 0.35,
    borderWidth: 1,
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
  upload: {
    fontSize: 15,
    fontWeight: '500',
    color: 'green',
  },
  uncompleted: {
    color: 'green',
  },
  completed: {
    color: 'red',
  },
  headerReturnbtn: {
    width: screenWidth,
    flexDirection: 'row',
    columnGap: screenWidth * 0.05,
    alignItems: 'center',
    paddingLeft: screenWidth * 0.02,
  },
  visible: {
    opacity: 1,
    color: 'white',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  recipeDescription: {
    height: screenHeight * 0.5,
    width: screenWidth,
    paddingLeft: screenWidth * 0.04,
    rowGap: screenHeight * 0.3,
  },
  RecipeTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: '800',
  },
  IngredientsTitle: {
    fontSize: 30,
    color: 'black',
    fontWeight: '700',
    height: screenHeight * 0.1,
  },
  ingredientitemweight: {
    width: screenWidth,
    paddingLeft: screenWidth * 0.04,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    columnGap: screenWidth * 0.3,
  },
  ingredientitemweighttext: {
    fontSize: 20,
    width: screenWidth * 0.3,
  },
  stepsrecipes: {
    fontSize: 20,
    width: screenWidth * 0.9,
    fontWeight: '400',
    height: screenHeight * 0.13,
  },
  fullScreenCamera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});