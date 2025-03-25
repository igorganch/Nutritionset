import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Dimensions, StyleSheet, Linking, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

type FoodBank = {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  distance?: number; // This adds distance to the FoodBank type
};

const FoodBankMap = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { width } = Dimensions.get('window');

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });

      
      const apiKey = 'AIzaSyDMFBLsd78mdCxsAQYVSW7sGFWHA1ZBDZs'; //API KEY FORM GOOGLE HERE
      const radius = 40000; // 40 km radius to look for foodbaks
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.coords.latitude},${userLocation.coords.longitude}&radius=${radius}&keyword=food+bank&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        

        if (data.results && data.results.length > 0) {
          // Calculate distance for each food bank
          const foodBanksWithDistance = data.results.map((foodBank: FoodBank) => ({
            ...foodBank,
            distance: calculateDistance(
              userLocation.coords.latitude,
              userLocation.coords.longitude,
              foodBank.geometry.location.lat,
              foodBank.geometry.location.lng
            ),
          }));

          // Sort food banks by distance (closest first)
          foodBanksWithDistance.sort((a: FoodBank, b: FoodBank) => a.distance! - b.distance!);

          setFoodBanks(foodBanksWithDistance);
        } else {
          setErrorMsg('No food banks found nearby.');
        }
      } catch (error) {
        console.error('Error fetching food banks:', error);
        setErrorMsg('Failed to fetch food banks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openInDefaultMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      console.error('Failed to open map');
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Location not available</Text>
      </View>
    );
  }

  const mapSize = width - 40; // Subtract margins (20px on each side)
  const mapStyle = {
    width: mapSize,
    height: mapSize, // Make it a square
    borderRadius: 20, // Rounded corners for the map
  };

  // Calculate map region to fit all markers
  const markers = [
    { latitude: location.latitude, longitude: location.longitude }, // Your location
    ...foodBanks.map((foodBank) => ({
      latitude: foodBank.geometry.location.lat,
      longitude: foodBank.geometry.location.lng,
    })), // Food bank locations
  ];

  const fitToMarkers = (mapRef: MapView | null) => {
    if (mapRef && markers.length > 0) {
      mapRef.fitToCoordinates(markers, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FOODBANK LOCATIONS</Text>
      </View>

      {/* MapView inside a rounded container with shadow */}
      <View style={[styles.mapContainer, styles.mapShadow]}>
        <MapView
          ref={(mapRef) => fitToMarkers(mapRef)} // Fit map to markers
          style={mapStyle}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Your Location"
            pinColor="blue"
          />
          {foodBanks.map((foodBank) => (
            <Marker
              key={foodBank.place_id}
              coordinate={{
                latitude: foodBank.geometry.location.lat,
                longitude: foodBank.geometry.location.lng,
              }}
              title={foodBank.name}
              description={foodBank.vicinity}
              pinColor="red" // Red pin for food banks
            />
          ))}
        </MapView>
      </View>

      {/* List of food banks */}
      <View style={{ flex: 1, marginTop: 20 }}>
        <FlatList
          data={foodBanks}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
              onPress={() => openInDefaultMap(item.geometry.location.lat, item.geometry.location.lng)}
            >
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ color: '#6b7280' }}>{item.vicinity}</Text>
              <Text style={{ color: '#6b7280', textAlign: 'right' }}>
                {item.distance?.toFixed(2)} km away
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  mapContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  mapShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 20,
      },
    }),
  },
});

export default FoodBankMap;