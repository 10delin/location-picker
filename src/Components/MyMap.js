import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

//variables to limit the map
const corner1 = L.latLng(35.290051301069006, -7.629485689021285);
const corner2 = L.latLng(39.027321651363565, -0.8509217840822761);
const bounds = L.latLngBounds(corner1, corner2);

const MyMap = () => {
  let center = [37.22468458759511, -4.701167986858217];
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState([]);
  const [position, setPosition] = useState(center);
  const [zoom, setZoom] = useState(8.3);
  const mapRef = useRef();
  let lat, lon;
  let urlfetch;

  function GetIcon(iconSize, iconColor) {
    return L.icon({
      iconUrl: require("../Static/Markers/marker-" + iconColor + ".png"),

      iconSize: [iconSize],

      iconAnchor: [12, 41],

      popupAnchor: [1, -34],
    });
  }

  const fetchKeyword = async (evt) => {
    evt.preventDefault();
    urlfetch = `https://nominatim.openstreetmap.org/search?format=json&q=${keyword}+andalucia+españa`;
    const res = await fetch(urlfetch);

    const json = await res.json();
    setData(json);
  };

  const fetchLatLon = async () => {
    urlfetch = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(urlfetch);

    const json = await res.json();
    setData([json]);
    console.log("hola")
    console.log("address", data.address.state)
  };

  const handleChange = (evt) => {
    setKeyword(evt.target.value);
  };

  function newCenter(e, lat, lng) {
    const { current } = mapRef;
    console.log(current);
    current.flyTo([lat, lng], 18, { duration: 1 });
    setPosition([lat, lng]);
  }

  function AddMarkerClick() {
    const { current } = mapRef;
    useMapEvents({
      click: (e) => {
        console.log("current", current);
        const clicked = current.mouseEventToLatLng(e.originalEvent);
        setPosition([clicked.lat, clicked.lng]);
        lat = clicked.lat;
        lon = clicked.lng;
        fetchLatLon();
      },
    });
    return null;
  }

  function DraggableMarker() {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            lat = marker.getLatLng().lat;
            lon = marker.getLatLng().lng;
            fetchLatLon();
            setPosition(marker.getLatLng());
          }
        },
      }),
      []
    );

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

  function CenterMarker() {
    const { current } = mapRef;
    current.flyTo(position, 11);
  }

  return (
    <>
      <div>
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
          <AddMarkerClick />
          <DraggableMarker />
          ))
        </MapContainer>
        <div>
          <button onClick={(e) => CenterMarker()}>Centrar marcador</button>
        </div>
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
            {data.map((item) => (
              <li key={item.place_id}>
                <a href="#" onClick={(e) => newCenter(e, item.lat, item.lon)}>
                  {item.display_name}{" "}
                </a>
              </li>
            ))}
            {console.log(data)}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MyMap;
