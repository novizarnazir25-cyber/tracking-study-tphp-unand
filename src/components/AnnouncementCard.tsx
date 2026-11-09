'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Edit3,
  Calendar,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import EditAnnouncementModal from './EditAnnouncementModal';

interface Props {
  variant?: 'dashboard' | 'login';
  initialData?: any;
  userRole?: string;
}

export default function AnnouncementCard({ variant = 'dashboard', initialData, userRole }: Props) {
  const [announcement, setAnnouncement] = useState<any>(initialData || null);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch('/api/announcement');
      const data = await res.json();
      if (res.ok && data.data) {
        setAnnouncement(data.data);
        setCanEdit(Boolean(data.canEdit));
      }
    } catch (e) {
      console.error('Error fetching announcement:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs animate-pulse text-xs text-slate-400">
        Memuat pengumuman program studi...
      </div>
    );
  }

  if (!announcement) return null;

  // If hidden and user is not editor, do not display
  if (!announcement.isActive && !canEdit) {
    return null;
  }

  const isImportant =
    announcement.badge?.toLowerCase().includes('penting') ||
    announcement.badge?.toLowerCase().includes('urgent') ||
    announcement.badge?.toLowerCase().includes('batas');

  return (
    <>
      <div
        className={`rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden ${
          variant === 'login'
            ? 'bg-gradient-to-br from-slate-900/95 via-unand-950/95 to-slate-900/95 border-gold-500/40 text-white'
            : 'bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 border-emerald-600/30 text-slate-900 hover:border-emerald-600/50'
        }`}
      >
        {/* Floating Success Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 border-b border-emerald-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-white/80 hover:text-white text-xs"
            >
              &times;
            </button>
          </div>
        )}

        {/* Not Active Warning for Editor */}
        {!announcement.isActive && canEdit && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-200">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              Status: Disembunyikan dari civitas akademika umum (Hanya terlihat oleh Anda sebagai Ketua Prodi / Admin).
            </span>
            <button
              onClick={() => setShowEditModal(true)}
              className="underline hover:text-amber-950 font-bold ml-2"
            >
              Aktifkan Kembali
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-xs uppercase tracking-wider shadow-2xs ${
                  variant === 'login'
                    ? 'bg-gold-500 text-slate-950'
                    : 'bg-unand-800 text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 animate-pulse" />
                <span>Pengumuman</span>
              </div>

              {announcement.badge && (
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                    isImportant
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : variant === 'login'
                      ? 'bg-white/10 text-emerald-300 border-white/20'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}
                >
                  {announcement.badge}
                </span>
              )}

              <span
                className={`text-[11px] font-medium hidden sm:inline-flex items-center gap-1 ${
                  variant === 'login' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Diperbarui: {announcement.updatedAt}</span>
              </span>
            </div>

            {/* Action Buttons: Edit (for Ketua Prodi) & Expand */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition ${
                    variant === 'login'
                      ? 'bg-gold-500 hover:bg-gold-400 text-slate-950'
                      : 'bg-gold-500 hover:bg-gold-400 text-slate-950 hover:shadow-xs'
                  }`}
                  title="Perbarui isi pengumuman (Wewenang Ketua Program Studi)"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Perbarui Pengumuman</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-lg transition ${
                  variant === 'login'
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={isExpanded ? 'Ciutkan Pengumuman' : 'Buka Pengumuman'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Announcement Body */}
          {isExpanded && (
            <div className="space-y-3 pt-1">
              <h3
                className={`font-black text-base sm:text-lg leading-snug tracking-tight ${
                  variant === 'login' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {announcement.title}
              </h3>

              <div
                className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line rounded-2xl p-4 sm:p-5 border ${
                  variant === 'login'
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-white/80 border-slate-200/80 text-slate-800'
                }`}
              >
                {announcement.content}
              </div>

              {/* Signature / Attribution Bar */}
              <div
                className={`pt-3 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
                  variant === 'login'
                    ? 'border-white/10 text-slate-400'
                    : 'border-slate-200/80 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      variant === 'login'
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                        : 'bg-unand-100 text-unand-900 border border-unand-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`font-bold block ${
                        variant === 'login' ? 'text-gold-300' : 'text-slate-900'
                      }`}
                    >
                      {announcement.authorName || 'Prof. Dr. Novizar Nazir'}
                    </span>
                    <span className="text-[11px] block opacity-80">
                      {announcement.authorRole || 'Ketua Program Studi TPHP'}
                    </span>
                  </div>
                </div>

                <div
                  className={`text-[11px] sm:hidden flex items-center gap-1 ${
                    variant === 'login' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{announcement.updatedAt}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal for Ketua Prodi */}
      {showEditModal && (
        <EditAnnouncementModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          announcement={announcement}
          onSuccess={(updated) => {
            setAnnouncement(updated);
            setSuccessToast('Pengumuman berhasil diperbarui dan ditayangkan!');
            setTimeout(() => setSuccessToast(null), 5000);
          }}
        />
      )}
    </>
  );
}
