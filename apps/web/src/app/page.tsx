'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Truck,
  Heart,
  Award,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const { quickDemoLogin } = useAuth();
  const [impact, setImpact] = useState<any>({
    foodRescuedKg: 0,
    mealsProvided: 0,
    wastePreventedKg: 0,
    co2SavedKg: 0,
    activeDonors: 0,
    activeNGOs: 0,
    activeVolunteers: 0
  });

  useEffect(() => {
    api.get('/impact/overview')
      .then((data) => setImpact(data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-radial-[at_50%_0%] from-emerald-50 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-6 border border-emerald-300/60 shadow-xs animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Driven Food Redistribution Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Turn Surplus Food Into <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-700">Someone&apos;s Next Meal.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            FoodBridge AI connects restaurants, college cafeterias, and event organizers with verified hunger relief shelters — intelligently, locally, and in real time.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard/donor/create"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Donate Surplus Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/map"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs hover:shadow-sm transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Explore Rescue Map</span>
            </Link>

            <button
              onClick={() => quickDemoLogin('donor')}
              className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs"
            >
              ⚡ Instant 1-Click Demo
            </button>
          </div>

          {/* Hero Visual Flow Pipeline: Donor -> AI Matching -> NGO -> People */}
          <div className="mt-16 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 text-left">
              The Real-Time FoodBridge Rescue Pipeline
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-3xl mb-2">🍽️</span>
                <span className="text-sm font-bold text-slate-900">1. Surplus Reported</span>
                <span className="text-[11px] text-slate-500 mt-1">Taj Palace logs 25 kg Paneer Rice (62 meals)</span>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 relative">
                <span className="text-3xl mb-2">🧠</span>
                <span className="text-sm font-bold text-emerald-900">2. AI Matching Engine</span>
                <span className="text-[11px] text-slate-500 mt-1">6-factor scoring: 2.3 km away, 95% fit score</span>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-3xl mb-2">🏠</span>
                <span className="text-sm font-bold text-slate-900">3. Shelter Accepts</span>
                <span className="text-[11px] text-slate-500 mt-1">Robin Hood Army accepts in 1 click</span>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-3xl mb-2">🚚</span>
                <span className="text-sm font-bold text-slate-900">4. Rescued & Served</span>
                <span className="text-[11px] text-slate-500 mt-1">Volunteer delivers with verified receipt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE IMPACT COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 relative z-20">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Database Impact Engine</span>
              <h2 className="text-2xl font-bold mt-1">Real-Time City Food Rescue Metrics</h2>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>View In-Depth Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-l-2 border-emerald-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {impact.foodRescuedKg.toLocaleString()} <span className="text-lg font-bold text-emerald-400">kg</span>
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">🌱 Food Rescued</p>
            </div>

            <div className="border-l-2 border-emerald-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {impact.mealsProvided.toLocaleString()}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">🍱 Wholesome Meals Provided</p>
            </div>

            <div className="border-l-2 border-teal-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {impact.wastePreventedKg.toLocaleString()} <span className="text-lg font-bold text-teal-400">kg</span>
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">♻️ Landfill Waste Prevented</p>
            </div>

            <div className="border-l-2 border-teal-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {impact.co2SavedKg.toLocaleString()} <span className="text-lg font-bold text-teal-400">kg</span>
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">☁️ CO₂ Emissions Mitigated</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Simple & Fast</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">How FoodBridge AI Works</h2>
          <p className="mt-3 text-slate-600 text-sm">
            Bridging the gap between surplus and scarcity with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Donors Post Surplus</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Restaurants, banquet halls, or college mess teams input surplus quantity, dietary type, and consume-before time in under 60 seconds.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Calculates Best Fit</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Our 6-factor matching engine evaluates proximity, capacity, urgency, and dietary compatibility to recommend the highest-suitability shelter.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Volunteer Dispatch & Delivery</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Nearby volunteers accept pickup orders, deliver safely with digital proof, and immediately update live impact metrics across the platform.
            </p>
          </div>
        </div>
      </section>

      {/* 4. AI & ML PREDICTIVE POWERS */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Machine Learning Regressors</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Predict Surplus & Prevent Waste Before It Happens
              </h2>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Trained on realistic Delhi NCR restaurant footfall, weather, holidays, and banquet events, FoodBridge models forecast upcoming surplus and demand trajectories up to 30 days in advance.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700"><strong>RandomForest & GradientBoosting:</strong> $R^2 &gt; 0.80$ accuracy on historical kitchen yield patterns.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700"><strong>Explainable Predictions:</strong> Human-readable factor drivers for every recommendation.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700"><strong>Zero-Downtime Fallback:</strong> Automatic algorithmic failover ensures 100% operational continuity.</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard/ai"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  <span>Explore AI Prediction Forecasts</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase">Live Model Preview</div>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active ML Service
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Sample Donor:</span>
                  <span className="font-bold text-slate-800">Casual Dining (220 patrons, Friday)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Predicted Surplus:</span>
                  <span className="font-bold text-emerald-600 text-sm">18.4 kg (15.2 - 22.7 kg)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="font-bold text-slate-800">88%</span>
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                  💡 <em>&quot;Surplus elevated due to weekend evening dining footfall peak (+22%) and buffet prep buffer.&quot;</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="bg-linear-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-10 sm:p-14 shadow-xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Ready to Rescue Food in Your Neighborhood?
          </h2>
          <p className="mt-4 text-emerald-100 max-w-lg mx-auto text-sm sm:text-base">
            Join restaurants, college messes, NGOs, and delivery heroes fighting food waste and hunger today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow-md hover:bg-slate-100 transition-colors"
            >
              Create Free Account
            </Link>
            <button
              onClick={() => quickDemoLogin('ngo')}
              className="px-6 py-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-semibold text-sm border border-emerald-400/40 transition-colors"
            >
              Test as Shelter NGO (1-Click)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
