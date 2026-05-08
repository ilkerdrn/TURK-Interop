import React, { useState } from 'react';
import { useCrises } from './hooks/useCrises';
import StatCard from './components/StatCard';
import FilterBar from './components/FilterBar';
import CrisisTable from './components/CrisisTable';
import AddCrisisForm from './components/AddCrisisForm';
import CountrySummary from './components/CountrySummary';
import ScenarioPanel from './components/ScenarioPanel';
import NormalizerPanel from './components/NormalizerPanel';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import SimulatorPanel from './components/SimulatorPanel';
import CrisisMode from './crisis/CrisisMode';

export default function App() {
  const [filters, setFilters]       = useState({ country: '', event_type: '', severity: '', status: '' });
  const [showForm, setShowForm]     = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);

  const {
    crises, summary,
    loading, error,
    submitting, submitError,
    refetch, addCrisis, updateCrisis,
    clearSubmitError
  } = useCrises(filters);

  const handleResolve = (id) => updateCrisis(id, { status: 'resolved' });

  const handleCloseForm = () => {
    clearSubmitError();
    setShowForm(false);
  };

  const activeCrises   = crises.filter(c => c.status === 'active').length;
  const criticalCrises = crises.filter(c => c.severity === 'critical').length;
  const totalAffected  = crises.reduce((sum, c) => sum + (c.affected_people || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900">
      {crisisMode && <CrisisMode onExit={() => setCrisisMode(false)} />}
      {/* Navbar */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌍</span>
            <span className="font-bold text-slate-100 tracking-tight">TURK Interop</span>
            <span className="hidden sm:block text-slate-500 text-sm">Kriz Koordinasyon Paneli</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrisisMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 0 12px rgba(220,38,38,0.4)' }}
            >
              🔴 KRİZ MODU
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-semibold text-white transition-colors"
            >
              <span>+</span> Yeni Olay
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Fetch hatası */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between gap-3">
            <span>⚠️ {error}</span>
            <button onClick={refetch}
              className="text-xs px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* İstatistik kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Toplam Olay"     value={summary?.total_events ?? crises.length} color="text-sky-400" />
          <StatCard label="Aktif"           value={activeCrises}   color="text-orange-400" />
          <StatCard label="Kritik"          value={criticalCrises} color="text-red-400" />
          <StatCard label="Etkilenen Nüfus" value={totalAffected.toLocaleString('tr-TR')} color="text-violet-400" />
        </div>

        {/* Ülke özeti */}
        {summary && <CountrySummary summary={summary} />}

        {/* Filtreler */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <FilterBar filters={filters} onChange={setFilters} onRefresh={refetch} loading={loading} />
        </div>

        {/* Modül 1 — Afet Senaryoları */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            🎯 Modül 1 — Afet Senaryoları
          </h2>
          <ScenarioPanel />
        </div>

        {/* Modül 2 — Ortak Veri Modeli */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            🧩 Modül 2 — Ortak Veri Modeli (INTEROP CORE)
          </h2>
          <NormalizerPanel />
        </div>

        {/* Modül 3 — AI Analiz Motoru */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            🤖 Modül 3 — AI Analiz Motoru
          </h2>
          <AIAnalysisPanel />
        </div>

        {/* Modül 5 — Simülasyon */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            🎲 Modül 5 — Kriz Simülasyonu
          </h2>
          <SimulatorPanel />
        </div>

        {/* Tablo */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-400">
              {loading
                ? <span className="flex items-center gap-2"><span className="animate-spin">↻</span> Yükleniyor...</span>
                : `${crises.length} olay listeleniyor`
              }
            </h2>
          </div>
          <CrisisTable crises={crises} onResolve={handleResolve} canEdit={true} />
        </div>

      </main>

      {/* Form modal */}
      {showForm && (
        <AddCrisisForm
          onAdd={addCrisis}
          onClose={handleCloseForm}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </div>
  );
}
