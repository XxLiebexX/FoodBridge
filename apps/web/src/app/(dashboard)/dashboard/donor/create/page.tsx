'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/authContext';
import { Button } from '../../../../../components/ui/Button';
import { MatchScoreBadge } from '../../../../../components/ai/MatchScoreBadge';
import {
  MEAL_CONVERSION_FACTORS,
  FoodCategory,
  QuantityUnit,
  DietaryType,
  PackagingStatus,
  ALLERGEN_OPTIONS
} from '../../../../../lib/shared';
import { Sparkles, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreateDonationPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>(FoodCategory.COOKED_MEALS);
  const [quantity, setQuantity] = useState<number>(25);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.KG);
  const [vegType, setVegType] = useState<DietaryType>(DietaryType.VEGETARIAN);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [packagingStatus, setPackagingStatus] = useState<PackagingStatus>(PackagingStatus.SEALED_CONTAINERS);

  // Time handling (default 5 hours from now)
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState<number>(5);
  const [pickupAddress, setPickupAddress] = useState(user?.organization?.address || '');
  const [latitude, setLatitude] = useState<number>(user?.organization?.latitude || 28.6139);
  const [longitude, setLongitude] = useState<number>(user?.organization?.longitude || 77.2090);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [nearbyNGOs, setNearbyNGOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated meals
  const factor = MEAL_CONVERSION_FACTORS[category] || 2.5;
  const estimatedMeals = Math.round((quantity || 0) * factor);

  // Fetch nearby NGOs
  useEffect(() => {
    api.get(`/ngos/nearby?lat=${latitude}&lon=${longitude}&radius=20`)
      .then((data) => setNearbyNGOs(data.slice(0, 4)))
      .catch(() => {});
  }, [latitude, longitude]);

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const now = new Date();
      const availableFrom = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins
      const consumeBefore = new Date(availableFrom.getTime() + hoursUntilExpiry * 60 * 60 * 1000);

      await api.post('/donations', {
        foodName,
        category,
        quantity: Number(quantity),
        quantityUnit,
        vegType,
        allergens: selectedAllergens,
        preparationTime: now.toISOString(),
        availableFrom: availableFrom.toISOString(),
        consumeBefore: consumeBefore.toISOString(),
        packagingStatus,
        pickupAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
        specialInstructions
      });

      router.push('/dashboard/donor');
    } catch (err: any) {
      setError(err.message || 'Failed to list food donation');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo auto-fill preset
  const loadDemoPreset = () => {
    setFoodName('Paneer Rice & Dal Makhani');
    setCategory(FoodCategory.COOKED_MEALS);
    setQuantity(25);
    setVegType(DietaryType.VEGETARIAN);
    setHoursUntilExpiry(5);
    setPackagingStatus(PackagingStatus.SEALED_CONTAINERS);
    setSelectedAllergens(['Dairy / Milk']);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Log Surplus Food Donation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            AI immediately computes meal equivalents and matches nearby recipient shelters
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoPreset}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fill Demo Spec (25 kg Paneer Rice)</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            1. Food Item & Category
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Food Item Name</label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Paneer Rice & Dal Makhani"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Food Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={FoodCategory.COOKED_MEALS}>Cooked Meals</option>
                <option value={FoodCategory.RAW_PRODUCE}>Raw Produce / Fruits</option>
                <option value={FoodCategory.BAKERY}>Bakery Items</option>
                <option value={FoodCategory.PACKAGED_GOODS}>Packaged Dry Goods</option>
                <option value={FoodCategory.DAIRY}>Dairy / Milk</option>
                <option value={FoodCategory.BEVERAGES}>Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Preference</label>
              <select
                value={vegType}
                onChange={(e) => setVegType(e.target.value as DietaryType)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={DietaryType.VEGETARIAN}>🟢 Vegetarian (Veg)</option>
                <option value={DietaryType.NON_VEGETARIAN}>🔴 Non-Vegetarian (Non-Veg)</option>
                <option value={DietaryType.VEGAN}>🌱 100% Plant-Based Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Surplus Quantity</label>
              <input
                type="number"
                required
                min={1}
                step={0.5}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Unit</label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value as QuantityUnit)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={QuantityUnit.KG}>Kilograms (kg)</option>
                <option value={QuantityUnit.LITERS}>Liters (L)</option>
                <option value={QuantityUnit.PACKETS}>Packets</option>
                <option value={QuantityUnit.TRAYS}>Bulk Trays</option>
              </select>
            </div>

            {/* Live Meal Conversion Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Calculated Meals Rescued
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5">
                ~{estimatedMeals} <span className="text-xs font-bold">portions</span>
              </span>
              <span className="text-[10px] text-slate-500">Conversion: {factor} meals / {quantityUnit.toLowerCase()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Allergens Present</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {allergen}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Timing & Packaging */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Timing, Expiry & Packaging
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consume Before (Expiry Window)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={hoursUntilExpiry}
                  onChange={(e) => setHoursUntilExpiry(parseInt(e.target.value, 10) || 1)}
                  className="w-24 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600 font-medium">hours from now</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">System flags emergency rescue if &lt; 6 hours</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging Condition</label>
              <select
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value as PackagingStatus)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={PackagingStatus.SEALED_CONTAINERS}>Sealed Containers / Trays</option>
                <option value={PackagingStatus.BULK_TRAYS}>Insulated Bulk Catering Vessels</option>
                <option value={PackagingStatus.INDIVIDUAL_PACKS}>Individually Packed Boxes</option>
                <option value={PackagingStatus.UNPACKAGED}>Requires Repackaging / Own Containers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Address</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Instructions for Volunteers</label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 3. Nearby Shelters Preview */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Nearby Shelters in Service Range</span>
            </div>
            <span className="text-[11px] text-slate-500">{nearbyNGOs.length} verified hubs nearby</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {nearbyNGOs.map((ngo) => (
              <div key={ngo.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">{ngo.name}</div>
                  <div className="text-[10px] text-slate-500">{ngo.address}</div>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  {ngo.distanceKm} km
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/donor')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} size="lg">
            Post Donation & Calculate Matches 🚀
          </Button>
        </div>
      </form>
    </div>
  );
}
