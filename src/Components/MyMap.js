import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
} from "react-leaflet";



//variables to limit the map
const corner1 = L.latLng(35.290051301069006, -7.629485689021285);
const corner2 = L.latLng(39.027321651363565, -0.8509217840822761);
const bounds = L.latLngBounds(corner1, corner2);


// function MyComponent() {
//   const map = useMap()
//   useMapEvents({
//     // click: (e) => {
//     //   const clicked = map.mouseEventToLatLng(e.originalEvent)
//     //   L.marker([clicked.lat,clicked.lng]).addTo(map)
//     // }
//   })
//   return null
// }

const MyMap = () => {
  let center = [37.22468458759511, -4.701167986858217]
  let zoom = 8.3;
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState([]);
  const [position, setPosition] = useState(center)



  function GetIcon(iconSize, iconColor) {

    return L.icon({

      iconUrl: require("../Static/Markers/marker-" + iconColor + ".png"),

      iconSize: [iconSize],

      iconAnchor: [12, 41],

      popupAnchor: [1, -34],

    });

  }

  const handleSumbit = evt => {
    evt.preventDefault();
    const fetchData = async () => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${keyword}+andalucia+españa`,
          );
          const json = await res.json();
          setData(json);
        };
        fetchData();
    
  }

  const handleChange = evt => {
    setKeyword(evt.target.value)
  }

  function newCenter(e, lat, lng){
    e.preventDefault();
    setPosition([lat, lng])
    zoom = 17;
  }

  
  function DraggableMarker() {
    const markerRef = useRef(null)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            setPosition(marker.getLatLng())
          }
        },
      }),
      [],
    )

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        icon={GetIcon(30, "red")}
        ref={markerRef}>
      </Marker>
    )
  }

  return (
    <>
      <div>
        <MapContainer
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
          <DraggableMarker />
          ))

        </MapContainer>
        <div>
          <form onSubmit={handleSumbit}>
            <input type="text" onChange={handleChange} value={keyword} placeholder="Inserta tu dirección" />
            
          </form>
          <ul>

            {data.map(item => (

              <li key={item.place_id}>

                <a href="#" onClick={(e) => newCenter(e,item.lat, item.lon)}>{item.display_name} </a>
              </li>

            ))}

          </ul>
        </div>
      </div>
    </>
  );
};

export default MyMap;
