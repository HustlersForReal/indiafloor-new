"use client";

/**
 * Leaflet + OpenStreetMap picker. No API key — geocoding goes through Photon
 * (photon.komoot.io).
 *
 * Tiles come from tile.openstreetmap.de, NOT tile.openstreetmap.org: the
 * official servers reject requests from localhost/dev origins with an HTTP 418
 * "Access blocked" placeholder (which is served with a 200, so it only shows up
 * visually as grey tiles).
 *
 * Sizing is deterministic on purpose: the wrapper is measured with a
 * ResizeObserver and the Leaflet container is only mounted once a real pixel
 * size is known. Percentage heights (`h-full`) let Leaflet initialise against
 * an unresolved box and it never re-measures itself, which renders tiles into
 * a small block instead of filling the area.
 *
 * Must be imported with `dynamic(() => import('./LocationMap'), { ssr: false })`
 * because Leaflet touches `window` at module load.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

const DEFAULT_CENTER: [number, number] = [28.55, 77.25];

/** Service area — Noida, Delhi, Greater Noida, Faridabad, Greater Faridabad,
 *  Gurugram, Ghaziabad. The map cannot be panned or zoomed outside this box. */
const NCR_BOUNDS: L.LatLngBoundsExpression = [
  [28.15, 76.75],
  [28.95, 77.65],
];

const pinIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:999px;background:#314367;border:3px solid #0a1f45;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Belt-and-braces re-measure in case anything shifts after mount. */
function AutoSize({ w, h }: { w: number; h: number }) {
  const map = useMap();

  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false });
    fix();
    const t1 = setTimeout(fix, 120);
    const t2 = setTimeout(fix, 400);
    map.whenReady(fix);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, w, h]);

  return null;
}

/** Moves the map whenever `location` changes (800ms debounced forward-geocode). */
function FlyTo({ location }: { location: string }) {
  const map = useMap();

  useEffect(() => {
    const q = location.trim();
    if (q.length < 3) return;

    const t = setTimeout(() => {
      fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lat=28.55&lon=77.25`,
      )
        .then((r) => r.json())
        .then((data) => {
          const feats: { geometry: { coordinates: [number, number] } }[] =
            data?.features ?? [];
          const inNcr = (c: [number, number]) =>
            c[1] >= 28.15 && c[1] <= 28.95 && c[0] >= 76.75 && c[0] <= 77.65;
          const f = feats.find((ft) => inNcr(ft.geometry.coordinates)) ?? feats[0];
          if (!f) return;
          const [lon, lat] = f.geometry.coordinates;
          map.setView([lat, lon], 14, { animate: false });
        })
        .catch(() => {});
    }, 800);

    return () => clearTimeout(t);
  }, [location, map]);

  return null;
}

/** Reports map clicks upward. */
function ClickCatcher({ onPick }: { onPick: (latlng: L.LatLng) => void }) {
  const map = useMap();

  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onPick(e.latlng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onPick]);

  return null;
}

export default function LocationMap({
  onLocationSelect,
  initialLocation,
}: {
  onLocationSelect: (address: string) => void;
  initialLocation?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [picked, setPicked] = useState<[number, number] | null>(null);

  /* measure the wrapper; Leaflet is mounted only once this resolves */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const read = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) =>
        prev && prev.w === Math.round(r.width) && prev.h === Math.round(r.height)
          ? prev
          : { w: Math.round(r.width), h: Math.round(r.height) },
      );
    };

    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handlePick = useCallback(
    async (latlng: L.LatLng) => {
      const { lat, lng } = latlng;
      if (lat < 28.15 || lat > 28.95 || lng < 76.75 || lng > 77.65) return;
      setPicked([lat, lng]);

      try {
        const res = await fetch(
          `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
        );
        const data = await res.json();
        const f = data?.features?.[0];
        // Photon returns 200 with zero features for unmapped coords — the pin
        // drops but no text is produced, matching the documented behaviour.
        if (!f) return;
        const p = f.properties;
        const parts = [p.name, p.city || p.town || p.village, p.state, p.country];
        onLocationSelect(parts.filter(Boolean).join(", "));
      } catch {
        onLocationSelect(`Pinned at ${lat}, ${lng}`);
      }
    },
    [onLocationSelect],
  );

  return (
    <div
      ref={wrapRef}
      className="relative z-0 overflow-hidden rounded-lg border border-border"
      style={{ height: 220 }}
    >
      {size && size.w > 0 && size.h > 0 && (
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={11}
          minZoom={10}
          maxBounds={NCR_BOUNDS}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          attributionControl={true}
          style={{ width: size.w, height: size.h }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <AutoSize w={size.w} h={size.h} />
          <ClickCatcher onPick={handlePick} />
          <FlyTo location={initialLocation ?? ""} />
          {picked && <Marker position={picked} icon={pinIcon} />}
        </MapContainer>
      )}
    </div>
  );
}