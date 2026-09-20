import mapboxgl from 'mapbox-gl';

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!accessToken || accessToken === 'YOUR_PUBLIC_MAPBOX_TOKEN') {
  console.warn(
    '[Mapbox] VITE_MAPBOX_ACCESS_TOKEN is missing. Add a public Mapbox token to the root .env file.'
  );
} else {
  mapboxgl.accessToken = accessToken;
}

export default mapboxgl;
