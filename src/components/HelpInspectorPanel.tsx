import React from 'react';
import { BookOpen, AlertTriangle } from 'lucide-react';
import {
  LECTURE_SCENARIOS,
  LectureScenario,
  SETTING_HELP_MAP,
  FIRMWARE_METADATA,
} from '../data/biosData';
import { ConfigDiffItem } from './ApplyChangesModal';

interface HelpInspectorPanelProps {
  selectedSettingKey: string | null;
  diffs: ConfigDiffItem[];
  activeScenarioId: string | null;
  onApplyScenario: (scenario: LectureScenario) => void;
  adminLocked: boolean;
}

export const HelpInspectorPanel: React.FC<HelpInspectorPanelProps> = ({
  selectedSettingKey,
  diffs,
  activeScenarioId,
  onApplyScenario,
  adminLocked,
}) => {
  const help = selectedSettingKey ? SETTING_HELP_MAP[selectedSettingKey] : null;

  return (
    <aside className="flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[#232d3b] bg-[#121820] p-4 overflow-y-auto">
      {/* Contextual Technical Help */}
      <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
        <div className="flex items-center gap-2 border-b border-[#273242] pb-2.5 mb-3">
          <BookOpen className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Setting Description &amp; Lecture Note
          </h2>
        </div>

        {help ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{help.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{help.summary}</p>
            </div>

            <div className="rounded border border-[#273242] bg-[#121820] p-3">
              <div className="text-[11px] font-mono font-semibold text-sky-400 mb-1">
                LECTURE TALKING POINT
              </div>
              <p className="text-[12px] leading-relaxed text-slate-300">{help.lectureNote}</p>
            </div>

            {help.riskNote && (
              <div className="rounded border border-amber-500/35 bg-amber-950/20 p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[12px] leading-relaxed text-amber-200">{help.riskNote}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 text-[13px] text-slate-400 leading-relaxed">
            <p className="text-slate-200 font-medium">
              Dell System BIOS {FIRMWARE_METADATA.biosVersion} ({FIRMWARE_METADATA.driverId})
            </p>
            <p>
              Click or focus any setting in the center pane to inspect its firmware behavior,
              OS interaction, and classroom demonstration notes.
            </p>
            <p className="text-xs font-mono text-slate-500">
              Release Date: {FIRMWARE_METADATA.releaseDate} · Importance: {FIRMWARE_METADATA.urgency}
            </p>
          </div>
        )}
      </section>

      {/* Pending Diff Summary */}
      <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
        <div className="flex items-center justify-between border-b border-[#273242] pb-2 mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Pending NVRAM Changes
          </h2>
          <span className="font-mono text-xs text-sky-400 tabular-nums">{diffs.length}</span>
        </div>

        {diffs.length === 0 ? (
          <p className="text-xs text-slate-400">
            All displayed values match saved NVRAM configuration.
          </p>
        ) : (
          <ul className="space-y-2">
            {diffs.slice(0, 6).map((d) => (
              <li key={d.label} className="text-xs border-b border-[#1f2835] pb-1.5 last:border-b-0 last:pb-0">
                <div className="font-medium text-slate-200">{d.label}</div>
                <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                  {d.before} <span className="text-slate-500">→</span>{' '}
                  <span className="text-amber-300">{d.after}</span>
                </div>
              </li>
            ))}
            {diffs.length > 6 && (
              <li className="text-[11px] font-mono text-slate-400">
                + {diffs.length - 6} more modified entries
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Lecture Presets */}
      <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
        <div className="border-b border-[#273242] pb-2 mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Lecture Scenario Presets
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            One-click setups for live student demonstrations
          </p>
        </div>

        <div className="space-y-2">
          {LECTURE_SCENARIOS.map((sc) => {
            const active = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                disabled={adminLocked}
                onClick={() => onApplyScenario(sc)}
                className={`w-full rounded border p-2.5 text-left transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed ${
                  active
                    ? 'border-[#007DB8] bg-[#007DB8]/15'
                    : 'border-[#273242] bg-[#121820] hover:border-[#3b4b63]'
                }`}
              >
                <div className="text-[13px] font-semibold text-slate-100">{sc.title}</div>
                <div className="mt-0.5 text-[11px] text-sky-400">{sc.subtitle}</div>
                <div className="mt-1 text-[11px] text-slate-400 leading-snug">
                  {sc.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
};
