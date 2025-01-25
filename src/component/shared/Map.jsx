import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import PropTypes from "prop-types";
import {useEffect} from "react";

Map.propTypes = {
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    locationName: PropTypes.string
}

function Map({latitude, longitude, locationName}) {
    const location = (latitude && longitude) ? [latitude, longitude] : [51.505, -0.09];

    useEffect(() => {
        if (latitude && longitude) {
            location[0] = latitude;
            location[1] = longitude;
        }
    }, [latitude, location, longitude]);
    
    return (
        <MapContainer center={location} zoom={16} scrollWheelZoom={true} style={{height: '30rem', width: 'clamp(40rem, 100%, 50rem)'}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={location}>
                <Popup>
                    {locationName}
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default Map