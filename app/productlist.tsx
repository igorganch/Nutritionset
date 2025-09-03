import { Image, StyleSheet, Platform, SafeAreaView,Dimensions,ScrollView, Alert, Modal  } from 'react-native';

import { CameraView, CameraType, useCameraPermissions} from 'expo-camera'
import {Text, View, Button, TextInput, TouchableOpacity, Keyboard, ActivityIndicator  } from 'react-native'
import {useState, useEffect, useRef } from 'react'
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { MotiView } from 'moti';

import axios from 'axios';
import React  from 'react'
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function ProductList() {
  interface Product {
    id: string;
    name: string;
    goodUntil: string;
    user?: string;
    isSelected?: boolean;
  }
    const [token,setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0Mjc5NTcxOH0.BW45f_IbywD1f_ss9L78v4sG1CeQattLJ2bA_JvUOKM")
    const userId = 1;
    const [loading, setLoading] = useState(false); 
    const [apiLoading, setApiLoading] = useState(false); 
    const [products, setProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState('');
    const [showDeleteButton, setshowDeleteButton] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editName, setEditName] = useState('');
    const [editGoodUntil, setEditGoodUntil] = useState('');
  const ip = "10.0.0.83"
  const router = useRouter();
    const saveChanges = async () => {
        try {
          const userId = '1'; // Hardcode userId for testing
          console.log("selectedProduct.id + " + selectedProduct?.id )
          console.log("selectedProduct.name - " + selectedProduct?.goodUntil)
    
          if (selectedProduct) {
           
            const response = await fetch(`http://${ip}:8080/api/product/edit?productId=${selectedProduct.id}&userId=${userId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                'food_name': editName,
                'expiry_date': editGoodUntil,
              }),
            });
            
            const result = await response.text();
            console.log('Response Text:', result);
            if (response.ok) {
              setProducts(products.map(product =>
                product.id === selectedProduct.id
                  ? { ...product, name: editName, goodUntil: editGoodUntil }
                  : product
              ));
              Alert.alert('Success', 'Product updated successfully!');
              fetchData();
            } else {
              Alert.alert('Error', result.message || 'Failed to update product.');
            }
          } else {
            const [month, day, year] = editGoodUntil.split('/');
            const formattedExpiration = `20${year}/${month}/${day}`;
            const response = await fetch(`http://${ip}:8080/api/product/create?userId=${userId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                food_name: editName,
                expiry_date: formattedExpiration,
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
              fetchData();
            } else {
              Alert.alert('Error', result.message || 'Failed to add product.');
            }
          }
          setModalVisible(false);
          setSelectedProduct(null);
        } catch (err) {
          console.error('Error saving product:', err);
          Alert.alert('Error', 'An error occurred while saving the product.');
        }
      };
    const openModal = (product: Product) => {
      setSelectedProduct(product);
      setEditName(product.name);
      setEditGoodUntil(product.goodUntil);
      setModalVisible(true);
      setshowDeleteButton(false)
    };
    const today = new Date();
    const fromValue = showDeleteButton
  ? { translateY: screenHeight + screenHeight * 0.05, opacity: 0 }
  : { translateY: 0, opacity: 0 };

const animateValue = showDeleteButton
  ? { translateY: screenHeight, opacity: 1 }
  : { translateY: screenHeight + screenHeight * 0.05, opacity: 0 };

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://${ip}:8080/api/products/?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProducts(response.data);
      setProducts(
        response.data.map((item: any) => {      
          const goodUntil = item.expiry_date.split('T')[0];  
          console.log("goodUntil - " + goodUntil)
          return {
            id: String(item.id),
            name: item.food_name,
            goodUntil: `${goodUntil }`,
            isSelected: false,
          };
        })
      );
      setLoading(true);
    } catch (error) {
      console.log("Error:", error);
    }
  };
    
    useEffect(()=>{
        
        fetchData();
    },[])

    function handleDeleteProductButton(){
        console.log("In here");
        setshowDeleteButton(!showDeleteButton);
    }
      
   
    async function deleteProduct(){
        const productToDelete = products.filter(product => product.isSelected);
        try {
            const deleteRequests = productToDelete.map( product => 
                  axios.delete(`http://${ip}:8080/api/product/delete?userId=${userId}&productId=${product.id}`, {
                    headers: {
                    Authorization: `Bearer ${token}`
                    }
                })
            );
            deleteRequests.length > 0 ?  setApiLoading(true) : setApiLoading(false)
            const responses = await  Promise.all(deleteRequests);
            const updatedProducts = products.filter(product => !product.isSelected);
            setProducts(updatedProducts);
           
        
        }
        catch(error){
            console.log(error)
        }
        setshowDeleteButton(false);
        setApiLoading(false);
    }
    const toggleCheckbox = (id: string) => {
        setProducts(products.map(product =>
          product.id === id ? { ...product, isSelected: !product.isSelected } : product
        ));
      };
    if (loading){
    return (

        <SafeAreaView  style={styles.productListPage}>
            {apiLoading &&               <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>}

            <View style={styles.header}>
                <View  style={styles.headerReturnbtn}>
                    <FontAwesome onPress={() => router.back()} name="angle-left" size={30} />
                    <Text style={styles.dashboardText}>PRODUCT LIST</Text>
                </View>
                <Text style={styles.welcomeText}></Text>
            </View>

            <TouchableOpacity style={styles.addProduct}>
                <FontAwesome name="camera" size={15} />
                <Text  >Add Product</Text>
            </TouchableOpacity>
            <View style = {styles.containerSearchBar}>
                <TextInput value={searchText} onChangeText={text => setSearchText(text)}style={styles.searchBar} placeholder="Search..."  />
                <View style={styles.searchbaricon}>
                    <FontAwesome name="search" />
                </View>
               
            </View>
            <View style={styles.card}>
              
                <View style ={styles.uppersection}>
                   <TouchableOpacity onPress={handleDeleteProductButton}><Text style={styles.addProductText}>Delete product</Text></TouchableOpacity>
                </View>
                <View style ={styles.table}>
                   <View style ={styles.tableHeader} >
                    <Text style={styles.tableheaderProducts}>PRODUCTS</Text>
                    <Text style={styles.tableheaderGoodUntil} >GOOD UNTIL</Text>
                   </View> 
                     <ScrollView style = {styles.ItemsList}>

                     {products.filter(product =>
                        product.name.toLowerCase().includes(searchText.toLowerCase())
                            ).map((product) => {
                              const productdate = new Date(product.goodUntil);
                              const formattedDate   = `${productdate.getFullYear()}-${(productdate.getMonth()+1).toString().padStart(2, '0')}-${productdate.getDate().toString().padStart(2, '0')}`;
                              const timeDiff = productdate.getTime() - today.getTime();
                              const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                              var expiryStyle = null;
                              if(productdate < today){
                                  expiryStyle = styles.expired;
                                 
                              }else if (dayDiff  <= 2 ){
                                  expiryStyle = styles.closeToExpiry;
        
                              }
                              else {
                                  expiryStyle = styles.farToExpiry;
                              }
                            if(productdate < today){
                                expiryStyle = styles.expired;
                            }else if (dayDiff  <= 2 ){
                                expiryStyle = styles.closeToExpiry;
                            }
                            else {
                                expiryStyle = styles.farToExpiry;
                            }
                            return (
                            <TouchableOpacity onPress={() => openModal(product)}  style={styles.item} key={product.id}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.productName, expiryStyle]}>{product.name}</Text>
                                <View  style={styles.checkboxExpiryDate}>
                                <Text style={styles.productName}>{formattedDate}</Text>
                                {showDeleteButton &&                            <TouchableOpacity onPress={() => toggleCheckbox(product.id)} style={styles.checkbox}>
                                         {product.isSelected && <FontAwesome name="check" size={12} color="#333" />}
                                </TouchableOpacity>}
      
                                </View>
                            </TouchableOpacity>
                            );
                        })}
                 </ScrollView>
                   
                </View>
                
                
            </View>

        
            <View
  style={styles.motiView}
