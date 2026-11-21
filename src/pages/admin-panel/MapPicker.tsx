import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { rasterFallbackFor, tileLayerOptions } from '@/lib/map-tiles'

interface Props {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

// Plain raster basemap: this admin picker is a small static map, so it has no
// use for a themed basemap.
const BASEMAP = rasterFallbackFor('standard')

function ClickHandler({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPicker({ lat, lng, onChange }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className="h-[300px] w-full rounded-md border"
    >
      <TileLayer url={BASEMAP.url} {...tileLayerOptions(BASEMAP)} />
      <ClickHandler onChange={onChange} />
      <Marker position={[lat, lng]} />
    </MapContainer>
  )
}
