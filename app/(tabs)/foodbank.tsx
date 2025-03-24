
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

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
};

const FoodBankMap = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      // Fetch nearby food banks (replace with your API call)
      const foodBanks: FoodBank[] = [
        {
          place_id: '1',
          name: 'Casa Loma Food Bank',
          vicinity: 'Toronto, ON',
          geometry: { location: { lat: 43.678, lng: -79.409 } },
        },
        {
          place_id: '2',
          name: 'Little Italy Food Bank',
          vicinity: 'Toronto, ON',
          geometry: { location: { lat: 43.662, lng: -79.422 } },
        },
      ];
      setFoodBanks(foodBanks);
      setLoading(false);
    })();
  }, []);

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

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={{
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
          />
        ))}
      </MapView>

      <View style={{ height: '33%', backgroundColor: 'white' }}>
        <FlatList
          data={foodBanks}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ color: '#6b7280' }}>{item.vicinity}</Text>
              <Text style={{ color: '#6b7280', textAlign: 'right' }}>2.34 km away</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default FoodBankMap;
