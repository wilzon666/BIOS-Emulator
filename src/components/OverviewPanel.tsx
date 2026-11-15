import React from 'react';
import { BiosConfig, FIRMWARE_METADATA } from '../data/biosData';

interface OverviewPanelProps {
  config: BiosConfig;
  onJumpToCategory: (
    cat: 'boot' | 'storage' | 'security' | 'virtualization' | 'systemmanagement' | 'update'
  ) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ config, onJumpToCategory }) => {
  const enabledBootDevices = config.bootSequence.filter((b) => b.enabled);

  return (
    <div className="space-y-4">
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
            <dd className="font-medium text-slate-100">{FIRMWARE_METADATA.model}</dd>
            <dt className="text-slate-400">BIOS Version</dt>
            <dd className="font-mono text-sky-300 tabular-nums">
              {FIRMWARE_METADATA.biosVersion}
            </dd>
            <dt className="text-slate-400">Driver / Package ID</dt>
            <dd className="font-mono text-slate-100">
              {FIRMWARE_METADATA.driverId} · {FIRMWARE_METADATA.urgency}
            </dd>
            <dt className="text-slate-400">Release Date</dt>
            <dd className="font-mono text-slate-200 tabular-nums">
              {FIRMWARE_METADATA.releaseDate}
            </dd>
            <dt className="text-slate-400">Service Tag</dt>
            <dd className="font-mono text-slate-200 tabular-nums">
              {FIRMWARE_METADATA.serviceTag}
            </dd>
            <dt className="text-slate-400">Express Service Code</dt>
            <dd className="font-mono text-slate-300 tabular-nums">
              {FIRMWARE_METADATA.expressServiceCode}
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
            <dd className="font-mono text-slate-100">{config.sataNvmeOperation}</dd>
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
            <h3 className="text-sm font-semibold text-slate-100">Memory & Storage Devices</h3>
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
              {config.m2Slot0Enabled ? 'KIOXIA XG8 1024 GB (Gen4 x4)' : 'Disabled in Firmware'}
            </dd>
            <dt className="text-slate-400">M.2 PCIe SSD-1</dt>
            <dd className="font-mono text-slate-300 tabular-nums">
              {config.m2Slot1Enabled ? 'Empty Bay (PCIe Gen4 Ready)' : 'Disabled in Firmware'}
            </dd>
          </dl>
        </section>
      </div>
    </div>
  );
};
