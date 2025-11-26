import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Button,
  IconButton,
  ActivityIndicator,
  Chip,
  useTheme,
  FAB,
} from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * 0.5;

interface Workshop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  isOpen?: boolean;
  phoneNumber?: string;
  website?: string;
  distance?: number;
}

type MapType = 'standard' | 'satellite' | 'hybrid';

export default function WorkshopFinderScreen() {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [showTraffic, setShowTraffic] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show your location on the map.'
          );
          setRegion({
            latitude: 59.3293,
            longitude: 18.0686,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation(location);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
        setLocationLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to get your location. Please try again.');
        setLocationLoading(false);
      }
    })();
  }, []);

  const searchWorkshops = async (query: string = searchQuery) => {
    if (!region) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    if (!query.trim()) {
      Alert.alert('Empty Search', 'Please enter a search term.');
      return;
    }

    setLoading(true);
    setWorkshops([]);
    setSelectedWorkshop(null);

    try {
      const searchText = query.trim();
      const lowerSearch = searchText.toLowerCase();
      
      if (!lowerSearch.includes('hedin')) {
        setWorkshops([]);
        Alert.alert(
          'No Locations Found', 
          `This map only shows Hedin Automotive locations. Please search for "Hedin" or "Hedin Automotive".`
        );
        setLoading(false);
        return;
      }

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const finalQuery = 'Hedin Automotive';
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(finalQuery)}&location=${region.latitude},${region.longitude}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const filteredResults = data.results.filter((place: any) => {
          const placeName = place.name.toLowerCase();
          const placeAddress = (place.formatted_address || place.vicinity || '').toLowerCase();
          
          return placeName.includes('hedin') || placeAddress.includes('hedin');
        });

        if (filteredResults.length === 0) {
          setWorkshops([]);
          Alert.alert('No Results', 'No Hedin Automotive locations found.');
          setLoading(false);
          return;
        }

        const workshopResults: Workshop[] = filteredResults.map((place: any) => {
          const distance = userLocation 
            ? calculateDistance(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              )
            : undefined;

          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address || place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating,
            isOpen: place.opening_hours?.open_now,
            distance: distance,
          };
        });

        workshopResults.sort((a, b) => (a.distance || 999) - (b.distance || 999));

        setWorkshops(workshopResults);
        
        if (workshopResults.length > 0 && mapRef.current) {
          const coordinates = workshopResults.map(w => ({
            latitude: w.latitude,
            longitude: w.longitude,
          }));
          
          if (userLocation) {
            coordinates.push({
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            });
          }
          
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 150, right: 100, bottom: 350, left: 100 },
            animated: true,
          });
        }
      } else if (data.status === 'REQUEST_DENIED') {
        setWorkshops([]);
        Alert.alert(
          'API Error',
          'Places API request denied. Please check your API key and enabled APIs in Google Cloud Console.'
        );
      } else if (data.status === 'ZERO_RESULTS') {
        setWorkshops([]);
        Alert.alert('No Results', 'No Hedin Automotive locations found.');
      } else {
        setWorkshops([]);
        Alert.alert('Search Error', `Search failed: ${data.status}. ${data.error_message || ''}`);
      }
    } catch (error) {
      setWorkshops([]);
      Alert.alert('Network Error', 'Failed to search. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return {
          phoneNumber: data.result.formatted_phone_number,
          website: data.result.website,
          openingHours: data.result.opening_hours?.weekday_text,
        };
      }
    } catch (error) {
      // Silently fail if details can't be loaded
    }
    return null;
  };

  const handleMarkerPress = async (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: workshop.latitude,
        longitude: workshop.longitude,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      }, 500);
    }

    const details = await getPlaceDetails(workshop.id);
    if (details) {
      setSelectedWorkshop(prev => prev ? { ...prev, ...details } : null);
    }
  };

  const openDirections = (workshop: Workshop) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${workshop.latitude},${workshop.longitude}`;
    const label = workshop.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const callWorkshop = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 500);
    }
  };


  if (locationLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsTraffic={showTraffic}
          mapType={mapType}
          showsBuildings={true}
          showsIndoors={true}
          loadingEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
          toolbarEnabled={false}
        >
          {workshops.map((workshop, index) => (
            <Marker
              key={workshop.id}
              coordinate={{
                latitude: workshop.latitude,
                longitude: workshop.longitude,
              }}
              title={workshop.name}
              description={workshop.address}
              onPress={() => handleMarkerPress(workshop)}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.marker, { backgroundColor: theme.colors.primary }]}>
                  <MaterialCommunityIcons 
                    name="car-wrench" 
                    size={20} 
                    color="white" 
                  />
                </View>
                {index === 0 && (
                  <View style={[styles.markerBadge, { backgroundColor: theme.colors.secondary }]}>
                    <Text style={styles.markerBadgeText}>1</Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Searchbar
          placeholder="Search for Hedin Automotive locations..."
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text === '') {
              setWorkshops([]);
              setSelectedWorkshop(null);
            }
          }}
          value={searchQuery}
          onSubmitEditing={() => searchWorkshops()}
          loading={loading}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          icon="magnify"
          clearIcon="close"
          elevation={2}
        />
      </View>

      <View style={styles.mapControls}>
        <IconButton
          icon="crosshairs-gps"
          size={24}
          iconColor={theme.colors.primary}
          containerColor={theme.colors.surface}
          onPress={centerOnUser}
          style={styles.controlButton}
        />
        
        <IconButton
          icon={showTraffic ? "traffic-light" : "traffic-light-outline"}
          size={24}
          iconColor={showTraffic ? theme.colors.primary : theme.colors.onSurfaceVariant}
          containerColor={theme.colors.surface}
          onPress={() => setShowTraffic(!showTraffic)}
          style={styles.controlButton}
        />
        
        <IconButton
          icon={
            mapType === 'standard' ? 'map' : 
            mapType === 'satellite' ? 'satellite-variant' : 
            'layers'
          }
          size={24}
          iconColor={theme.colors.onSurfaceVariant}
          containerColor={theme.colors.surface}
          onPress={() => {
            if (mapType === 'standard') {
              setMapType('satellite');
            } else if (mapType === 'satellite') {
              setMapType('hybrid');
            } else {
              setMapType('standard');
            }
          }}
          style={styles.controlButton}
        />
      </View>

      {selectedWorkshop && (
        <Card style={[styles.workshopCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.workshopHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                  {selectedWorkshop.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {selectedWorkshop.address}
                </Text>
                {selectedWorkshop.distance && (
                  <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 2 }}>
                    📍 {selectedWorkshop.distance.toFixed(1)} km away
                  </Text>
                )}
              </View>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setSelectedWorkshop(null)}
              />
            </View>

            <View style={styles.infoRow}>
              {selectedWorkshop.rating && (
                <Chip icon="star" compact textStyle={{ fontSize: 12 }}>
                  {selectedWorkshop.rating.toFixed(1)} ⭐
                </Chip>
              )}
              {selectedWorkshop.isOpen !== undefined && (
                <Chip
                  icon="clock-outline"
                  compact
                  textStyle={{ fontSize: 12 }}
                  style={{
                    backgroundColor: selectedWorkshop.isOpen
                      ? theme.colors.primaryContainer
                      : theme.colors.errorContainer,
                  }}
                >
                  {selectedWorkshop.isOpen ? 'Open Now' : 'Closed'}
                </Chip>
              )}
            </View>

            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="directions"
                onPress={() => openDirections(selectedWorkshop)}
                style={styles.actionButton}
                compact
              >
                Directions
              </Button>
              
              {selectedWorkshop.phoneNumber && (
                <Button
                  mode="outlined"
                  icon="phone"
                  onPress={() => callWorkshop(selectedWorkshop.phoneNumber!)}
                  style={styles.actionButton}
                  compact
                >
                  Call
                </Button>
              )}
              
              {selectedWorkshop.website && (
                <Button
                  mode="outlined"
                  icon="web"
                  onPress={() => openWebsite(selectedWorkshop.website!)}
                  style={styles.actionButton}
                  compact
                >
                  Website
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {workshops.length > 0 && searchQuery.trim() !== '' && (
        <View style={[styles.resultsCount, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons 
            name="map-marker-multiple" 
            size={16} 
            color={theme.colors.onPrimaryContainer} 
          />
          <Text style={{ color: theme.colors.onPrimaryContainer, marginLeft: 8, fontWeight: '600' }}>
            Found {workshops.length} Hedin Automotive location{workshops.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {searchQuery.trim() !== '' && !loading && workshops.length === 0 && (
        <FAB
          icon="magnify"
          style={[styles.searchFab, { backgroundColor: theme.colors.primary }]}
          onPress={() => searchWorkshops()}
          label="Search"
          color="white"
          small
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 28,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 240,
    gap: 12,
  },
  controlButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 3,
    borderColor: 'white',
  },
  markerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  workshopCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderRadius: 16,
  },
  workshopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  resultsCount: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchFab: {
    position: 'absolute',
    bottom: 400,
    alignSelf: 'center',
  },
});

