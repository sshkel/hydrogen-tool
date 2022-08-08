import Box from "@mui/material/Box";
import { useState } from "react";
import { MapContainer, Polygon, TileLayer, ZoomControl } from "react-leaflet";

import { ZonePopover } from "./ZonePopover";
import geoJson from "./map.json";

interface Props {
  setLocation: (location: string) => void;
}

export default function Map(props: Props) {
  const [sideMenuOpen, setSideMenuState] = useState(false);
  const openSideMenu = () => {
    setSideMenuState(true);
  };
  const closeSideMenu = () => setSideMenuState(false);

  const highlightFeature = (e: any) => {
    let layer = e.target;
    layer.setStyle({
      color: "#4472C4",
      weight: 3,
    });
  };
  const unHighlightFeature = (e: any) => {
    let layer = e.target;
    layer.setStyle({
      color: "#4472C4",
      weight: 1,
    });
  };
  // TODO: replace back with <GeoJson> if we are not doing anything fancy with polygon styling
  const polygons = geoJson.features.map((feature: any) => {
    return (
      <Polygon
        color="#4472C4"
        weight={1}
        eventHandlers={{
          mouseover: highlightFeature,
          mouseout: unHighlightFeature,
          click: () => {
            props.setLocation(feature.properties.zone);
            openSideMenu();
          },
        }}
        positions={feature.geometry.coordinates[0].map((v: number[]) => [
          v[1],
          v[0],
        ])}
      />
    );
  });

  return (
    <div id="map">
      <Box
        sx={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ZonePopover
          sideMenuState={sideMenuOpen}
          closeSideMenu={closeSideMenu}
        />
        <MapContainer
          center={[-32.27554173488815, 147.97835713324858]}
          zoom={7}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          {polygons}
        </MapContainer>
      </Box>
    </div>
  );
}
