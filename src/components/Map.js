import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const startIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const positions = {
  'San Francisco': [37.7749, -122.4194],
  'Oakland': [37.8044, -122.2711],
  'San Jose': [37.3382, -121.8863],
  'Berkeley': [37.8715, -122.2730],
  'Palo Alto': [37.4419, -122.1430],
  'Fremont': [37.5483, -121.9886],
  'Sunnyvale': [37.3688, -122.0363],
  'Santa Clara': [37.3541, -121.9552],
  'Mountain View': [37.3861, -122.0839],
  'Hayward': [37.6688, -122.0808],
  'San Mateo': [37.5630, -122.3255]
};

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F1948A', '#85C1E9'
];

const Map = ({ path }) => {
  const getSegmentColor = (index) => {
    return colors[index % colors.length];
  };

  const generateSegments = (path) => {
    const segments = [];
    for (let i = 0; i < path.length - 1; i++) {
      segments.push({
        start: path[i],
        end: path[i + 1],
        color: getSegmentColor(i)
      });
    }
    return segments;
  };

  const segments = generateSegments(path);

  // Define the bounds for Northern California
  const southWest = L.latLng(36.8, -123.0);  // Adjusted SW corner
  const northEast = L.latLng(38.8, -121.0);  // Adjusted NE corner
  const bounds = L.latLngBounds(southWest, northEast);

  return (
    <MapContainer 
      center={[37.7749, -122.4194]} 
      zoom={9} 
      style={{ height: "80vh", width: "100%" }}
      maxBounds={bounds}
      minZoom={8}
      maxZoom={13}
      boundsOptions={{ padding: [50, 50] }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        noWrap={true}
        bounds={bounds}
      />
      {path.map((city, index) => {
        let icon = index === 0 ? startIcon : (index === path.length - 1 ? endIcon : null);
        if (icon) {
          return (
            <Marker key={index} position={positions[city]} icon={icon}>
              <Popup>{city}</Popup>
              <Tooltip permanent>{city}</Tooltip>
            </Marker>
          );
        }
        return null;
      })}
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          <Polyline 
            positions={[positions[segment.start], positions[segment.end]]}
            color={segment.color}
            weight={6}
          >
            <Tooltip sticky>{`${segment.start} to ${segment.end}`}</Tooltip>
          </Polyline>
          {index < segments.length - 1 && (
            <Marker
              position={positions[segment.end]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:${segment.color};width:10px;height:10px;border-radius:50%;"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5]
              })}
            >
              <Tooltip permanent>{segment.end}</Tooltip>
            </Marker>
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default Map;