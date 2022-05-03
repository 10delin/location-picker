import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

//variables to limit the map
const corner1 = L.latLng(35.290051301069006, -7.629485689021285);
const corner2 = L.latLng(39.027321651363565, -0.8509217840822761);
const bounds = L.latLngBounds(corner1, corner2);
let center = [37.22468458759511, -4.701167986858217];

function AddMarkerClick({setPosition, setLatlng}) {
  useMapEvents({
    click: (e) => {
      setPosition(e.latlng)
      setLatlng(e.latlng)
    },
  });
  return null;
}

function DraggableMarker({position, setPosition, setLatlng}) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
          setLatlng(marker.getLatLng())
        }
      },
    }),[setLatlng, setPosition]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={GetIcon(30, "red")}
      ref={markerRef}
    ></Marker>
  );
}

const AddressSearch = ({mapRef, setPosition, addresses, setAddresses}) => {
  const [keyword, setKeyword] = useState("");

  const handleChange = (evt) => {
    setKeyword(evt.target.value);
  };

  const fetchKeyword = async (evt) => {
    evt.preventDefault();
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${keyword}+andalucia+españa`);

    const json = await res.json();
    setAddresses(json);
  };

  function moveToNewPosition(e, lat, lng) {
    const { current } = mapRef;
    current.flyTo([lat, lng], 18, { duration: 1 });
    setPosition([lat, lng]);
  }

  return (
    <div>
      <form onSubmit={fetchKeyword}>
        <input
          type="search"
          onChange={handleChange}
          value={keyword}
          placeholder="Inserta tu dirección"
        />
      </form>
      <ul>
        {
          addresses && addresses.map((item, index) => (
            <li key={index}>
              <a href="#" onClick={(e) => moveToNewPosition(e, item.lat, item.lon)}>
                {item.display_name}{" "}
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

const MyMap = () => {
  const [position, setPosition] = useState(center);
  const [addresses, setAddresses] = useState(null);
  const [latlng, setLatlng] = useState(null);
  const [zoom, setZoom] = useState(8.3);
  const mapRef = useRef();

  function CenterMarker() {
    const { current } = mapRef;
    current.flyTo(position, 11);
  }

  useEffect(() => {
    if(latlng) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then((res) => res.json())
        .then((result) => {
          setAddresses([result])
        })
    }
  },[latlng])

  return (
    <>
      <MapContainer
        ref={mapRef}
        className="map"
        center={center}
        zoom={zoom}
        minZoom={7}
        doubleClickZoom={false}
        maxBoundsViscosity={3.0}
        maxBounds={bounds}
        style={{ height: 800, width: "100%" }}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
        />
        <AddMarkerClick
          setPosition={setPosition}
          setLatlng={setLatlng}
        />
        <DraggableMarker
          position={position}
          setPosition={setPosition}
          setLatlng={setLatlng}
        />
      </MapContainer>
      <div>
        <button onClick={(e) => CenterMarker()}>Centrar marcador</button>
      </div>
      <AddressSearch mapRef={mapRef} setPosition={setPosition} addresses={addresses} setAddresses={setAddresses}/>
    </>
  );
};

function GetIcon(iconSize, iconColor) {
  return L.icon({
    iconUrl: require("../Static/Markers/marker-" + iconColor + ".png"),

    iconSize: [iconSize],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],
  });
}

export default MyMap;
