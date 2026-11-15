import React, { useState } from 'react';
import { AlertTriangle, Trash2, KeyRound } from 'lucide-react';
import {
  BiosConfig,
  BiosLogEntry,
  CategoryId,
  FIRMWARE_METADATA,
} from '../data/biosData';
import {
  BiosRadioGroup,
  BiosSelect,
  BiosSettingCard,
  BiosToggle,
} from './BiosControls';
import { OverviewPanel } from './OverviewPanel';
import { BootSequenceControl } from './BootSequenceControl';

interface CategorySettingsPaneProps {
  activeCategory: CategoryId;
  config: BiosConfig;
  savedConfig: BiosConfig;
  selectedSettingKey: string | null;
  adminLocked: boolean;
  logs: BiosLogEntry[];
  onSelectSetting: (key: string) => void;
  onUpdateConfig: <K extends keyof BiosConfig>(key: K, value: BiosConfig[K]) => void;
  onJumpToCategory: (cat: CategoryId) => void;
  onOpenPasswordModal: (target: 'adminPassword' | 'systemPassword' | 'nvmePassword') => void;
  onClearTpm: () => void;
  onClearLogs: () => void;
  onOpenWolGuide: () => void;
}

export const CategorySettingsPane: React.FC<CategorySettingsPaneProps> = ({
  activeCategory,
  config,
  savedConfig,
  selectedSettingKey,
  adminLocked,
  logs,
  onSelectSetting,
  onUpdateConfig,
  onJumpToCategory,
  onOpenPasswordModal,
  onClearTpm,
  onClearLogs,
  onOpenWolGuide,
}) => {
  const [logFilter, setLogFilter] = useState<'All' | BiosLogEntry['category']>('All');
  const [tpmClearedNotice, setTpmClearedNotice] = useState(false);

  const isMod = (key: keyof BiosConfig) =>
    JSON.stringify(config[key]) !== JSON.stringify(savedConfig[key]);

  if (activeCategory === 'overview') {
    return (
      <OverviewPanel
        config={config}
        onJumpToCategory={(cat) => onJumpToCategory(cat)}
      />
    );
  }

  if (activeCategory === 'boot') {
    return (
      <div className="space-y-3">
        <BiosSettingCard
          settingKey="bootMode"
          title="Boot Mode"
          subtitle="Native UEFI firmware boot architecture (Legacy CSM is deprecated on 2026 platforms)."
          isSelected={selectedSettingKey === 'bootMode'}
          onSelect={onSelectSetting}
        >
          <span className="inline-block rounded border border-[#2f3d52] bg-[#121820] px-3 py-1.5 text-xs font-mono text-slate-200">
            {config.bootMode}
          </span>
        </BiosSettingCard>

        <BootSequenceControl
          entries={config.bootSequence}
          externalUsbBoot={config.externalUsbBoot}
          integratedNic={config.integratedNic}
          disabled={adminLocked}
          onChange={(next) => onUpdateConfig('bootSequence', next)}
          onSelect={() => onSelectSetting('bootSequence')}
          isSelected={selectedSettingKey === 'bootSequence'}
          isModified={isMod('bootSequence')}
        />

        <BiosSettingCard
          settingKey="secureBoot"
          title="Enable Secure Boot"
          subtitle="Verify cryptographic signatures of UEFI drivers and OS bootloaders before execution."
          isSelected={selectedSettingKey === 'secureBoot'}
          isModified={isMod('secureBoot')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.secureBoot}
            disabled={adminLocked}
            label="Enable Secure Boot"
            onChange={(val) => onUpdateConfig('secureBoot', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="secureBootMode"
          title="Secure Boot Mode"
          subtitle="Deployed Mode enforces signature checks; Audit Mode logs failures without halting."
          isSelected={selectedSettingKey === 'secureBootMode'}
          isModified={isMod('secureBootMode')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Secure Boot Mode"
            value={config.secureBootMode}
            options={['Deployed Mode', 'Audit Mode']}
            disabled={adminLocked || !config.secureBoot}
            onChange={(val) => onUpdateConfig('secureBootMode', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="microsoftUefiCa"
          title="Enable Microsoft UEFI CA"
          subtitle="Trust third-party UEFI drivers and Linux shim bootloaders signed by Microsoft Corporation UEFI CA."
          isSelected={selectedSettingKey === 'microsoftUefiCa'}
          isModified={isMod('microsoftUefiCa')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.microsoftUefiCa}
            disabled={adminLocked || !config.secureBoot}
            label="Enable Microsoft UEFI CA"
            onChange={(val) => onUpdateConfig('microsoftUefiCa', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="uefiBootPathSecurity"
          title="UEFI Boot Path Security"
          subtitle="Controls whether the Admin Password is required when booting an external UEFI path (F12 / USB / PXE)."
          isSelected={selectedSettingKey === 'uefiBootPathSecurity'}
          isModified={isMod('uefiBootPathSecurity')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="UEFI Boot Path Security"
            value={config.uefiBootPathSecurity}
            options={['Always Except Internal HDD', 'Always', 'Never']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('uefiBootPathSecurity', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'storage') {
    return (
      <div className="space-y-3">
        <div
          onClick={() => onSelectSetting('sataNvmeOperation')}
          className={`rounded-md border p-4 cursor-pointer transition-colors ${
            selectedSettingKey === 'sataNvmeOperation'
              ? 'bg-[#1c2532] border-[#007DB8]'
              : 'bg-[#161d27] border-[#273242] hover:border-[#3a4a60]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-slate-100">SATA / NVMe Operation</h3>
              {isMod('sataNvmeOperation') && (
                <span className="text-xs font-mono font-medium text-amber-400">Modified</span>
              )}
            </div>
          </div>
          <p className="mt-1 text-[13px] text-slate-400">
            Configures the operating mode of the internal storage controller (Intel VMD / RAID vs standard AHCI/NVMe).
          </p>
          <BiosRadioGroup
            value={config.sataNvmeOperation}
            disabled={adminLocked}
            options={[
              {
                value: 'RAID On',
                label: 'RAID On (Intel VMD)',
                hint: 'Factory default for Windows RST',
              },
              {
                value: 'AHCI/NVMe',
                label: 'AHCI / NVMe',
                hint: 'Standard Linux & generic OS mode',
              },
              {
                value: 'Disabled',
                label: 'Disabled',
                hint: 'Disconnects internal storage bus',
              },
            ]}
            onChange={(val) => onUpdateConfig('sataNvmeOperation', val)}
          />
          {config.sataNvmeOperation !== 'RAID On' && (
            <div className="mt-3 flex items-start gap-2 rounded border border-amber-500/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Lecture Impact: Switching away from factory &ldquo;RAID On&rdquo; prevents an
                existing Windows installation from booting unless Safe Mode storage drivers were
                pre-staged.
              </span>
            </div>
          )}
        </div>

        <BiosSettingCard
          settingKey="m2Slot0Enabled"
          title="M.2 PCIe SSD-0"
          subtitle="Primary NVMe Gen4 x4 slot (KIOXIA XG8 1024 GB)."
          isSelected={selectedSettingKey === 'm2Slot0Enabled'}
          isModified={isMod('m2Slot0Enabled')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.m2Slot0Enabled}
            disabled={adminLocked}
            label="M.2 PCIe SSD-0"
            onChange={(val) => onUpdateConfig('m2Slot0Enabled', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="m2Slot1Enabled"
          title="M.2 PCIe SSD-1"
          subtitle="Secondary M.2 2280 expansion slot."
          isSelected={selectedSettingKey === 'm2Slot1Enabled'}
          isModified={isMod('m2Slot1Enabled')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.m2Slot1Enabled}
            disabled={adminLocked}
            label="M.2 PCIe SSD-1"
            onChange={(val) => onUpdateConfig('m2Slot1Enabled', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="smartReporting"
          title="Enable SMART Reporting"
          subtitle="Check drive health attributes during POST and alert on predictive failure."
          isSelected={selectedSettingKey === 'smartReporting'}
          isModified={isMod('smartReporting')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.smartReporting}
            disabled={adminLocked}
            label="Enable SMART Reporting"
            onChange={(val) => onUpdateConfig('smartReporting', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="externalUsbBoot"
          title="Enable External USB Drive Boot"
          subtitle="Allow USB flash drives and external SSDs to appear as bootable UEFI media."
          isSelected={selectedSettingKey === 'externalUsbBoot'}
          isModified={isMod('externalUsbBoot')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.externalUsbBoot}
            disabled={adminLocked}
            label="Enable External USB Drive Boot"
            onChange={(val) => onUpdateConfig('externalUsbBoot', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'system') {
    return (
      <div className="space-y-3">
        <BiosSettingCard
          settingKey="integratedNic"
          title="Integrated NIC"
          subtitle="Controls onboard Intel I219-LM Gigabit Ethernet and PXE network boot stack."
          isSelected={selectedSettingKey === 'integratedNic'}
          isModified={isMod('integratedNic')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Integrated NIC"
            value={config.integratedNic}
            options={['Enabled w/ PXE', 'Enabled', 'Disabled']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('integratedNic', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="macAddressPassThrough"
          title="MAC Address Pass-Through"
          subtitle="Present system-unique MAC address when connected through compatible USB-C / Thunderbolt docks."
          isSelected={selectedSettingKey === 'macAddressPassThrough'}
          isModified={isMod('macAddressPassThrough')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="MAC Address Pass-Through"
            value={config.macAddressPassThrough}
            options={['System Unique MAC', 'Disabled']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('macAddressPassThrough', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="thunderboltEnabled"
          title="Enable Thunderbolt™ / USB4 Technology"
          subtitle="Enable PCIe tunneling and high-bandwidth Thunderbolt 4 device enumeration."
          isSelected={selectedSettingKey === 'thunderboltEnabled'}
          isModified={isMod('thunderboltEnabled')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.thunderboltEnabled}
            disabled={adminLocked}
            label="Enable Thunderbolt"
            onChange={(val) => onUpdateConfig('thunderboltEnabled', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="thunderboltSecurity"
          title="Thunderbolt Security Level"
          subtitle="DMA authorization policy for Thunderbolt PCIe devices."
          isSelected={selectedSettingKey === 'thunderboltSecurity'}
          isModified={isMod('thunderboltSecurity')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Thunderbolt Security Level"
            value={config.thunderboltSecurity}
            options={[
              'User Authorization',
              'Secure Connect',
              'No Security',
              'DisplayPort and USB Only',
            ]}
            disabled={adminLocked || !config.thunderboltEnabled}
            onChange={(val) => onUpdateConfig('thunderboltSecurity', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="integratedAudio"
          title="Enable Audio"
          subtitle="Enable onboard HD audio controller."
          isSelected={selectedSettingKey === 'integratedAudio'}
          isModified={isMod('integratedAudio')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.integratedAudio}
            disabled={adminLocked}
            label="Enable Audio"
            onChange={(val) => onUpdateConfig('integratedAudio', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="internalMicrophone"
          title="Enable Microphone"
          subtitle="Hardware firmware switch for internal array microphone."
          isSelected={selectedSettingKey === 'internalMicrophone'}
          isModified={isMod('internalMicrophone')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.internalMicrophone}
            disabled={adminLocked}
            label="Enable Microphone"
            onChange={(val) => onUpdateConfig('internalMicrophone', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="integratedCamera"
          title="Enable Camera"
          subtitle="Hardware firmware switch for integrated webcam."
          isSelected={selectedSettingKey === 'integratedCamera'}
          isModified={isMod('integratedCamera')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.integratedCamera}
            disabled={adminLocked}
            label="Enable Camera"
            onChange={(val) => onUpdateConfig('integratedCamera', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="usbPowerShare"
          title="Enable USB PowerShare"
          subtitle="Provide 5V charging on USB PowerShare port while system is asleep or powered off."
          isSelected={selectedSettingKey === 'usbPowerShare'}
          isModified={isMod('usbPowerShare')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.usbPowerShare}
            disabled={adminLocked}
            label="Enable USB PowerShare"
            onChange={(val) => onUpdateConfig('usbPowerShare', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="fnLockMode"
          title="Fn Lock Mode"
          subtitle="Default behavior of the top row F1–F12 keys."
          isSelected={selectedSettingKey === 'fnLockMode'}
          isModified={isMod('fnLockMode')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Fn Lock Mode"
            value={config.fnLockMode}
            options={['Lock Mode Secondary', 'Lock Mode Standard']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('fnLockMode', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'virtualization') {
    return (
      <div className="space-y-3">
        <BiosSettingCard
          settingKey="intelVtx"
          title="Intel® Virtualization Technology (VT-x)"
          subtitle="Enable CPU hardware virtualization extensions required by hypervisors and WSL2."
          isSelected={selectedSettingKey === 'intelVtx'}
          isModified={isMod('intelVtx')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.intelVtx}
            disabled={adminLocked}
            label="Intel VT-x"
            onChange={(val) => onUpdateConfig('intelVtx', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="intelVtd"
          title="VT for Direct I/O (VT-d / IOMMU)"
          subtitle="Enable hardware DMA remapping and direct PCIe device assignment to virtual machines."
          isSelected={selectedSettingKey === 'intelVtd'}
          isModified={isMod('intelVtd')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.intelVtd}
            disabled={adminLocked}
            label="VT for Direct I/O"
            onChange={(val) => onUpdateConfig('intelVtd', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="intelTxt"
          title="Trusted Execution Technology (TXT)"
          subtitle="Enable hardware-measured dynamic launch for high-assurance hypervisors."
          isSelected={selectedSettingKey === 'intelTxt'}
          isModified={isMod('intelTxt')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.intelTxt}
            disabled={adminLocked}
            label="Trusted Execution Technology"
            onChange={(val) => onUpdateConfig('intelTxt', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="kernelDmaProtection"
          title="Kernel DMA Protection"
          subtitle="Use IOMMU pre-boot isolation to block unauthorized DMA access from Thunderbolt and external PCIe ports."
          isSelected={selectedSettingKey === 'kernelDmaProtection'}
          isModified={isMod('kernelDmaProtection')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.kernelDmaProtection}
            disabled={adminLocked}
            label="Kernel DMA Protection"
            onChange={(val) => onUpdateConfig('kernelDmaProtection', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'security') {
    return (
      <div className="space-y-3">
        <BiosSettingCard
          settingKey="tpmEnabled"
          title="TPM 2.0 Security On"
          subtitle={`Discrete ${FIRMWARE_METADATA.tpmVendor} · Firmware ${FIRMWARE_METADATA.tpmFirmware}`}
          isSelected={selectedSettingKey === 'tpmEnabled'}
          isModified={isMod('tpmEnabled')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={adminLocked || !config.tpmEnabled}
              onClick={(e) => {
                e.stopPropagation();
                onClearTpm();
                setTpmClearedNotice(true);
              }}
              className="rounded border border-amber-500/40 bg-amber-950/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-950/40 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Clear TPM
            </button>
            <BiosToggle
              checked={config.tpmEnabled}
              disabled={adminLocked}
              label="TPM 2.0 Security"
              onChange={(val) => onUpdateConfig('tpmEnabled', val)}
            />
          </div>
        </BiosSettingCard>

        {tpmClearedNotice && (
          <div className="rounded border border-amber-500/40 bg-amber-950/25 px-4 py-2.5 text-xs text-amber-200">
            TPM 2.0 Ownership &amp; Endorsement Hierarchy Clear command queued and recorded in System Logs.
          </div>
        )}

        <BiosSettingCard
          settingKey="tpmPpiBypassEnable"
          title="PPI Bypass for Enable Commands"
          subtitle="Allow OS management software to enable TPM without physical presence prompt."
          isSelected={selectedSettingKey === 'tpmPpiBypassEnable'}
          isModified={isMod('tpmPpiBypassEnable')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.tpmPpiBypassEnable}
            disabled={adminLocked}
            label="PPI Bypass Enable"
            onChange={(val) => onUpdateConfig('tpmPpiBypassEnable', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="tpmPpiBypassClear"
          title="PPI Bypass for Clear Commands"
          subtitle="Allow automated OS tools to clear TPM keys without physical presence confirmation."
          isSelected={selectedSettingKey === 'tpmPpiBypassClear'}
          isModified={isMod('tpmPpiBypassClear')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.tpmPpiBypassClear}
            disabled={adminLocked}
            label="PPI Bypass Clear"
            onChange={(val) => onUpdateConfig('tpmPpiBypassClear', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="smmSecurityMitigation"
          title="SMM Security Mitigation"
          subtitle="Enforce Ring -2 System Management Mode memory isolation (Critical patch in 1.20.0)."
          isSelected={selectedSettingKey === 'smmSecurityMitigation'}
          isModified={isMod('smmSecurityMitigation')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.smmSecurityMitigation}
            disabled={adminLocked}
            label="SMM Security Mitigation"
            onChange={(val) => onUpdateConfig('smmSecurityMitigation', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="uefiCapsuleUpdates"
          title="UEFI Capsule Firmware Updates"
          subtitle="Permit Windows Update and Linux LVFS (fwupd) to deliver signed BIOS capsule updates."
          isSelected={selectedSettingKey === 'uefiCapsuleUpdates'}
          isModified={isMod('uefiCapsuleUpdates')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.uefiCapsuleUpdates}
            disabled={adminLocked}
            label="UEFI Capsule Updates"
            onChange={(val) => onUpdateConfig('uefiCapsuleUpdates', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="absolutePersistence"
          title="Absolute® Persistence Module"
          subtitle="Firmware-resident asset recovery module."
          isSelected={selectedSettingKey === 'absolutePersistence'}
          isModified={isMod('absolutePersistence')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Absolute Persistence"
            value={config.absolutePersistence}
            options={['Enabled', 'Disabled', 'Permanently Disabled']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('absolutePersistence', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="dataWipeNextBoot"
          title="Wipe on Next Boot"
          subtitle="Perform NIST SP 800-88 cryptographic erase / NVMe Sanitize across internal drives on next reboot."
          isSelected={selectedSettingKey === 'dataWipeNextBoot'}
          isModified={isMod('dataWipeNextBoot')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.dataWipeNextBoot}
            disabled={adminLocked}
            label="Wipe on Next Boot"
            onChange={(val) => onUpdateConfig('dataWipeNextBoot', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'passwords') {
    return (
      <div className="space-y-3">
        <BiosSettingCard
          settingKey="adminPassword"
          title="Admin Password"
          subtitle={
            config.adminPassword
              ? 'Status: Set · Restricts BIOS Setup edits and F12 boot path changes.'
              : 'Status: Not Set · BIOS Setup configuration is currently unlocked.'
          }
          isSelected={selectedSettingKey === 'adminPassword'}
          isModified={isMod('adminPassword')}
          onSelect={onSelectSetting}
        >
          <button
            type="button"
            disabled={adminLocked}
            onClick={(e) => {
              e.stopPropagation();
              onOpenPasswordModal('adminPassword');
            }}
            className="inline-flex items-center gap-1.5 rounded border border-[#007DB8] bg-[#007DB8]/20 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-[#007DB8]/30 disabled:opacity-40 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            {config.adminPassword ? 'Change / Clear' : 'Set Password'}
          </button>
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="systemPassword"
          title="System Password"
          subtitle={
            config.systemPassword
              ? 'Status: Set · Required at POST power-on before OS boot.'
              : 'Status: Not Set · System boots directly without pre-boot prompt.'
          }
          isSelected={selectedSettingKey === 'systemPassword'}
          isModified={isMod('systemPassword')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <button
            type="button"
            disabled={adminLocked}
            onClick={(e) => {
              e.stopPropagation();
              onOpenPasswordModal('systemPassword');
            }}
            className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#121820] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#007DB8] disabled:opacity-40 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            {config.systemPassword ? 'Change / Clear' : 'Set Password'}
          </button>
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="nvmePassword"
          title="Internal M.2 SSD-0 Password"
          subtitle={
            config.nvmePassword
              ? 'Status: Set · Hardware Opal / ATA drive lock active.'
              : 'Status: Not Set · Drive unlocked at controller level.'
          }
          isSelected={selectedSettingKey === 'nvmePassword'}
          isModified={isMod('nvmePassword')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <button
            type="button"
            disabled={adminLocked}
            onClick={(e) => {
              e.stopPropagation();
              onOpenPasswordModal('nvmePassword');
            }}
            className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#121820] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#007DB8] disabled:opacity-40 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            {config.nvmePassword ? 'Change / Clear' : 'Set Password'}
          </button>
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="strongPassword"
          title="Strong Password"
          subtitle="Enforce 8+ characters with mixed uppercase and lowercase letters for BIOS passwords."
          isSelected={selectedSettingKey === 'strongPassword'}
          isModified={isMod('strongPassword')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.strongPassword}
            disabled={adminLocked}
            label="Strong Password"
            onChange={(val) => onUpdateConfig('strongPassword', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="passwordBypass"
          title="Password Bypass"
          subtitle="Skip System Password prompt during warm OS restarts."
          isSelected={selectedSettingKey === 'passwordBypass'}
          isModified={isMod('passwordBypass')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Password Bypass"
            value={config.passwordBypass}
            options={['Disabled', 'Reboot Bypass']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('passwordBypass', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'preboot') {
    return (
      <div className="space-y-3">
        <div
          onClick={() => onSelectSetting('fastboot')}
          className={`rounded-md border p-4 cursor-pointer transition-colors ${
            selectedSettingKey === 'fastboot'
              ? 'bg-[#1c2532] border-[#007DB8]'
              : 'bg-[#161d27] border-[#273242] hover:border-[#3a4a60]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-slate-100">Fastboot</h3>
            {isMod('fastboot') && (
              <span className="text-xs font-mono font-medium text-amber-400">Modified</span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-slate-400">
            Configure POST initialization depth and memory training behavior before OS handoff.
          </p>
          <BiosRadioGroup
            value={config.fastboot}
            disabled={adminLocked}
            options={[
              { value: 'Minimal', label: 'Minimal', hint: 'Fastest boot; skips full bus scan' },
              { value: 'Thorough', label: 'Thorough', hint: 'Full memory & PCIe diagnostics' },
              { value: 'Auto', label: 'Auto', hint: 'Thorough only after hardware change' },
            ]}
            onChange={(val) => onUpdateConfig('fastboot', val)}
          />
        </div>

        <BiosSettingCard
          settingKey="extendPostTime"
          title="Extend BIOS POST Time"
          subtitle="Add splash delay so F2 / F12 hotkeys are easier to catch on fast NVMe systems."
          isSelected={selectedSettingKey === 'extendPostTime'}
          isModified={isMod('extendPostTime')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Extend BIOS POST Time"
            value={config.extendPostTime}
            options={['0 Seconds', '5 Seconds', '10 Seconds']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('extendPostTime', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="adapterWarnings"
          title="Enable Adapter Warnings"
          subtitle="Warn during POST if an under-wattage AC power adapter is connected."
          isSelected={selectedSettingKey === 'adapterWarnings'}
          isModified={isMod('adapterWarnings')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.adapterWarnings}
            disabled={adminLocked}
            label="Adapter Warnings"
            onChange={(val) => onUpdateConfig('adapterWarnings', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="numLockAtBoot"
          title="Enable NumLock at Boot"
          subtitle="Initialize NumLock ON when entering pre-boot authentication or OS login."
          isSelected={selectedSettingKey === 'numLockAtBoot'}
          isModified={isMod('numLockAtBoot')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.numLockAtBoot}
            disabled={adminLocked}
            label="Enable NumLock at Boot"
            onChange={(val) => onUpdateConfig('numLockAtBoot', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="warningsAndErrors"
          title="Warnings and Errors"
          subtitle="Choose how POST reacts to non-fatal hardware warnings."
          isSelected={selectedSettingKey === 'warningsAndErrors'}
          isModified={isMod('warningsAndErrors')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Warnings and Errors"
            value={config.warningsAndErrors}
            options={[
              'Prompt on Warnings and Errors',
              'Continue on Warnings',
              'Continue on Warnings and Errors',
            ]}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('warningsAndErrors', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'power') {
    return (
      <div className="space-y-3">
        <div
          onClick={() => onSelectSetting('thermalManagement')}
          className={`rounded-md border p-4 cursor-pointer transition-colors ${
            selectedSettingKey === 'thermalManagement'
              ? 'bg-[#1c2532] border-[#007DB8]'
              : 'bg-[#161d27] border-[#273242] hover:border-[#3a4a60]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-slate-100">Thermal Management</h3>
            {isMod('thermalManagement') && (
              <span className="text-xs font-mono font-medium text-amber-400">Modified</span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-slate-400">
            Balance processor TDP power limits, surface skin temperature, and fan acoustic curve.
          </p>
          <BiosRadioGroup
            value={config.thermalManagement}
            disabled={adminLocked}
            options={[
              { value: 'Optimized', label: 'Optimized', hint: 'Standard balanced fan & TDP' },
              { value: 'Cool', label: 'Cool', hint: 'Lower chassis temperature' },
              { value: 'Quiet', label: 'Quiet', hint: 'Reduced fan acoustics' },
              {
                value: 'Ultra Performance',
                label: 'Ultra Performance',
                hint: 'Maximum PL1/PL2 & fan RPM',
              },
            ]}
            onChange={(val) => onUpdateConfig('thermalManagement', val)}
          />
        </div>

        <BiosSettingCard
          settingKey="wakeOnAc"
          title="Wake on AC"
          subtitle="Power on system automatically when external AC power is connected or restored."
          isSelected={selectedSettingKey === 'wakeOnAc'}
          isModified={isMod('wakeOnAc')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.wakeOnAc}
            disabled={adminLocked}
            label="Wake on AC"
            onChange={(val) => onUpdateConfig('wakeOnAc', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="blockSleep"
          title="Block Sleep"
          subtitle="Prevent OS from entering S3 / Modern Standby sleep states."
          isSelected={selectedSettingKey === 'blockSleep'}
          isModified={isMod('blockSleep')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.blockSleep}
            disabled={adminLocked}
            label="Block Sleep"
            onChange={(val) => onUpdateConfig('blockSleep', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="deepSleepControl"
          title="Deep Sleep Control"
          subtitle="Disable standby power rails in S4/S5 to minimize ErP Lot 6 off-mode power draw."
          isSelected={selectedSettingKey === 'deepSleepControl'}
          isModified={isMod('deepSleepControl')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Deep Sleep Control"
            value={config.deepSleepControl}
            options={['Enabled in S4 and S5', 'Enabled in S5 only', 'Disabled']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('deepSleepControl', val)}
          />
        </BiosSettingCard>

        {config.wakeOnLan !== 'Disabled' && config.deepSleepControl !== 'Disabled' && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-500/45 bg-amber-950/25 px-3.5 py-2.5 text-xs text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Wake-on-LAN Blocked:</strong> Deep Sleep ({config.deepSleepControl}) cuts
                3.3V standby power to the NIC. Set Deep Sleep Control to <strong>Disabled</strong>{' '}
                for WoL to work on QBM1250.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenWolGuide}
                className="text-sky-300 hover:underline font-medium whitespace-nowrap"
              >
                WoL Guide (EN / DE)
              </button>
              <button
                type="button"
                onClick={() => onJumpToCategory('systemmanagement')}
                className="text-sky-300 hover:underline font-medium whitespace-nowrap"
              >
                View System Management
              </button>
            </div>
          </div>
        )}

        <BiosSettingCard
          settingKey="usbWakeSupport"
          title="Enable USB Wake Support"
          subtitle="Allow USB HID devices or docks to wake the system from standby."
          isSelected={selectedSettingKey === 'usbWakeSupport'}
          isModified={isMod('usbWakeSupport')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.usbWakeSupport}
            disabled={adminLocked}
            label="USB Wake Support"
            onChange={(val) => onUpdateConfig('usbWakeSupport', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="intelSpeedShift"
          title="Intel® Speed Shift Technology"
          subtitle="Enable hardware-controlled P-state frequency scaling."
          isSelected={selectedSettingKey === 'intelSpeedShift'}
          isModified={isMod('intelSpeedShift')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.intelSpeedShift}
            disabled={adminLocked}
            label="Intel Speed Shift"
            onChange={(val) => onUpdateConfig('intelSpeedShift', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'systemmanagement') {
    const needsPxe = config.wakeOnLan === 'LAN with PXE Boot';
    const nicOk =
      config.wakeOnLan === 'WLAN Only'
        ? true
        : needsPxe
        ? config.integratedNic === 'Enabled w/ PXE'
        : config.integratedNic !== 'Disabled';
    const deepSleepOk = config.deepSleepControl === 'Disabled';
    const wolEnabled = config.wakeOnLan !== 'Disabled';

    return (
      <div className="space-y-3">
        <div
          onClick={() => onSelectSetting('wakeOnLan')}
          className={`rounded-md border p-4 cursor-pointer transition-colors ${
            selectedSettingKey === 'wakeOnLan'
              ? 'bg-[#1c2532] border-[#007DB8]'
              : 'bg-[#161d27] border-[#273242] hover:border-[#3a4a60]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-slate-100">Wake on LAN / WLAN</h3>
              {isMod('wakeOnLan') && (
                <span className="text-xs font-mono font-medium text-amber-400">Modified</span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWolGuide();
              }}
              className="rounded border border-[#334155] bg-[#121820] px-2.5 py-1 text-xs font-medium text-sky-300 hover:border-[#007DB8] whitespace-nowrap"
            >
              How to Enable WoL (EN / DE)
            </button>
          </div>
          <p className="mt-1 text-[13px] text-slate-400">
            Allow the system to power on from S4 (Hibernate) or S5 (Soft Off) upon receiving a Magic Packet.
          </p>
          <BiosRadioGroup
            value={config.wakeOnLan}
            disabled={adminLocked}
            options={[
              { value: 'Disabled', label: 'Disabled', hint: 'Ignore network wake packets' },
              { value: 'LAN Only', label: 'LAN Only', hint: 'Wake via onboard Ethernet NIC' },
              { value: 'WLAN Only', label: 'WLAN Only', hint: 'Wake via wireless adapter' },
              { value: 'LAN or WLAN', label: 'LAN or WLAN', hint: 'Allow wired or wireless WoL' },
              {
                value: 'LAN with PXE Boot',
                label: 'LAN with PXE Boot',
                hint: 'Wake and immediately PXE boot',
              },
            ]}
            onChange={(val) => onUpdateConfig('wakeOnLan', val)}
          />

          {/* Live QBM1250 WoL Dependency Inspector */}
          <div className="mt-3 rounded border border-[#273242] bg-[#121820] p-3 text-xs space-y-2">
            <div className="font-mono font-semibold text-slate-300">
              QBM1250 BIOS Wake-on-LAN Readiness Checklist
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded border border-[#232d3b] bg-[#161d27] px-2.5 py-2">
                <div className="text-slate-400">1. Wake on LAN</div>
                <div
                  className={`mt-0.5 font-mono font-semibold ${
                    wolEnabled ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {config.wakeOnLan}
                </div>
              </div>
              <div className="rounded border border-[#232d3b] bg-[#161d27] px-2.5 py-2">
                <div className="flex items-center justify-between gap-1 text-slate-400">
                  <span>2. Deep Sleep Control</span>
                  {!deepSleepOk && wolEnabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToCategory('power');
                        onSelectSetting('deepSleepControl');
                      }}
                      className="text-sky-400 hover:underline"
                    >
                      Fix
                    </button>
                  )}
                </div>
                <div
                  className={`mt-0.5 font-mono font-semibold ${
                    deepSleepOk ? 'text-emerald-400' : wolEnabled ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {config.deepSleepControl}
                </div>
              </div>
              <div className="rounded border border-[#232d3b] bg-[#161d27] px-2.5 py-2">
                <div className="flex items-center justify-between gap-1 text-slate-400">
                  <span>3. Integrated NIC</span>
                  {!nicOk && wolEnabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToCategory('system');
                        onSelectSetting('integratedNic');
                      }}
                      className="text-sky-400 hover:underline"
                    >
                      Fix
                    </button>
                  )}
                </div>
                <div
                  className={`mt-0.5 font-mono font-semibold ${
                    nicOk ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {config.integratedNic}
                </div>
              </div>
            </div>
            {wolEnabled && (!deepSleepOk || !nicOk) && (
              <div className="flex items-start gap-2 pt-1 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {!deepSleepOk
                    ? 'Power -> Deep Sleep Control is still enabled and will cut standby power to the Ethernet port in S4/S5.'
                    : needsPxe
                    ? 'System Configuration -> Integrated NIC must be "Enabled w/ PXE" for LAN with PXE Boot.'
                    : 'System Configuration -> Integrated NIC is Disabled, preventing wired Magic Packet reception.'}
                </span>
              </div>
            )}
          </div>
        </div>

        <BiosSettingCard
          settingKey="acRecovery"
          title="AC Recovery"
          subtitle="Specify power behavior after AC mains power loss and restoration."
          isSelected={selectedSettingKey === 'acRecovery'}
          isModified={isMod('acRecovery')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="AC Recovery"
            value={config.acRecovery}
            options={['Power Off', 'Power On', 'Last Power State']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('acRecovery', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="autoOnTime"
          title="Auto On Time"
          subtitle="Configure an RTC hardware schedule to automatically power on the desktop."
          isSelected={selectedSettingKey === 'autoOnTime'}
          isModified={isMod('autoOnTime')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosSelect
            ariaLabel="Auto On Time"
            value={config.autoOnTime}
            options={['Disabled', 'Every Day', 'Weekdays']}
            disabled={adminLocked}
            onChange={(val) => onUpdateConfig('autoOnTime', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="serrMessages"
          title="SERR Messages"
          subtitle="Control PCIe System Error (SERR#) message reporting."
          isSelected={selectedSettingKey === 'serrMessages'}
          isModified={isMod('serrMessages')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.serrMessages}
            disabled={adminLocked}
            label="SERR Messages"
            onChange={(val) => onUpdateConfig('serrMessages', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  if (activeCategory === 'update') {
    return (
      <div className="space-y-3">
        <section className="rounded-md border border-[#273242] bg-[#161d27] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#273242] pb-2.5 mb-3">
            <h3 className="text-[15px] font-semibold text-slate-100">
              Installed System BIOS Package Provenance
            </h3>
            <span className="font-mono text-xs text-amber-300">
              Importance: {FIRMWARE_METADATA.urgency}
            </span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-2 text-[13px]">
            <dt className="text-slate-400">Driver / Package ID</dt>
            <dd className="font-mono text-sky-300 font-semibold">{FIRMWARE_METADATA.driverId}</dd>
            <dt className="text-slate-400">Version</dt>
            <dd className="font-mono text-slate-100 tabular-nums">
              {FIRMWARE_METADATA.biosVersion}
            </dd>
            <dt className="text-slate-400">Release Date</dt>
            <dd className="font-mono text-slate-200 tabular-nums">
              {FIRMWARE_METADATA.releaseDate}
            </dd>
            <dt className="text-slate-400">Download Type / Category</dt>
            <dd className="text-slate-200">
              {FIRMWARE_METADATA.downloadType} · {FIRMWARE_METADATA.category}
            </dd>
            <dt className="text-slate-400">Capsule SHA-256</dt>
            <dd className="font-mono text-xs text-slate-400 break-all">
              {FIRMWARE_METADATA.sha256}
            </dd>
          </dl>
          <div className="mt-3 rounded border border-[#273242] bg-[#121820] p-3 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-100">1.20.0 Release Notes: </span>
            Enhances SMM Security Mitigation against Ring -2 memory disclosure, updates Intel CPU
            microcode &amp; CSME firmware ({FIRMWARE_METADATA.meFirmware}), and updates UEFI dbx
            revocation list.
          </div>
        </section>

        <BiosSettingCard
          settingKey="supportAssistRecovery"
          title="SupportAssist OS Recovery"
          subtitle="Boot local pre-boot recovery environment when primary OS fails multiple startups."
          isSelected={selectedSettingKey === 'supportAssistRecovery'}
          isModified={isMod('supportAssistRecovery')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.supportAssistRecovery}
            disabled={adminLocked}
            label="SupportAssist OS Recovery"
            onChange={(val) => onUpdateConfig('supportAssistRecovery', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="biosConnect"
          title="BIOSConnect"
          subtitle="Enable UEFI pre-boot HTTPS cloud OS recovery over Wi-Fi or Ethernet."
          isSelected={selectedSettingKey === 'biosConnect'}
          isModified={isMod('biosConnect')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.biosConnect}
            disabled={adminLocked}
            label="BIOSConnect"
            onChange={(val) => onUpdateConfig('biosConnect', val)}
          />
        </BiosSettingCard>

        <BiosSettingCard
          settingKey="rollbackProtection"
          title="UEFI BIOS Rollback Protection"
          subtitle="Block firmware downgrades prior to critical security baseline 1.20.0 (T2C2C)."
          isSelected={selectedSettingKey === 'rollbackProtection'}
          isModified={isMod('rollbackProtection')}
          isLocked={adminLocked}
          onSelect={onSelectSetting}
        >
          <BiosToggle
            checked={config.rollbackProtection}
            disabled={adminLocked}
            label="BIOS Rollback Protection"
            onChange={(val) => onUpdateConfig('rollbackProtection', val)}
          />
        </BiosSettingCard>
      </div>
    );
  }

  // System Logs
  const filteredLogs =
    logFilter === 'All' ? logs : logs.filter((item) => item.category === logFilter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#273242] bg-[#161d27] p-3">
        <div className="flex flex-wrap items-center gap-1">
          {(['All', 'BIOS Events', 'Thermal Events', 'Power Events'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLogFilter(tab)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                logFilter === tab
                  ? 'bg-[#007DB8] text-white'
                  : 'bg-[#121820] text-slate-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearLogs}
          disabled={adminLocked}
          className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#121820] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-rose-500/60 hover:text-rose-300 disabled:opacity-40 whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          Clear Logs
        </button>
      </div>

      <div className="rounded-md border border-[#273242] bg-[#161d27] overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No events recorded in the selected log category.
          </div>
        ) : (
          <div className="divide-y divide-[#222c3a]">
            {filteredLogs.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 text-[13px]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="tabular-nums">{entry.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        entry.severity === 'SECURITY'
                          ? 'text-sky-400 font-semibold'
                          : entry.severity === 'WARN'
                          ? 'text-amber-400 font-semibold'
                          : 'text-slate-300'
                      }
                    >
                      {entry.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-200">{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
