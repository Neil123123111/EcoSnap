import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

type Report = {
  id: string;
  severity: string;
  location: [number, number];
};

const MapView = ({ reports }: { reports: Report[] }) => {
  return (
    <MapContainer
      center={[10.8231, 106.6297]}
      zoom={13}
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports.map((r) => (
        <Marker key={r.id} position={r.location}>
          <Popup>
            Severity: <b>{r.severity}</b>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;