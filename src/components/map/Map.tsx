import { Button } from "@mui/material";
import { MapContainer, Polygon, Popup, TileLayer } from "react-leaflet";

interface Props {}

export default function Map(props: Props) {
  const highlightFeature = (e: any) => {
    let layer = e.target;
    layer.setStyle({
      color: "blue",
    });
  };
  const unHighlightFeature = (e: any) => {
    let layer = e.target;
    layer.setStyle({
      color: "#30D5C8",
    });
  };

  const polygons = geoJson.features.map((feature: any) => {
    return (
      <Polygon
        color="#30D5C8"
        eventHandlers={{
          mouseover: highlightFeature,
          mouseout: unHighlightFeature,
        }}
        positions={feature.geometry.coordinates[0].map((v: any) => [
          v[1],
          v[0],
        ])}
      >
        <Popup>
          <p> Info about zone</p>
          <Button variant="outlined">Start project</Button>
        </Popup>
      </Polygon>
    );
  });

  return (
    <div id="map">
      <MapContainer
        center={[-32.27554173488815, 147.97835713324858]}
        zoom={7}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polygons}
      </MapContainer>
    </div>
  );
}

const geoJson: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [144.84375, -31.63467554954133],
            [145.31616210937497, -33.5230788089042],
            [148.095703125, -33.95247360616282],
            [148.062744140625, -31.503629305773018],
            [146.8212890625, -30.458144351018078],
            [144.84375, -31.63467554954133],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [144.810791015625, -31.62532121329918],
            [143.712158203125, -29.935895213372433],
            [142.020263671875, -31.287939892641734],
            [142.833251953125, -33.7243396617476],
            [145.447998046875, -33.46810795527895],
            [144.810791015625, -31.62532121329918],
          ],
        ],
      },
    },
  ],
};
