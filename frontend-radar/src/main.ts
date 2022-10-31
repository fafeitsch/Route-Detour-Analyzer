import "leaflet/dist/leaflet.css";
import { latLng, map as LFMap, tileLayer } from "leaflet";
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

const client = mqtt.connect("ws://localhost:9001");
client.subscribe("test/today");
client.on("message", (_: string, message: any) =>
  console.log("message " + message)
);
