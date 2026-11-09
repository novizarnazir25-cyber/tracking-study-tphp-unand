'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import KataPengantarSection from '@/components/KataPengantarSection';
import { ArrowLeft, Quote, HeartHandshake, Home } from 'lucide-react';

export default function KataPengantarPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [demoCount, setDemoCount] = useState(0);

  const fetchAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
      const demoRes = await fetch('/api/demo/toggle');
      if (demoRes.ok) {
        const demoData = await demoRes.json();
        setDemoCount(demoData.demoCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={currentUser} onUserSwitch={(u) => setCurrentUser(u)} />
      {demoCount > 0 && <DemoBanner demoCount={demoCount} onRefresh={fetchAuth} />}

      <div className="flex flex-1">
        <Sidebar userRole={currentUser?.role || 'DOSEN'} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Top Breadcrumb & Back to Home */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-unand-800 hover:bg-slate-50 transition shadow-2xs"
            >
              <Home className="w-4 h-4 text-unand-800" />
              <span>&larr; Kembali ke Beranda / Halaman Utama</span>
            </Link>
          </div>

          {/* Kata Pengantar Card Component */}
          <KataPengantarSection />
        </main>
      </div>
    </div>
  );
}
