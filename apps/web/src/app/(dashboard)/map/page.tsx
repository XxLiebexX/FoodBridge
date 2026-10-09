'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '../../../lib/api';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { MapMarkerItem } from '../../../components/map/FoodMap';
import { Filter, Layers, MapPin } from 'lucide-react';

// Dynamic import with ssr: false for Leaflet
const FoodMap = dynamic(() => import('../../../components/map/FoodMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-400">
      Loading interactive OpenStreetMap...
    </div>
  )
});

export default function MapPage() {
  const [markers, setMarkers] = useState<MapMarkerItem[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'DONATION' | 'NGO' | 'DONOR'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [donations, ngos, donors] = await Promise.all([
          api.get('/donations?limit=50'),
          api.get('/ngos'),
          api.get('/admin/organizations?type=RESTAURANT')
        ]);

        const items: MapMarkerItem[] = [];

        // Available / Active Food Donations
        donations.forEach((d: any) => {
          if (d.latitude && d.longitude) {
            items.push({
              id: d.id,
              title: d.foodName,
              subtitle: d.donorOrg?.name || 'Local Kitchen',
              type: 'DONATION',
              category: d.category,
              lat: d.latitude,
              lng: d.longitude,
              quantity: d.quantity,
              unit: d.quantityUnit,
              status: d.status,
              address: d.pickupAddress
            });
          }
        });

        // NGOs
        ngos.forEach((n: any) => {
          if (n.latitude && n.longitude) {
            items.push({
              id: n.id,
              title: n.name,
              subtitle: `Beneficiaries: ${n.ngoProfile?.capacityPeople || 50} people`,
              type: 'NGO',
              lat: n.latitude,
              lng: n.longitude,
              status: n.verifiedStatus,
              address: n.address
            });
          }
        });

        // Donors
        donors.forEach((dn: any) => {
          if (dn.latitude && dn.longitude) {
            items.push({
              id: dn.id,
              title: dn.name,
              subtitle: dn.type,
              type: 'DONOR',
              lat: dn.latitude,
              lng: dn.longitude,
              address: dn.address
            });
          }
        });

        setMarkers(items);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  const filteredMarkers = markers.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Live Food Rescue Operations Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial distribution of surplus food, shelter demand, and delivery routes in Delhi NCR
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs self-start sm:self-auto">
          {(
            [
              { key: 'ALL', label: 'All Markers' },
              { key: 'DONATION', label: '🍱 Surplus Food' },
              { key: 'NGO', label: '🏠 Shelter Hubs' },
              { key: 'DONOR', label: '🍽️ Food Donors' }
            ] as const
          ).map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilterType(btn.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === btn.key ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white shadow-xs inline-block" />
          <span>Surplus Food Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white shadow-xs inline-block" />
          <span>Shelter & NGO Hubs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-white shadow-xs inline-block" />
          <span>Registered Donors (Restaurants/Mess)</span>
        </div>
      </div>

      {/* Main Map */}
      <div className="w-full">
        {loading ? (
          <div className="h-[600px] w-full rounded-2xl bg-slate-100 animate-pulse" />
        ) : (
          <FoodMap
            items={filteredMarkers}
            center={[28.6139, 77.2090]}
            zoom={11}
            className="h-[600px]"
          />
        )}
      </div>
    </div>
  );
}
