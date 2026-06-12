
import React, { useState } from 'react';

type TemplateType = 'affiliate' | 'match' | 'i18n';

export default function SupabaseFormEngine() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('affiliate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Form States
  const [affiliateData, setAffiliateData] = useState({ name: '', category: 'Marketing', commission: '10' });
  const [matchData, setMatchData] = useState({ homeTeam: '', awayTeam: '', location: '', pitchTime: '' });
  const [i18nData, setI18nData] = useState({ locale: 'en', textKey: '', translation: '' });

  // Dynamically generate the preview payload based on active selection
  const getPayload = () => {
    switch (activeTemplate) {
      case 'affiliate': return affiliateData;
      case 'match': return matchData;
      case 'i18n': return i18nData;
    }
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate validation and safe Supabase write pipeline
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      // Reset status message after a few seconds
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 text-slate-100 shadow-2xl font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SignalBoost Database Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1">Write structured data directly to Supabase schemas without spreadsheet tables.</p>
        </div>
        
        {/* Template Controller Tabs */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 self-start">
          {(['affiliate', 'match', 'i18n'] as TemplateType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setActiveTemplate(type); setSubmitStatus('idle'); }}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 capitalize ${
                activeTemplate === type 
                  ? 'bg-blue-600/30 border border-blue-500/30 text-blue-400 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'i18n' ? 'i18n Matrix' : `${type} Form`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Dynamic Form Configuration */}
        <form onSubmit={handleSimulatedSubmit} className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {activeTemplate === 'affiliate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Partner Brand Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Acme Corp Systems"
                  value={affiliateData.name}
                  onChange={(e) => setAffiliateData({...affiliateData, name: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Industry Category</label>
                  <select 
                    value={affiliateData.category}
                    onChange={(e) => setAffiliateData({...affiliateData, category: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option>Marketing</option>
                    <option>SaaS Infrastructure</option>
                    <option>Developer Tools</option>
                    <option>Fintech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Commission Split</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={affiliateData.commission}
                      onChange={(e) => setAffiliateData({...affiliateData, commission: e.target.value})}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-slate-500">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTemplate === 'match' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Home Team (Várzea)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Botafogo do Jacanã"
                    value={matchData.homeTeam}
                    onChange={(e) => setMatchData({...matchData, homeTeam: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Away Team (Várzea)</label>
                  <input 
                    type="text" 
                    placeholder="Opponent Team"
                    value={matchData.awayTeam}
                    onChange={(e) => setMatchData({...matchData, awayTeam: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pitch Compound Location</label>
                <input 
                  type="text" 
                  placeholder="e.g., Campo do Jabaquara, São Paulo"
                  value={matchData.location}
                  onChange={(e) => setMatchData({...matchData, location: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kickoff Schedule</label>
                <input 
                  type="datetime-local" 
                  value={matchData.pitchTime}
                  onChange={(e) => setMatchData({...matchData, pitchTime: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 text-white"
                  required
                />
              </div>
            </div>
          )}

          {activeTemplate === 'i18n' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Locale Standard</label>
                  <select 
                    value={i18nData.locale}
                    onChange={(e) => setI18nData({...i18nData, locale: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="en">🇺🇸 en (English)</option>
                    <option value="es">🇲🇽 es (Spanish)</option>
                    <option value="pt">🇧🇷 pt (Portuguese)</option>
                    <option value="pl">🇵🇱 pl (Polish)</option>
                    <option value="ru">🇷🇺 ru (Russian)</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Global String Key</label>
                  <input 
                    type="text" 
                    placeholder="e.g., landing.hero.title"
                    value={i18nData.textKey}
                    onChange={(e) => setI18nData({...i18nData, textKey: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Localized Translation Value</label>
                <textarea 
                  rows={3}
                  placeholder="Enter localized translation string text content here..."
                  value={i18nData.translation}
                  onChange={(e) => setI18nData({...i18nData, translation: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 resize-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Action Button Strip */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                isSubmitting 
                  ? 'bg-blue-600/20 text-blue-400 cursor-not-allowed border border-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-950/50 transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isSubmitting ? 'Validating Payload...' : 'Validate & Push to Supabase'}
            </button>

            {/* Simulated Live System Response Status Toast UI */}
            {submitStatus === 'success' && (
              <div className="w-full sm:w-auto text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
                ✓ Row cleanly executed and synchronized to database.
              </div>
            )}
          </div>
        </form>

        {/* Right Side: Visual Staging JSON Engine Payload Preview */}
        <div className="lg:col-span-5 flex flex-col">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Schema Transaction Preview</label>
          <div className="flex-1 bg-slate-950/80 rounded-xl border border-white/10 p-4 font-mono text-xs flex flex-col justify-between min-h-[240px] shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[10px] uppercase font-bold tracking-widest text-slate-600 select-none">
              Staging Env
            </div>
            <pre className="text-blue-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(
                {
                  timestamp: new Date().toISOString().split('T')[0] + ' 12:00:00 UTC',
                  operation: `RPC_TABLE_INSERT`,
                  target_schema: activeTemplate === 'affiliate' ? 'partners' : activeTemplate === 'match' ? 'matches' : 'localization',
                  record_payload: getPayload()
                }, 
                null, 
                2
              )}
            </pre>
            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center select-none">
              <span>Status: Waiting for dispatch approval</span>
              <span className="font-bold text-blue-500">Pipeline Ready</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
