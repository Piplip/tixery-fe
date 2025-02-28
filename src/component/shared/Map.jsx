import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import PropTypes from "prop-types";
import {useEffect, useMemo} from "react";
import ChangeMapView from "./ChangeMapView.jsx";
import MapSearch from "./MapSearch.jsx";

Map.propTypes = {
    latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    locationName: PropTypes.string,
    showSearch: PropTypes.bool,
    handleSearch: PropTypes.func,
}

function Map({latitude, longitude, locationName, showSearch, handleSearch}) {
    const location = useMemo(() => {
        return (latitude && longitude) ? [latitude, longitude] : [51.505, -0.09];
    }, [latitude, longitude]);

    useEffect(() => {
        if (latitude && longitude) {
            location[0] = latitude;
            location[1] = longitude;

        }
    }, [latitude, longitude]);

    return (
        <MapContainer center={location} zoom={16} scrollWheelZoom={true} style={{height: '30rem', width: 'clamp(40rem, 100%, 60rem)'}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {showSearch && <MapSearch handleSearch={handleSearch} />}
            <Marker position={location}>
                <Popup>
                    {locationName}
                </Popup>
            </Marker>
            <ChangeMapView lat={Number(location[0])} lon={Number(location[1])} />
        </MapContainer>
    )
}

export default Map