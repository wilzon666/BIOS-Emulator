import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BiosConfig, CategoryId, FIRMWARE_METADATA, FactoryDiffItem } from '../data/biosData';

interface OverviewPanelProps {
  config: BiosConfig;
  factoryDiffs: FactoryDiffItem[];
  onJumpToCategory: (cat: CategoryId) => void;
  onJumpToSetting: (cat: CategoryId, key: string) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  config,
  factoryDiffs,
  onJumpToCategory,
  onJumpToSetting,
}) => {
  const enabledBootDevices = config.bootSequence.filter((b) => b.enabled);

  return (
    <div className="space-y-4">
      {/* Imported .ini Diff vs. Dell Factory Original */}
      <section
        className={`rounded-md border p-4 ${
          factoryDiffs.length > 0
            ? 'border-[#855b1a] bg-[#171d26]'
            : 'border-[#273242] bg-[#161d27]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#273242] pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            {factoryDiffs.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            )}
            <h3 className="text-sm font-semibold text-slate-100">
              Changes vs. Dell Factory Original Baseline
            </h3>
          </div>
          <span
            className={`font-mono text-xs tabular-nums ${
              factoryDiffs.length > 0 ? 'text-amber-300 font-semibold' : 'text-emerald-400'
            }`}
          >
            {factoryDiffs.length} {factoryDiffs.length === 1 ? 'change' : 'changes'} detected
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Source export:{' '}
          <span className="font-mono text-slate-200">{FIRMWARE_METADATA.importedFileName}</span> ·
          Dell Command | Configure <span className="font-mono">{FIRMWARE_METADATA.cctkEngineVer}</span>{' '}
          (Exported BIOS <span className="font-mono">{FIRMWARE_METADATA.importedBiosVer}</span> ·
          Service Tag <span className="font-mono text-sky-300">{FIRMWARE_METADATA.serviceTag}</span>)
        </p>

        {factoryDiffs.length === 0 ? (
          <div className="rounded border border-[#232d3b] bg-[#121820] px-3.5 py-2.5 text-xs text-slate-300">
            Active configuration matches the unmodified Dell Pro Micro Plus QBM1250 factory shipping
            state.
          </div>
        ) : (
          <div className="divide-y divide-[#232d3b] rounded border border-[#273242] bg-[#121820]">
            {factoryDiffs.map((diff) => (
              <div
                key={diff.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 hover:bg-[#161e29] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-mono text-sky-400">{diff.categoryLabel}</span>
                    <span className="text-slate-600" aria-hidden="true">
                      /
                    </span>
                    <span className="text-[13px] font-semibold text-slate-100">{diff.label}</span>
                    {diff.cctkKey && (
                      <span className="text-[11px] font-mono text-slate-500">
                        [{diff.cctkKey}]
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono">
                    <span className="text-slate-400">
                      Factory: <span className="text-slate-300">{diff.factoryValue}</span>
                    </span>
                    <span className="text-slate-500" aria-hidden="true">
                      →
                    </span>
                    <span className="text-amber-300 font-semibold">
                      Current: {diff.currentValue}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToSetting(diff.category, String(diff.key))}
                  className="inline-flex items-center gap-1 self-start sm:self-center rounded border border-[#334155] bg-[#161d27] px-2.5 py-1 text-xs font-medium text-sky-300 hover:border-[#007DB8] whitespace-nowrap shrink-0"
                >
                  Inspect
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* System Information */}
        <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
          <div className="flex items-center justify-between border-b border-[#273242] pb-2.5 mb-3">
            <h3 className="text-sm font-semibold text-slate-100">System Information</h3>
            <button
              type="button"
              onClick={() => onJumpToCategory('update')}
              className="text-xs font-medium text-[#38bdf8] hover:underline whitespace-nowrap shrink-0"
            >
              Firmware Package
            </button>
          </div>
          <dl className="grid grid-cols-[145px_1fr] gap-y-2 text-[13px]">
            <dt className="text-slate-400">System Model</dt>
            <dd className="font-medium text-slate-100">
              {FIRMWARE_METADATA.model} (SysId {FIRMWARE_METADATA.sysId})
            </dd>
            <dt className="text-slate-400">BIOS Version</dt>
            <dd className="font-mono text-sky-300 tabular-nums">
              {FIRMWARE_METADATA.biosVersion} (INI export: {FIRMWARE_METADATA.importedBiosVer})
            </dd>
            <dt className="text-slate-400">Driver / Package ID</dt>
            <dd className="font-mono text-slate-100">
              {FIRMWARE_METADATA.driverId} · {FIRMWARE_METADATA.urgency}
            </dd>
            <dt className="text-slate-400">Service Tag</dt>
            <dd className="font-mono text-slate-200 tabular-nums">
              {FIRMWARE_METADATA.serviceTag}
            </dd>
            <dt className="text-slate-400">Mfg / First Power-On</dt>
            <dd className="font-mono text-slate-300 tabular-nums">
              {FIRMWARE_METADATA.mfgDate} / {FIRMWARE_METADATA.firstPowerOnDate}
            </dd>
            <dt className="text-slate-400">System UUID</dt>
            <dd className="font-mono text-[11px] text-slate-300 tabular-nums break-all">
              {FIRMWARE_METADATA.uuid}
            </dd>
            <dt className="text-slate-400">ME / EC Firmware</dt>
            <dd className="font-mono text-slate-300 tabular-nums">
              {FIRMWARE_METADATA.meFirmware} / EC {FIRMWARE_METADATA.ecVersion}
            </dd>
          </dl>
        </section>

        {/* Security & Boot Posture */}
        <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
          <div className="flex items-center justify-between border-b border-[#273242] pb-2.5 mb-3">
            <h3 className="text-sm font-semibold text-slate-100">Firmware &amp; Management Posture</h3>
            <button
              type="button"
              onClick={() => onJumpToCategory('systemmanagement')}
              className="text-xs font-medium text-[#38bdf8] hover:underline whitespace-nowrap shrink-0"
            >
              System Management
            </button>
          </div>
          <dl className="grid grid-cols-[155px_1fr] gap-y-2 text-[13px]">
            <dt className="text-slate-400">Boot Mode</dt>
            <dd className="font-mono text-slate-100">{config.bootMode}</dd>
            <dt className="text-slate-400">Secure Boot</dt>
            <dd
              className={`font-mono font-medium ${
                config.secureBoot ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {config.secureBoot ? `Enabled (${config.secureBootMode})` : 'Disabled (Unverified)'}
            </dd>
            <dt className="text-slate-400">TPM 2.0 Security</dt>
            <dd
              className={`font-mono font-medium ${
                config.tpmEnabled ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {config.tpmEnabled
                ? `Active (${FIRMWARE_METADATA.tpmVendor})`
                : 'Disabled'}
            </dd>
            <dt className="text-slate-400">Storage Controller</dt>
            <dd
              className={`font-mono ${
                config.sataNvmeOperation === 'RAID On' ? 'text-slate-100' : 'text-amber-300'
              }`}
            >
              {config.sataNvmeOperation}
            </dd>
            <dt className="text-slate-400">Wake on LAN / Sleep</dt>
            <dd
              className={`font-mono ${
                config.wakeOnLan !== 'Disabled' && config.deepSleepControl !== 'Disabled'
                  ? 'text-amber-400'
                  : config.wakeOnLan !== 'Disabled'
                  ? 'text-emerald-400'
                  : 'text-slate-200'
              }`}
            >
              {config.wakeOnLan} · Deep Sleep: {config.deepSleepControl}
            </dd>
            <dt className="text-slate-400">Virtualization</dt>
            <dd className="font-mono text-slate-200">
              VT-x {config.intelVtx ? 'ON' : 'OFF'} · VT-d {config.intelVtd ? 'ON' : 'OFF'}
            </dd>
            <dt className="text-slate-400">Primary Boot Target</dt>
            <dd className="truncate font-mono text-sky-300">
              {enabledBootDevices[0]?.label ?? 'None Enabled'}
            </dd>
          </dl>
        </section>

        {/* Processor Configuration */}
        <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
          <div className="flex items-center justify-between border-b border-[#273242] pb-2.5 mb-3">
            <h3 className="text-sm font-semibold text-slate-100">Processor Configuration</h3>
            <button
              type="button"
              onClick={() => onJumpToCategory('virtualization')}
              className="text-xs font-medium text-[#38bdf8] hover:underline whitespace-nowrap shrink-0"
            >
              Virtualization
            </button>
          </div>
          <dl className="grid grid-cols-[145px_1fr] gap-y-2 text-[13px]">
            <dt className="text-slate-400">Processor Type</dt>
            <dd className="font-medium text-slate-100">Intel® Core™ Ultra 7 165H vPro®</dd>
            <dt className="text-slate-400">Core / Thread Count</dt>
            <dd className="font-mono text-slate-200 tabular-nums">16 Cores (6P+8E+2LPE) / 22 Threads</dd>
            <dt className="text-slate-400">Base / Max Clock</dt>
            <dd className="font-mono text-slate-200 tabular-nums">1.40 GHz / 5.00 GHz</dd>
            <dt className="text-slate-400">L3 Smart Cache</dt>
            <dd className="font-mono text-slate-200 tabular-nums">24 MB</dd>
            <dt className="text-slate-400">64-Bit / Microcode</dt>
            <dd className="font-mono text-slate-300 tabular-nums">Yes · Rev 0x1E (2026-10)</dd>
          </dl>
        </section>

        {/* Memory & Storage Configuration */}
        <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
          <div className="flex items-center justify-between border-b border-[#273242] pb-2.5 mb-3">
            <h3 className="text-sm font-semibold text-slate-100">Memory &amp; Storage Devices</h3>
            <button
              type="button"
              onClick={() => onJumpToCategory('storage')}
              className="text-xs font-medium text-[#38bdf8] hover:underline whitespace-nowrap shrink-0"
            >
              Storage Settings
            </button>
          </div>
          <dl className="grid grid-cols-[145px_1fr] gap-y-2 text-[13px]">
            <dt className="text-slate-400">Memory Installed</dt>
            <dd className="font-mono text-slate-100 tabular-nums">32768 MB (32 GB)</dd>
            <dt className="text-slate-400">Memory Technology</dt>
            <dd className="font-mono text-slate-200 tabular-nums">DDR5-5600 MT/s · Dual Channel</dd>
            <dt className="text-slate-400">DIMM A / DIMM B</dt>
            <dd className="font-mono text-slate-300 tabular-nums">16 GB Micron / 16 GB Micron</dd>
            <dt className="text-slate-400">M.2 PCIe SSD-0</dt>
            <dd className="font-mono text-slate-200 tabular-nums">
              {config.m2Slot0Enabled ? 'KIOXIA XG8 1024 GB (hdd.1)' : 'Disabled in Firmware'}
            </dd>
            <dt className="text-slate-400">M.2 PCIe SSD-1</dt>
            <dd className="font-mono text-slate-200 tabular-nums">
              {config.m2Slot1Enabled ? 'Secondary NVMe Storage 512 GB (hdd.2)' : 'Disabled in Firmware'}
            </dd>
          </dl>
        </section>
      </div>
    </div>
  );
};

