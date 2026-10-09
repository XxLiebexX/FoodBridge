'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';
import { Button } from '../../../components/ui/Button';
import { AlertCircle, Eye, EyeOff, User, Mail, Phone, Lock, Building, MapPin, Truck } from 'lucide-react';

export default function SignUpPage() {
  const { register } = useAuth();
  const [role, setRole] = useState<'DONOR' | 'NGO' | 'VOLUNTEER'>('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('RESTAURANT');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Delhi');
  const [vehicleType, setVehicleType] = useState('TWO_WHEELER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        role,
        organizationName: orgName,
        organizationType: orgType,
        address,
        city,
        vehicleType
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 text-2xl mx-auto mb-3 shadow-xs font-bold">
            🍱
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-500 mt-1">Join the FoodBridge AI network to eliminate food waste</p>
        </div>

        {/* Top Switcher: Sign In vs Sign Up */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <Link
            href="/login"
            className="flex-1 py-2 text-center text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-white text-emerald-800 shadow-xs"
          >
            Sign Up
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Select Account Type</label>
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            {(['DONOR', 'NGO', 'VOLUNTEER'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  if (r === 'NGO') setOrgType('COMMUNITY_KITCHEN');
                  if (r === 'DONOR') setOrgType('RESTAURANT');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  role === r ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r === 'DONOR' ? '🍽️ Donor' : r === 'NGO' ? '🏠 NGO' : '🚚 Volunteer'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 px-1">
            {role === 'DONOR' && 'For restaurants, banquet halls, mess kitchens, and cafeterias wanting to donate surplus.'}
            {role === 'NGO' && 'For registered shelters, charity kitchens, and NGOs distributing meals to those in need.'}
            {role === 'VOLUNTEER' && 'For delivery drivers and volunteers helping transport food from donors to shelters.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Gupta"
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98110 02233"
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Conditional Organization / Volunteer Details */}
          {role !== 'VOLUNTEER' ? (
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {role === 'DONOR' ? 'Organization / Restaurant Name' : 'NGO / Shelter Name'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={role === 'DONOR' ? 'Bikanervala Sweets & Restaurant' : 'Robin Hood Army Delhi Hub'}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Type</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {role === 'DONOR' ? (
                      <>
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="HOSTEL_MESS">College Hostel Mess</option>
                        <option value="CAFETERIA">Corporate Cafeteria</option>
                        <option value="EVENT_ORGANIZER">Event Organizer / Banquets</option>
                      </>
                    ) : (
                      <>
                        <option value="COMMUNITY_KITCHEN">Community Kitchen</option>
                        <option value="NGO_SHELTER">Shelter Home</option>
                        <option value="ORPHANAGE">Children Orphanage</option>
                        <option value="OLD_AGE_HOME">Old Age Home</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City (Delhi NCR)</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Noida">Noida</option>
                    <option value="Greater Noida">Greater Noida</option>
                    <option value="Gurugram">Gurugram</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot 12, Sector 62, Commercial Complex"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type for Delivery</label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="TWO_WHEELER">Two-Wheeler (Motorcycle / Scooter)</option>
                  <option value="FOUR_WHEELER">Four-Wheeler (Car / Hatchback)</option>
                  <option value="VAN">Delivery Van / Auto</option>
                </select>
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full py-2.5 mt-4 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs">
            Create FoodBridge Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
