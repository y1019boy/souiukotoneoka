import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { P2PQuakeEvent, QuakePoint } from '../types';
import { ShindoBadge } from './ShindoBadge';
import { getTsunamiLabel, formatTime, getShindoLabel, getShindoColor } from '../constants';
import { IntensityChart } from './IntensityChart';
import { Activity, MapPin, AlertTriangle, ChevronDown, ChevronUp, X, Maximize2, List } from 'lucide-react';

interface QuakeCardProps {
  quake: P2PQuakeEvent;
  isLatest: boolean;
}

export const QuakeCard: React.FC<QuakeCardProps> = ({ quake, isLatest }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { earthquake, issue, points } = quake;
  
  // Sort points by scale descending
  const sortedPoints = [...points].sort((a, b) => b.scale - a.scale);

  // Group points by prefecture for the modal
  const pointsByPref = sortedPoints.reduce((acc, point) => {
    if (!acc[point.pref]) {
      acc[point.pref] = [];
    }
    acc[point.pref].push(point);
    return acc;
  }, {} as Record<string, QuakePoint[]>);

  // Format depth nicely
  const depthText = earthquake.hypocenter.depth === -1 
    ? '深さ不明' 
    : `深さ約 ${earthquake.hypocenter.depth}km`;
    
  // Format magnitude
  const magText = earthquake.hypocenter.magnitude === -1
    ? 'M不明'
    : `M${earthquake.hypocenter.magnitude.toFixed(1)}`;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  return (
    <>
      <div className={`
        relative overflow-hidden rounded-xl border transition-all duration-300
        ${isLatest ? 'bg-slate-800/80 border-cyan-500/50 shadow-lg shadow-cyan-900/20' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'}
      `}>
        {isLatest && (
          <div className="absolute top-0 right-0 bg-cyan-600 text-white text-xs px-2 py-1 rounded-bl-lg font-bold z-10">
            最新情報
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
               <ShindoBadge scale={earthquake.maxScale} size={isLatest ? 'lg' : 'md'} />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center text-slate-400 text-sm mb-1">
                <span className="mr-3 font-mono">{formatTime(earthquake.time)} 発生</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700">{issue.source || 'P2P地震情報'}</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-2 truncate">
                {earthquake.hypocenter.name || '震源地不明'}
              </h3>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
                 <div className="flex items-center gap-1.5">
                   <Activity size={16} className="text-cyan-400" />
                   <span className="font-semibold">{magText}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <MapPin size={16} className="text-cyan-400" />
                   <span>{depthText}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <AlertTriangle size={16} className={earthquake.domesticTsunami === 'None' ? 'text-green-400' : 'text-red-400'} />
                   <span>{getTsunamiLabel(earthquake.domesticTsunami)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-full gap-1 text-sm text-slate-400 hover:text-cyan-300 transition-colors py-1"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isExpanded ? '詳細を隠す' : '詳細を表示'}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="bg-slate-900/50 border-t border-slate-700/50 p-5 animation-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visuals */}
              <div>
                 <h4 className="text-sm font-semibold text-slate-400 mb-3">震度分布</h4>
                 <div className="bg-slate-800 rounded-lg p-2 h-48 flex items-center justify-center">
                   <IntensityChart points={points} />
                 </div>
                 <div className="mt-3 text-xs text-slate-500 text-right">
                   観測地点数: {points.length}ヶ所
                 </div>
              </div>

              {/* Area List - Scrollable with button at bottom */}
              <div className="flex flex-col h-full max-h-[250px]">
                   <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center justify-between">
                     <span>主な震度観測地域</span>
                     <span className="text-xs text-slate-600 font-normal">(震度順)</span>
                   </h4>
                   <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                     {sortedPoints.slice(0, 30).map((p, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-slate-800/50 border border-slate-700/50">
                          <span className="text-slate-300">{p.addr}</span>
                          <span className={`font-bold ${getShindoColor(p.scale).replace('bg-', 'text-').replace('text-black', '')}`}>
                            震度{getShindoLabel(p.scale)}
                          </span>
                       </div>
                     ))}
                     {sortedPoints.length > 30 && (
                        <div className="text-center text-xs text-slate-500 py-1">...他 {sortedPoints.length - 30} 件</div>
                     )}
                     
                     {/* "View More" Button at bottom of scroll list */}
                     <button 
                       onClick={() => setShowModal(true)}
                       className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 border-dashed rounded-lg text-sm text-cyan-400 hover:text-cyan-300 transition-all flex items-center justify-center gap-2 group"
                     >
                       <Maximize2 size={16} className="group-hover:scale-110 transition-transform"/>
                       <span>より詳細な情報を見る（全画面）</span>
                     </button>
                   </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal Portal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] text-slate-100 flex flex-col animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-900/50 p-2 rounded-lg text-cyan-400">
                <List size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">地震詳細情報</h2>
                <p className="text-xs text-slate-400">{formatTime(earthquake.time)} 発生</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={28} />
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">震源情報</h3>
                  <div className="flex items-start gap-6">
                    <ShindoBadge scale={earthquake.maxScale} size="lg" />
                    <div className="space-y-2">
                       <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
                         {earthquake.hypocenter.name || '震源地不明'}
                       </div>
                       <div className="flex flex-wrap gap-4 text-slate-300">
                          <span className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1 rounded-full">
                            <Activity size={16} className="text-cyan-400" /> {magText}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1 rounded-full">
                            <MapPin size={16} className="text-cyan-400" /> {depthText}
                          </span>
                       </div>
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                         earthquake.domesticTsunami === 'None' 
                           ? 'bg-green-900/20 border-green-800 text-green-400' 
                           : 'bg-red-900/20 border-red-800 text-red-400'
                       }`}>
                         <AlertTriangle size={18} />
                         <span className="font-medium">{getTsunamiLabel(earthquake.domesticTsunami)}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex flex-col">
                   <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">震度分布</h3>
                   <div className="flex-1 min-h-[200px] flex items-center justify-center">
                     <IntensityChart points={points} />
                   </div>
                </div>
              </div>

              {/* All Points List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="text-cyan-400" />
                  各地の震度
                  <span className="text-sm font-normal text-slate-500 ml-2">({points.length}地点)</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(pointsByPref).map(([pref, prefPoints]) => (
                    <div key={pref} className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden break-inside-avoid">
                      <div className="bg-slate-800/80 px-4 py-2 text-sm font-bold text-slate-200 border-b border-slate-700">
                        {pref}
                      </div>
                      <div className="p-2 space-y-1">
                        {(prefPoints as QuakePoint[]).map((p, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm p-1.5 hover:bg-slate-700/30 rounded transition-colors">
                             <span className="text-slate-400 flex-1 mr-2">{p.addr}</span>
                             <span className={`font-mono font-bold whitespace-nowrap ${getShindoColor(p.scale).replace('bg-', 'text-').replace('text-black', '')}`}>
                               震度{getShindoLabel(p.scale)}
                             </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
