import "leaflet/dist/leaflet.css";
import {
  divIcon,
  latLng,
  map as LFMap,
  Marker,
  marker as createMarker,
  tileLayer,
} from "leaflet";
// @ts-ignore
import * as mqtt from "mqtt/dist/mqtt.min.js";

const mapElement = document.getElementById("map") as HTMLDivElement;
const leafletMap = LFMap(mapElement, { keyboard: false }).setView(
  latLng(50, 9),
  10
);
tileLayer("http://localhost:45734/tile/{z}/{x}/{y}.png").addTo(leafletMap);

const centerRequest = new Request("http://localhost:45734/rpc/properties");
fetch(centerRequest, {
  method: "POST",
  body: '{ "method": "getCenter", "id": "5" }',
})
  .then((center) => center.json())
  .then((center) => {
    return leafletMap.setView(
      latLng(center.result.lat, center.result.lng),
      center.result.zoom,
      { animate: false }
    );
  });
const markers: { [key: string]: Marker } = {};
const client = mqtt.connect("ws://localhost:9001");
client.subscribe("vehicles/+/location");
client.on("message", (topic: string, message: string) => {
  const position: number[] = JSON.parse(message);
  const latLng = { lat: position[0], lng: position[1] };
  const key = topic.split("/")[1];
  let marker = markers[key];
  if (!marker) {
    marker = createMarker(latLng, { opacity: 1 });
    markers[key] = marker.addTo(leafletMap);
  }
  const icon = divIcon({
    className: "driving-bus",
    iconAnchor: [25, 10],
    iconSize: undefined,
    html: key,
  });
  marker.setIcon(icon);
  marker.setLatLng(latLng);
});