>
  <TouchableOpacity onPress={deleteProduct} style={styles.deleteButtonBottom}>
    <Text style={styles.deleteButtonBottomText}>Delete Products</Text>
  </TouchableOpacity>
</View>
      {/* Existing Edit Product Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Product</Text>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Product Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editGoodUntil}
                    onChangeText={setEditGoodUntil}
                    placeholder="Good Until (MM/DD/YY)"
                  />
                  <View style={styles.modalButtons}>
                    <Button title="Cancel" onPress={() => setModalVisible(false)} color="#ef4444" />
                    <Button title="Save" onPress={saveChanges} color="#2C4815" />
                  </View>
                </View>
              </View>
            </Modal>
          
        </SafeAreaView >
    );
    }
}

const styles = StyleSheet.create({
    productListPage :{
        width : screenWidth,
        height : screenHeight,
        flex : 1,
        backgroundColor : "ef4444",
        paddingTop: screenHeight * 0.10,
        rowGap : screenHeight * 0.02,
        marginHorizontal : 0.05 * screenWidth,
    },
 
    header: {
        
      },
    dashboardText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    welcomeText: {
        paddingLeft: 20,
        fontSize: 14,
        fontWeight: '300',
        color: '#333',
    },
    headerReturnbtn : {
        width :screenWidth * 0.7,
        marginTop: 50,
        flexDirection :"row",
        columnGap : screenWidth * 0.03,
        alignItems : "center"

    },
    addProduct : {
        borderRadius: 12,
        borderWidth: 1, 
        width : screenWidth * 0.5,
        justifyContent : "flex-start",
        alignItems :"center",
        flexDirection : "row",
        height : screenHeight * 0.05,
        paddingLeft :screenWidth * 0.05,
        paddingRight :screenWidth * 0.05,
        columnGap: screenWidth * 0.05
    },
    addProductText : {
        width : "auto",
        justifyContent : "flex-start",
        color : "red"
    },
    containerSearchBar :{
        justifyContent : "flex-start",
        alignItems :"center",
        height : screenHeight * 0.05,
        width : screenHeight * 0.9,
        flexDirection : "row",
     
        
    
    },
    searchBar : {
    
        width : screenWidth * 0.75,
        height : screenHeight * 0.05,
        borderRadius: 12,
        borderWidth: 1, 
        backgroundColor : 'rgba(128, 128, 128, 0.2)',
        paddingLeft : screenWidth * 0.05,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRightWidth: 0,  

     },
 
    searchbaricon: {
        justifyContent :"center",
        alignItems :"center",
        width :screenHeight * 0.05,
        height : screenHeight * 0.05 + 1 / 2,
        backgroundColor : 'rgba(128, 128, 128, 0.2)',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        borderLeftWidth : 0,
        borderWidth: 1, 
    },

    card : {
        flex: 1,
        alignItems: "flex-start",
        paddingTop: 20,
        borderRadius: 12,
        borderWidth: 1, 
        width : screenWidth * 0.9,
        borderColor : "rgba(211, 211, 211, 1)",
        paddingHorizontal : screenWidth * 0.05
    },

    uppersection :{

        width : screenWidth * 0.75,
        height : screenHeight * 0.05,
    },
    table :{
        
        justifyContent : "flex-start",
        alignItems :"flex-start",
        width : screenWidth * 0.75,
        height : screenHeight * 0.05,
        flex : 1
    },
    tableHeader :{
        flexDirection : "row",
        justifyContent :"space-between",
        alignItems :"flex-start",
        width : screenWidth * 0.75,
        height : screenHeight * 0.06,
  
     
    },
    tableheaderProducts :{
        fontSize : 20,
        fontWeight : 500,
        alignItems : "center",
        
    },
    tableheaderGoodUntil:{
        fontSize : 21,
        fontWeight : 200,
        alignItems : "center",
        width : screenWidth * 0.35,
    },
    item : {
        flexDirection :"row",
        borderBottomWidth: 1,      // ✅ Only bottom border
        borderBottomColor: 'gray',
        height : screenHeight * 0.05,
        width : screenWidth * 0.75,
        justifyContent :"space-between",
        alignItems :"center"
    },
    productName :{
        fontSize : 17,
        fontWeight : 500,
        alignItems : "center",
        width : screenWidth * 0.3
       
    },
    expired  :{
      color : "red"
    },
    closeToExpiry  :{
        color : "orange"
      },

    farToExpiry :{
        color : "green"
    },
    checkbox : {
        borderRadius : 5,
        borderWidth: 1, 
        height : screenHeight * 0.03,
        width : screenHeight * 0.03,
        justifyContent : "center",
        alignItems :"center",
    },
    checkboxExpiryDate:{
        flexDirection :"row",
        justifyContent : "space-between",
        alignItems :"center",
        width : screenWidth * 0.35,
        borderRadius: 12,
      
    },
    ItemsList :{
   
        width : screenWidth * 0.8,
     },
     deleteButtonBottom : {
        backgroundColor :"red",
        alignItems: "center",
        justifyContent : "center",
        borderWidth : 1,
        position: 'absolute',
        bottom :0,
        width :screenWidth,
        height :screenHeight * 0.05,
        borderRadius : 13,
        borderBottomLeftRadius :0,
        borderBottomRightRadius : 0,
        left : -0.05 * screenWidth
     },
     motiView : {
        width :screenWidth,
        height :screenHeight * 0.05,
        position: "absolute",

     },
     deleteButtonBottomText : {
        fontSize : 17,
        fontWeight : 300,
        color : "white"
     },
     loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // to appear above everything
      },
 
      modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth :1,
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