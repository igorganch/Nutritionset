import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, Animated, Dimensions, Modal, TextInput, Button, Image, Alert, Platform } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TabTwoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const [apiLoading, setApiLoading] = useState(false);
  const router = useRouter();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(300); // Default max

  const ip = "10.0.0.83";
  interface Product {
    id: string;
    name: string;
    goodUntil: string;
    user?: string;
    isSelected?: boolean;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editGoodUntil, setEditGoodUntil] = useState('');
  const [totalProductsModalVisible, setTotalProductsModalVisible] = useState(false);
  const [expiringProductsModalVisible, setExpiringProductsModalVisible] = useState(false);
  const [authData, setAuthData] = useState<{ token: string; userId: string; fullname: string } | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAuthData = await AsyncStorage.getItem('authData');
        if (storedAuthData) {
          const parsedAuthData = JSON.parse(storedAuthData);
          setAuthData(parsedAuthData);
          setCurrentPoints(parsedAuthData.points || 0); 
          setMaxPoints(parsedAuthData.rank?.max_points || 300); 
          console.log('Loaded authData:', parsedAuthData); 
          console.log('rank name: ', parsedAuthData.rank?.rank_name);
          console.log('rank badge: ', parsedAuthData.rank?.rank_badge);
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

  const totalProducts = products.length;

  const productsExpiringSoon = products.filter(product => {
    const productDate = new Date(product.goodUntil);
    productDate.setHours(0, 0, 0, 0);
    const timeDiff = productDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return dayDiff >= 0 && dayDiff <= 2;
  });

  const slideAnim = useRef(new Animated.Value(screenHeight + screenHeight * 0.05)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showDeleteButton ? screenHeight * 0.1 : screenHeight + screenHeight * 0.1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showDeleteButton]);

  useEffect(() => {
    if (totalProductsModalVisible) console.log('Total Products Modal opened. Products:', products);
    if (expiringProductsModalVisible) console.log('Expiring Products Modal opened. Expiring Products:', productsExpiringSoon);
  }, [totalProductsModalVisible, expiringProductsModalVisible, products, productsExpiringSoon]);

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Error', 'Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
    setExpoPushToken(token);
    return token;
  };

  const sendPushNotification = async (title: string, body: string) => {
    if (!expoPushToken) {
      console.log('No push token available');
      return;
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  const fetchProducts = useCallback(async () => {
    if (!authData) {
    //    Alert.alert('Error', 'Please log in first');
      return;
    }

    try {
      const response = await axios.get(`http://${ip}:8080/api/products/?userId=${authData.userId}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const data = response.data;

      if (response.status === 200) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const productDate = new Date(item.expiry_date);
          productDate.setHours(0, 0, 0, 0);
          return {
            id: String(item.id),
            name: item.food_name,
            goodUntil: `${productDate.getFullYear()}-${(productDate.getMonth() + 1).toString().padStart(2, '0')}-${productDate.getDate().toString().padStart(2, '0')}`,
            isSelected: false,
          };
        });
        setProducts(mappedProducts);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiringProducts = mappedProducts.filter(product => {
          const expiryDate = new Date(product.goodUntil);
          expiryDate.setHours(0, 0, 0, 0);
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 2;
        });

        if (expiringProducts.length > 0) {
          const productNames = expiringProducts.map(p => p.name).join(', ');
          await sendPushNotification(
            'Products Expiring Soon!',
            `The following products are expiring within 2 days: ${productNames}`
          );
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch products.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      Alert.alert('Error', 'An error occurred while fetching products.');
    }
  }, [authData, expoPushToken]);

  useEffect(() => {
    registerForPushNotificationsAsync();
    notificationListener.current = Notifications.addNotificationReceivedListener(setNotification);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => console.log('Notification response:', response));
    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useFocusEffect(useCallback(() => fetchProducts(), [fetchProducts]));

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>We need your permission to take a picture</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  async function deleteProduct() {
    if (!authData) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    const productToDelete = products.filter(product => product.isSelected);
    if (productToDelete.length === 0) {
      Alert.alert('No Selection', 'Please select at least one product to delete.');
      return;
    }

    try {
      setApiLoading(true);
      const deleteRequests = productToDelete.map(product =>
        axios.delete(`http://${ip}:8080/api/product/delete?userId=${authData.userId}&productId=${product.id}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        })
      );
      await Promise.all(deleteRequests);
      setProducts(products.filter(product => !product.isSelected));
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete products');
    } finally {
      setShowDeleteButton(false);
      setApiLoading(false);
    }
  }

  const toggleCheckbox = (id: string) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, isSelected: !product.isSelected } : product
    ));
  };

  const handleDeleteProductButton = () => setShowDeleteButton(!showDeleteButton);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setEditName(product.name);
    setEditGoodUntil(product.goodUntil);
    setModalVisible(true);
    setShowDeleteButton(false);
  };

  const saveChanges = async () => {
    if (!authData) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    try {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(editGoodUntil)) {
        Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
        return;
      }

      const testDate = new Date(editGoodUntil);
      if (isNaN(testDate.getTime())) {
        Alert.alert('Error', 'Invalid date');
        return;
      }

      if (selectedProduct) {
        const response = await fetch(`http://${ip}:8080/api/product/edit?productId=${selectedProduct.id}&userId=${authData.userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            food_name: editName,
            expiry_date: editGoodUntil,
          }),
        });

        if (response.ok) {
          setProducts(products.map(product =>
            product.id === selectedProduct.id
              ? { ...product, name: editName, goodUntil: editGoodUntil }
              : product
          ));
          Alert.alert('Success', 'Product updated successfully!');
          fetchProducts();
        } else {
          const result = await response.text();
          Alert.alert('Error', result || 'Failed to update product.');
        }
      } else {
        const response = await fetch(`http://${ip}:8080/api/product/create?userId=${authData.userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            food_name: editName,
            expiry_date: editGoodUntil,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setProducts([
            ...products,
            {
              id: String(result[result.length - 1].id),
              name: editName,
              goodUntil: editGoodUntil,
              isSelected: false,
            },
          ]);
          Alert.alert('Success', 'Product added successfully!');
          fetchProducts();
        } else {
          Alert.alert('Error', result.message || 'Failed to add product.');
        }
      }
      setModalVisible(false);
      setSelectedProduct(null);
      setCapturedImage(null);
    } catch (err) {
      console.error('Error saving product:', err);
      Alert.alert('Error', 'An error occurred while saving the product.');
    }
  };

  const openCamera = () => setShowCamera(true);
  const closeCamera = () => setShowCamera(false);
  const toggleCameraType = () => setFacing(facing === 'back' ? 'front' : 'back');

  const takePicture = async () => {
    if (!authData) {
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

          const response = await fetch(`http://${ip}:8080/api/gpt/upload/picture?userId=${authData.userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authData.token}` },
            body: formData,
          });

          if (response.ok) fetchProducts();
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const productDate = new Date(item.goodUntil);
    productDate.setHours(0, 0, 0, 0);
    const formattedDate = `${productDate.getFullYear()}-${(productDate.getMonth() + 1).toString().padStart(2, '0')}-${productDate.getDate().toString().padStart(2, '0')}`;
    const timeDiff = productDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const expiryStyle = productDate < today ? styles.expired : dayDiff <= 2 ? styles.closeToExpiry : styles.farToExpiry;

    return (
      <TouchableOpacity onPress={() => openModal(item)} style={styles.item} key={item.id}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.productName, expiryStyle]}>{item.name}</Text>
        <View style={styles.checkboxExpiryDate}>
          <Text style={styles.productName}>{formattedDate}</Text>
          {showDeleteButton && (
            <TouchableOpacity onPress={() => toggleCheckbox(item.id)} style={styles.checkbox}>
              {item.isSelected && <FontAwesome name="check" size={12} color="#333" />}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderModalItem = ({ item }: { item: Product }) => {
    const productDate = new Date(item.goodUntil);
    productDate.setHours(0, 0, 0, 0);
    const timeDiff = productDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const expiryStyle = productDate < today ? styles.expired : dayDiff <= 2 ? styles.closeToExpiry : styles.farToExpiry;

    return (
      <View style={styles.modalItem}>
        <Text style={[styles.productName, expiryStyle]}>{item.name}</Text>
        <Text style={styles.productName}>{item.goodUntil}</Text>
      </View>
    );
  };

  // Progress Bar Logic
  const progress = maxPoints > 0 ? Math.min((currentPoints / maxPoints) * 100, 100) : 0;
  const barWidth = progress + '%';

  return (
    <SafeAreaView style={styles.dashBoardPage}>
      <View style={styles.header}>
        <Text style={styles.dashboardText}>DASHBOARD</Text>
        <Text style={styles.welcomeText}>Welcome Back {authData?.fullname ?? 'User'}</Text>
      </View>

      {/* Progress Bar */}
      <View style={{ width: screenWidth * 0.9 }}>
       
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: barWidth }]} />
          <Text style={styles.progressText}>{`${currentPoints} / ${maxPoints} Points`}</Text>
        </View>
      </View>

      <Animated.View style={[styles.motiView, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={deleteProduct} style={styles.deleteButtonBottom} disabled={apiLoading}>
          <Text style={styles.deleteButtonBottomText}>{apiLoading ? 'Deleting...' : 'Delete Products'}</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.boxContainer}>
        <TouchableOpacity style={[styles.boxButton, styles.totalProducts]} onPress={() => router.push('/productlist')}>
          <Text style={styles.boxButtonTitle}>TOTAL PRODUCTS</Text>
          <Text style={styles.boxButtonCount}>{totalProducts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boxButton, styles.expiringProducts]} onPress={() => setExpiringProductsModalVisible(true)}>
          <Text style={styles.boxButtonTitle}>PRODUCTS EXPIRING</Text>
          <Text style={styles.boxButtonCount}>{productsExpiringSoon.length}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addProduct} onPress={openCamera} disabled={apiLoading}>
        <FontAwesome name="camera" size={25} />
        <Text style={styles.addProductTextButton}>{apiLoading ? 'Processing...' : 'Add Product'}</Text>
      </TouchableOpacity>

      <View style={styles.uppersection}>
        <TouchableOpacity onPress={handleDeleteProductButton} disabled={apiLoading}>
          <Text style={[styles.deleteProductText, apiLoading && { color: 'grey' }]}>Delete product</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/foodbank')} style={styles.foodbankbutton}>
          <Text style={styles.addProductText}>Food Bank Near</Text>
          <FontAwesome name="camera" size={15} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableheaderProducts}>PRODUCTS</Text>
            <View style={styles.checkboxExpiryDate}>
              <Text style={styles.tableheaderGoodUntil}>GOOD UNTIL</Text>
            </View>
          </View>
          <FlatList data={products} renderItem={renderItem} keyExtractor={item => item.id} style={styles.ItemsList} />
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={totalProductsModalVisible} onRequestClose={() => setTotalProductsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Total Products</Text>
            <View style={styles.modalTable}>
              <View style={styles.modalTableHeader}>
                <Text style={styles.tableheaderProducts}>PRODUCTS</Text>
                <Text style={styles.tableheaderGoodUntil}>GOOD UNTIL</Text>
              </View>
              {products.length === 0 ? (
                <Text style={styles.emptyText}>No products available.</Text>
              ) : (
                <FlatList data={products} renderItem={renderModalItem} keyExtractor={item => item.id} style={styles.modalItemsList} />
              )}
            </View>
            <Button title="Close" onPress={() => setTotalProductsModalVisible(false)} color="#ef4444" />
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={expiringProductsModalVisible} onRequestClose={() => setExpiringProductsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Products Expiring Soon (within 2 days)</Text>
            <View style={styles.modalTable}>
              <View style={styles.modalTableHeader}>
                <Text style={styles.tableheaderProducts}>PRODUCTS</Text>
                <Text style={styles.tableheaderGoodUntil}>GOOD UNTIL</Text>
              </View>
              {productsExpiringSoon.length === 0 ? (
                <Text style={styles.emptyText}>No products expiring within 2 days.</Text>
              ) : (
                <FlatList data={productsExpiringSoon} renderItem={renderModalItem} keyExtractor={item => item.id} style={styles.modalItemsList} />
              )}
            </View>
            <Button title="Close" onPress={() => setExpiringProductsModalVisible(false)} color="#ef4444" />
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Product Name" />
            <TextInput style={styles.input} value={editGoodUntil} onChangeText={setEditGoodUntil} placeholder="Good Until (YYYY-MM-DD)" />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#ef4444" />
              <Button title="Save" onPress={saveChanges} color="#2C4815" disabled={apiLoading} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={false} visible={showCamera} onRequestClose={closeCamera}>
        <CameraView style={styles.fullScreenCamera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <FontAwesome name="close" size={35} onPress={closeCamera} color="#fff" />
            <FontAwesome name="refresh" size={35} onPress={toggleCameraType} color="#fff" />
            <FontAwesome name="camera" size={35} onPress={takePicture} color={apiLoading ? 'grey' : '#fff'} />
          </View>
        </CameraView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dashBoardPage: {
    width: screenWidth,
    height: screenHeight,
    flex: 1,
    backgroundColor: "ef4444",
    paddingTop: screenHeight * 0.10,
    rowGap: screenHeight * 0.02,
    marginHorizontal: 0.05 * screenWidth,
  },
  header: {},
  dashboardText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#333',
  },
  progressContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2C4815',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 20,
    color: '#fff',
    fontSize: 12,
  },
  boxContainer: {
    width: (screenWidth * 0.9),
    height: screenHeight * 0.18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    columnGap: screenWidth * 0.05,
  },
  boxButton: {
    width: screenHeight * 0.2,
    height: screenHeight * 0.16,
    borderWidth: 1,
    borderRadius: 18,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: screenHeight * 0.01,
    rowGap: screenHeight * 0.01,
  },
  totalProducts: {
    backgroundColor: "rgba(44,72,21,255)"
  },
  expiringProducts: {
    backgroundColor: "rgba(39,57,28,255)"
  },
  boxButtonTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: "center",
    width: screenHeight * 0.17,
  },
  boxButtonCount: {
    color: "white",
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: "center",
    width: screenHeight * 0.17,
  },
  addProduct: {
    borderRadius: 12,
    borderWidth: 3,
    width: screenWidth * 0.9,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    height: screenHeight * 0.06,
    paddingLeft: screenWidth * 0.05,
    paddingRight: screenWidth * 0.05,
    columnGap: screenWidth * 0.15,
    borderColor: "rgba(39,57,28,255)"
  },
  addProductText: {
    width: "auto",
    justifyContent: "flex-start",
  },
  deleteProductText: {
    width: "auto",
    justifyContent: "flex-start",
    color: "red"
  },
  addProductTextButton: {
    width: "auto",
    justifyContent: "flex-start",
    fontSize: 24,
    fontWeight: "600"
  },
  card: {
    flex: 1,
    alignItems: "flex-start",
    paddingTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: screenWidth * 0.9,
    borderColor: "rgba(211, 211, 211, 1)",
    paddingHorizontal: screenWidth * 0.05
  },
  uppersection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: screenWidth * 0.9,
    height: screenHeight * 0.05,
  },
  table: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: screenWidth * 0.75,
    height: screenHeight * 0.05,
    flex: 1
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: screenWidth * 0.75,
    height: screenHeight * 0.06,
  },
  tableheaderProducts: {
    fontSize: 20,
    fontWeight: "500",
    alignItems: "center",
  },
  tableheaderGoodUntil: {
    fontSize: 21,
    fontWeight: "200",
    alignItems: "center",
    width: screenWidth * 0.35,
  },
  item: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    height: screenHeight * 0.05,
    width: screenWidth * 0.75,
    justifyContent: "space-between",
    alignItems: "center"
  },
  productName: {
    fontSize: 17,
    fontWeight: "500",
    alignItems: "center",
    width: screenWidth * 0.3
  },
  expired: {
    color: "red"
  },
  closeToExpiry: {
    color: "orange"
  },
  farToExpiry: {
    color: "green"
  },
  checkbox: {
    borderRadius: 5,
    borderWidth: 1,
    height: screenHeight * 0.03,
    width: screenHeight * 0.03,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxExpiryDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: screenWidth * 0.35,
    borderRadius: 12,
  },
  foodbankbutton: {
    borderRadius: 18,
    borderWidth: 3,
    width: screenWidth * 0.4,
    flexDirection: "row",
    height: screenHeight * 0.05,
    justifyContent: "center",
    alignItems: "center",
    columnGap: screenWidth * 0.03
  },
  ItemsList: {
    width: screenWidth * 0.8,
  },
  deleteButtonBottom: {
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    height: screenHeight * 0.1,
    borderRadius: 13,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    left: -0.05 * screenWidth
  },
  motiView: {
    width: screenWidth,
    height: screenHeight * 0.05,
    position: "absolute",
    zIndex: 1
  },
  deleteButtonBottomText: {
    fontSize: 17,
    fontWeight: "300",
    color: "white"
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1,
    zIndex: 999
  },
  modalContent: {
    width: screenWidth * 0.9,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    maxHeight: screenHeight * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalTable: {
    width: '100%',
    flex: 1,
  },
  modalTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: screenHeight * 0.06,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: screenHeight * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingHorizontal: 5,
  },
  modalItemsList: {
    width: '100%',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});