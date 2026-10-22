"use client";

import { useEffect, useRef, type JSX } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "../lib/geo";

export type RideMapProps = {
  pickup: LatLng | null;
  dropoff: LatLng | null;
  height?: number;
  className?: string;
  interactive?: boolean;
  onPickupMove?: (p: LatLng) => void;
  onDropoffMove?: (p: LatLng) => void;
};

const DEFAULT_HEIGHT = 220;
const GREATER_ACCRA: L.LatLngTuple = [5.6037, -0.1870];

function cssToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = window
    .getComputedStyle(window.document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function roundedPoint(latlng: L.LatLng): LatLng {
  return {
    lat: Math.round(latlng.lat * 1e5) / 1e5,
    lng: Math.round(latlng.lng * 1e5) / 1e5,
  };
}

function dotIcon(kind: "pickup" | "dropoff"): L.DivIcon {
  const color = kind === "pickup" ? "var(--color-brand)" : "var(--color-brand-strong)";
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid var(--color-surface);box-shadow:0 2px 6px rgba(0,0,0,0.25)"></span>`,
  });
}

export default function RideMap(props: RideMapProps): JSX.Element {
  const {
    pickup,
    dropoff,
    height = DEFAULT_HEIGHT,
    className,
    interactive = true,
    onPickupMove,
    onDropoffMove,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const onPickupMoveRef = useRef(onPickupMove);
  const onDropoffMoveRef = useRef(onDropoffMove);

  useEffect(() => {
    onPickupMoveRef.current = onPickupMove;
    onDropoffMoveRef.current = onDropoffMove;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      zoomControl: interactive,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      subdomains: "abc",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      try {
        map.remove();
      } catch {
        if (process.env.NODE_ENV !== "production") {
          console.warn("RideMap: failed to remove Leaflet map on unmount");
        }
      }
      mapRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      polylineRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const frame = window.requestAnimationFrame(() => map.invalidateSize());
      return () => window.cancelAnimationFrame(frame);
    }
  }, [height]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const brandColor = cssToken("--color-brand", "#0e7490");

    if (pickup) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], {
          icon: dotIcon("pickup"),
          draggable: interactive,
        }).addTo(map);
        pickupMarkerRef.current.on("dragend", () => {
          const marker = pickupMarkerRef.current;
          if (marker) onPickupMoveRef.current?.(roundedPoint(marker.getLatLng()));
        });
      }
      if (interactive) pickupMarkerRef.current.dragging?.enable();
      else pickupMarkerRef.current.dragging?.disable();
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    if (dropoff) {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], {
          icon: dotIcon("dropoff"),
          draggable: interactive,
        }).addTo(map);
        dropoffMarkerRef.current.on("dragend", () => {
          const marker = dropoffMarkerRef.current;
          if (marker) onDropoffMoveRef.current?.(roundedPoint(marker.getLatLng()));
        });
      }
      if (interactive) dropoffMarkerRef.current.dragging?.enable();
      else dropoffMarkerRef.current.dragging?.disable();
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    if (pickup && dropoff) {
      polylineRef.current?.remove();
      polylineRef.current = L.polyline(
        [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
        {
          color: brandColor,
          weight: 3,
          opacity: 0.7,
          dashArray: "6 8",
        },
      ).addTo(map);
      map.fitBounds(polylineRef.current.getBounds(), { padding: [48, 48] });
      return;
    }

    polylineRef.current?.remove();
    polylineRef.current = null;

    const anchor = pickup ?? dropoff;
    if (anchor) {
      map.setView([anchor.lat, anchor.lng], 12);
    } else {
      map.setView(GREATER_ACCRA, 12);
    }
  }, [pickup, dropoff, interactive]);

  return (
    <div
      className={`w-full overflow-hidden rounded-[16px] border border-border bg-surface ${className ?? ""}`}
      style={{ height }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
