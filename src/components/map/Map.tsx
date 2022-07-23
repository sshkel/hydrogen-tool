import { Button, ListItemButton } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";
import { MapContainer, Polygon, TileLayer } from "react-leaflet";

interface Props {}

export default function Map(props: Props) {
  const [sideMenuOpen, setSideMenuState] = useState(false);
  const openSideMenu = () => setSideMenuState(true);
  const closeSideMenu = () => setSideMenuState(false);

  const highlightFeature = (e: any) => {
    let layer = e.target;
    layer.setStyle({
      color: "#30D5C8",
      weight: 3,
    });
  };
  const unHighlightFeature = (e: any) => {
    let layer = e.target;
    layer.setStyle({
      color: "#30D5C8",
      weight: 1,
    });
  };

  const polygons = geoJson.features.map((feature: any) => {
    return (
      <Polygon
        color="#30D5C8"
        eventHandlers={{
          mouseover: highlightFeature,
          mouseout: unHighlightFeature,
          click: openSideMenu,
        }}
        positions={feature.geometry.coordinates[0].map((v: number[]) => [
          v[1],
          v[0],
        ])}
      />
    );
  });
  const anchor = "left";
  return (
    <div id="map">
      <div>
        <Drawer anchor={anchor} open={sideMenuOpen} onClose={closeSideMenu}>
          <SideMenu />
        </Drawer>
      </div>
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

function SideMenu(props: any) {
  const [component, setComponent] = useState("location");
  const summary = (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem key={"Location summary"}>
          <ListItemText primary={"Location summary"} />
        </ListItem>
        <Divider />
        <ListItem key={"Info"}>
          <ListItemText primary={"Info"} />
        </ListItem>
        A bunch of information about the project
      </List>
      <Divider />
      <Button variant="contained" onClick={() => setComponent("powerfuel")}>
        Start project design
      </Button>
    </Box>
  );
  const powerfuel = (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem key={"Hydrogen"}>
          <ListItemButton>
            <ListItemText primary={"Hydrogen"} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem key={"Ammonia"}>
          <ListItemButton>
            <ListItemText primary={"Ammonia"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
    </Box>
  );

  return (
    <div>
      {component === "location" && summary}
      {component === "powerfuel" && powerfuel}
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
