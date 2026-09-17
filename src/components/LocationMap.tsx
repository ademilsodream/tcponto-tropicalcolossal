import React, { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  height?: number;
}

// Distância mínima (em graus aprox. ~10m) para mover o mapa.
const MOVE_THRESHOLD_DEG = 0.0001;

// Lightweight loader for Leaflet from CDN to avoid npm dependency
const loadLeaflet = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.L) return resolve(w.L);

    const cssId = 'leaflet-css-cdn';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const scriptId = 'leaflet-js-cdn';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.body.appendChild(script);
    }
    if ((window as any).L) return resolve((window as any).L);
    script.addEventListener('load', () => resolve((window as any).L));
    script.addEventListener('error', () => reject(new Error('Falha ao carregar o mapa')));
  });
};

const LocationMapBase: React.FC<LocationMapProps> = ({ latitude, longitude, zoom = 16, className, height = 300 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const lastViewRef = useRef<{ lat: number; lng: number } | null>(null);
  const [failed, setFailed] = useState(false);
  // O mapa é montado só depois do conteúdo principal aparecer.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || !L) return;

        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, { zoomControl: false, attributionControl: false })
            .setView([latitude, longitude], zoom);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
          markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
          lastViewRef.current = { lat: latitude, lng: longitude };
          return;
        }

        const last = lastViewRef.current;
        const moved =
          !last ||
          Math.abs(last.lat - latitude) > MOVE_THRESHOLD_DEG ||
          Math.abs(last.lng - longitude) > MOVE_THRESHOLD_DEG;
        if (!moved) return;

        lastViewRef.current = { lat: latitude, lng: longitude };
        mapRef.current.setView([latitude, longitude], zoom);
        markerRef.current?.setLatLng([latitude, longitude]);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, latitude, longitude, zoom]);

  // Destruir o mapa ao sair da tela (evita acumular instâncias e travar o app).
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
        markerRef.current = null;
        lastViewRef.current = null;
      }
    };
  }, []);

  if (failed) {
    return (
      <div
        className={`${className ?? ''} flex items-center justify-center bg-muted text-muted-foreground text-sm`}
        style={{ width: '100%', height }}
      >
        Mapa indisponível — {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${className ?? ''} relative z-0 bg-muted`}
      style={{ width: '100%', height, pointerEvents: 'auto' }}
    />
  );
};

export const LocationMap = React.memo(LocationMapBase);

export default LocationMap;
