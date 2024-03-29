import Box from "@mui/material/Box";
import { useState } from "react";
import { MapContainer, Polygon, TileLayer, ZoomControl } from "react-leaflet";

import DesignStepper from "../DesignStepper";
import { ZonePopover } from "./ZonePopover";
import geoJson from "./zones.json";

interface Props {
  setLocation: (location: string) => void;
}

export default function Map(props: Props) {
  const [sideMenuOpen, setSideMenuState] = useState(false);
  const [zone, setSideMenuZone] = useState<string>("Z1");
  const openSideMenu = (zone: string) => {
    setSideMenuZone(zone);
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
  const polygons = geoJson.features.map((feature: any) => {
    return (
      <Polygon
        key={feature.properties.zone}
        color="#4472C4"
        weight={1}
        eventHandlers={{
          mouseover: highlightFeature,
          mouseout: unHighlightFeature,
          click: () => {
            props.setLocation(feature.properties.zone);
            openSideMenu(feature.properties.zone);
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
        <DesignStepper activeStep={sideMenuOpen ? 1 : 0} />
        <ZonePopover
          zone={zone}
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
