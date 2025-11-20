import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Place, Location } from '@/types';

const TOMTOM_API_KEY = 'QrtzoCOAzm3oaPwAnwLKG6wjhnnq8v5J';

interface Props {
  userLocation: Location | null;
  places?: Place[];
  selectedPlace?: Place | null;
  route?: { latitude: number; longitude: number }[];
  onPlacePress?: (place: Place) => void;
}

export default function TomTomMapView({
  userLocation,
  places = [],
  selectedPlace,
  route,
  onPlacePress,
}: Props) {
  const center = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : { lat: 41.0082, lng: 28.9784 };

  const markers = places.map((place, index) => ({
    lat: place.lat,
    lng: place.lng,
    name: place.name.replace(/'/g, "\\'"), // Escape quotes
    id: `marker_${index}`, // Simple numeric ID
    isSelected: selectedPlace?.id === place.id,
  }));

  console.log('🗺️ MapView rendering:', {
    userLocation: !!userLocation,
    placesCount: places.length,
    markersCount: markers.length,
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" type="text/css" href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css">
  <script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; }
    #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = tt.map({
      key: '${TOMTOM_API_KEY}',
      container: 'map',
      center: [${center.lng}, ${center.lat}],
      zoom: 14,
      style: 'https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main'
    });

    map.addControl(new tt.NavigationControl());

    // User location marker
    ${
      userLocation
        ? `
    const userMarker = new tt.Marker({ color: '#3B82F6' })
      .setLngLat([${center.lng}, ${center.lat}])
      .addTo(map);
    `
        : ''
    }

    // Place markers
    console.log('Creating ${markers.length} markers...');
    ${markers
      .map(
        (marker) => `
    try {
      const ${marker.id} = new tt.Marker({ 
        color: '${marker.isSelected ? '#EF4444' : '#10B981'}' 
      })
        .setLngLat([${marker.lng}, ${marker.lat}])
        .setPopup(new tt.Popup({ offset: 35 }).setHTML('<div style="padding: 8px; font-size: 14px; font-weight: 600;">${marker.name}</div>'))
        .addTo(map);
      console.log('✅ Marker created: ${marker.name}');
    } catch (e) {
      console.error('❌ Marker error:', e);
    }
    `
      )
      .join('\n')}

    // Route polyline
    ${
      route && route.length > 0
        ? `
    map.on('load', function() {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: ${JSON.stringify(route.map((p) => [p.longitude, p.latitude]))}
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 4
        }
      });
    });
    `
        : ''
    }

    // Fit bounds if there are markers
    ${
      markers.length > 0
        ? `
    const bounds = new tt.LngLatBounds();
    ${markers.map((m) => `bounds.extend([${m.lng}, ${m.lat}]);`).join('\n')}
    ${userLocation ? `bounds.extend([${center.lng}, ${center.lat}]);` : ''}
    map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    `
        : ''
    }
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
});
