import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

// Import the store logo and location pin images
import logo from "../../assets/logo.png";  // The logo image for the store
import locationPin from "../../assets/location-pin.png";  // The location pin image

import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// Create a custom icon for the location pin (for map clicks)
const locationPinIcon = new L.Icon({
  iconUrl: locationPin,  // Use location-pin.png for the pin marker
  iconSize: [40, 50],  // Adjust the size of the pin
  iconAnchor: [20, 50],  // Set anchor point to make it center properly
  popupAnchor: [0, -40],  // Adjust popup position
  shadowUrl: null,  // No shadow for the icon
});

// Create a custom icon for the store (using the logo)
const storeIcon = new L.Icon({
  iconUrl: logo,  // Use the store's logo
  iconSize: [50, 50],  // Adjust the size of the store's logo
  iconAnchor: [25, 50],  // Set anchor point to make it center properly
  popupAnchor: [0, -40],  // Adjust popup position
  shadowUrl: null,  // No shadow for the icon
});

// Store location coordinates (store's position)
const storeLocation = { lat: 13.93299, lng: 121.62603 };

// Component to handle map click and marker
const LocationMarker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      onSelect({ lat, lng });
    },
  });

  return position ? <Marker position={position} icon={locationPinIcon} /> : null;
};

// Component to add search box
const SearchControl = ({ onSelect }) => {
  const map = useMap();
  const searchControlRef = useRef(null);

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);
    searchControlRef.current = searchControl;

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

// Reverse Geocoding to get the address from lat/lng
const getAddressFromLatLng = (lat, lng, onSelect) => {
  const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      const address = data?.address || {};
      const formattedAddress = `${address.road || ""} ${address.city || ""} ${address.state || ""}`;
      onSelect({ lat, lng, address: formattedAddress });
    })
    .catch((error) => console.error("Error fetching address:", error));
};

const LocationPicker = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: storeLocation.lat,
    lng: storeLocation.lng,
    address: "Store Location"
  });

  const handleLocationSelect = ({ lat, lng, address }) => {
    setSelectedLocation({ lat, lng, address });
    onLocationSelect({ lat, lng, address });
  };

  return (
    <div className="map-container">
      <MapContainer
        center={storeLocation} // Center the map on the store location
        zoom={16}
        minZoom={12}
        maxZoom={19}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=NNcVxYSaKi8OQg76l6Am"
          attribution="&copy; <a href='https://www.maptiler.com/copyright/'>MapTiler</a> & <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
          maxZoom={30}
        />
        <SearchControl onSelect={handleLocationSelect} />
        
        {/* Store location marker with the store logo */}
        <Marker position={storeLocation} icon={storeIcon}>
          <Tooltip permanent>Salvacion Garat BottledDrink Distributor</Tooltip>
        </Marker>

        {/* User's selected location marker with location pin */}
        <LocationMarker
          onSelect={({ lat, lng }) => {
            getAddressFromLatLng(lat, lng, handleLocationSelect);
          }}
        />
      </MapContainer>

      {/* Display the selected location's coordinates and address */}
      <div className="location-info">
        <p><strong>Latitude:</strong> {selectedLocation.lat}</p>
        <p><strong>Longitude:</strong> {selectedLocation.lng}</p>
        <p><strong>Address:</strong> {selectedLocation.address}</p>
      </div>
    </div>
  );
};

export default LocationPicker;
