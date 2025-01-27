import {useMap} from 'react-leaflet';
import PropTypes from "prop-types";
import {useEffect} from "react";

ChangeMapView.propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
}

function ChangeMapView({ lat, lon }) {
    const map = useMap();
    useEffect(() => {
        if(lat && lon){
            map.setView([lat, lon], map.getZoom());
        }
    }, [lat, lon]);
    return null;
}

export default ChangeMapView