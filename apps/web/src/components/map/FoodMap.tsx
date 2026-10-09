'use client';

import React, { useEffect, useRef } from 'react';

export interface MapMarkerItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  type: 'DONOR' | 'NGO' | 'DONATION' | 'DELIVERY';
  lat: number;
  lng: number;
  quantity?: number;
  unit?: string;
  status?: string;
  address?: string;
}

interface FoodMapProps {
  items: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function FoodMap({
  items,
  center = [28.6139, 77.2090], // Delhi NCR center
  zoom = 11,
  className = 'h-[500px]'
}: FoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Marker icons based on type
      const createCustomIcon = (bgColor: string, symbol: string) => {
        return L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="
            background: ${bgColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            border: 2px solid white;
          ">${symbol}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
      };

      const icons = {
        DONOR: createCustomIcon('#f97316', '🍽️'),
        NGO: createCustomIcon('#3b82f6', '🏠'),
        DONATION: createCustomIcon('#10b981', '🍱'),
        DELIVERY: createCustomIcon('#8b5cf6', '🚚')
      };

      // Add markers
      items.forEach((item) => {
        if (!item.lat || !item.lng) return;

        const icon = icons[item.type] || icons.DONATION;
        const marker = L.marker([item.lat, item.lng], { icon }).addTo(map);

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 2px;">
              ${item.type.replace('_', ' ')}
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
              ${item.title}
            </div>
            ${item.subtitle ? `<div style="font-size: 12px; color: #475569; margin-bottom: 4px;">${item.subtitle}</div>` : ''}
            ${item.quantity ? `<div style="font-size: 12px; font-weight: 600; color: #059669; margin-bottom: 4px;">Quantity: ${item.quantity} ${item.unit || 'kg'}</div>` : ''}
            ${item.status ? `<div style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; display: inline-block;">${item.status}</div>` : ''}
            ${item.address ? `<div style="font-size: 11px; color: #64748b; margin-top: 6px;">📍 ${item.address}</div>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [items, center, zoom]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
