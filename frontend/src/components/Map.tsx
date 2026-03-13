import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../store/useStore';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

const MapComponent: React.FC = () => {
    const { busLocation, stops } = useStore();
    const center: [number, number] = busLocation
        ? [busLocation.latitude, busLocation.longitude]
        : [9.9312, 76.2673];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <RecenterMap center={center} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {busLocation && (
                <Marker 
                    position={[busLocation.latitude, busLocation.longitude]} 
                    icon={busIcon}
                >
                    <Popup>
                        Bus ID: {busLocation.bus_id} <br />
                        Speed: {busLocation.speed} km/h
                    </Popup>
                </Marker>
            )}

            {stops.map((stop) => (
                <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
                    <Popup>{stop.stop_name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
