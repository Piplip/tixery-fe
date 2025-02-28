import {useMap} from "react-leaflet";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const searchStyles = {
    position: 'absolute',
    top: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '.5rem 2rem',
    zIndex: 1000,
    backgroundColor: 'white',
}

MapSearch.propTypes = {
    handleSearch: PropTypes.func,
}

function MapSearch({handleSearch}) {
    const map = useMap()
    const {t} = useTranslation()

    function handleMapSearch(){
        let bounds = map.getBounds();
        let northEast = bounds.getNorthEast();
        let southWest = bounds.getSouthWest();

        handleSearch(northEast, southWest)
    }

    return (
        <button style={searchStyles} onClick={handleMapSearch}>
            {t('search-this-area')}
        </button>
    )
}

export default MapSearch