export type CategoryId =
  | 'overview'
  | 'boot'
  | 'storage'
  | 'system'
  | 'security'
  | 'passwords'
  | 'virtualization'
  | 'preboot'
  | 'power'
  | 'systemmanagement'
  | 'update'
  | 'logs';

export interface BootEntry {
  id: string;
  cctkCode: string;
  label: string;
  devicePath: string;
  type: 'nvme' | 'usb' | 'pxe' | 'uri';
  signed: boolean;
  enabled: boolean;
  osLabel: string;
}

export interface BiosConfig {
  // Boot Configuration
  bootMode: 'UEFI Only';
  secureBoot: boolean;
  secureBootMode: 'Deployed Mode' | 'Audit Mode';
  microsoftUefiCa: boolean;
  uefiBootPathSecurity: 'Always Except Internal HDD' | 'Always' | 'Never';
  httpsBoot: boolean;
  bootSequence: BootEntry[];

  // Storage
  sataNvmeOperation: 'RAID On' | 'AHCI/NVMe' | 'Disabled';
  m2Slot0Enabled: boolean;
  m2Slot1Enabled: boolean;
  smartReporting: boolean;
  externalUsbBoot: boolean;

  // System Configuration
  integratedNic: 'Enabled w/ PXE' | 'Enabled' | 'Disabled';
  macAddressPassThrough: 'System Unique MAC' | 'Disabled';
  wirelessLan: boolean;
  bluetoothDevice: boolean;
  thunderboltEnabled: boolean;
  thunderboltSecurity:
    | 'User Authorization'
    | 'Secure Connect'
    | 'No Security'
    | 'DisplayPort and USB Only';
  integratedAudio: boolean;
  internalMicrophone: boolean;
  integratedCamera: boolean;
  usbPowerShare: boolean;
  fnLockMode: 'Lock Mode Secondary' | 'Lock Mode Standard';

  // Security
  tpmEnabled: boolean;
  tpmPpiBypassEnable: boolean;
  tpmPpiBypassClear: boolean;
  smmSecurityMitigation: boolean;
  uefiCapsuleUpdates: boolean;
  absolutePersistence: 'Enabled' | 'Disabled' | 'Permanently Disabled';
  dataWipeNextBoot: boolean;

  // Passwords (demo state)
  adminPassword: string;
  systemPassword: string;
  nvmePassword: string;
  strongPassword: boolean;
  passwordBypass: 'Disabled' | 'Reboot Bypass';

  // Virtualization Support
  intelVtx: boolean;
  intelVtd: boolean;
  intelTxt: boolean;
  kernelDmaProtection: boolean;

  // Pre-boot Behavior
  fastboot: 'Minimal' | 'Thorough' | 'Auto';
  extendPostTime: '0 Seconds' | '5 Seconds' | '10 Seconds';
  adapterWarnings: boolean;
  numLockAtBoot: boolean;
  warningsAndErrors:
    | 'Prompt on Warnings and Errors'
    | 'Continue on Warnings'
    | 'Continue on Warnings and Errors';

  // Power
  thermalManagement: 'Optimized' | 'Cool' | 'Quiet' | 'Ultra Performance';
  wakeOnAc: boolean;
  blockSleep: boolean;
  deepSleepControl: 'Disabled' | 'Enabled in S5 only' | 'Enabled in S4 and S5';
  usbWakeSupport: boolean;
  intelSpeedShift: boolean;

  // System Management (QBM1250)
  wakeOnLan: 'Disabled' | 'LAN Only' | 'WLAN Only' | 'LAN or WLAN' | 'LAN with PXE Boot';
  acRecovery: 'Power Off' | 'Power On' | 'Last Power State';
  autoOnTime: 'Disabled' | 'Every Day' | 'Weekdays';
  serrMessages: boolean;

  // Update & Recovery
  supportAssistRecovery: boolean;
  biosConnect: boolean;
  rollbackProtection: boolean;
}

export interface BiosLogEntry {
  id: string;
  timestamp: string;
  category: 'BIOS Events' | 'Thermal Events' | 'Power Events';
  severity: 'INFO' | 'WARN' | 'SECURITY';
  message: string;
}

export interface SettingMetadata {
  key: keyof BiosConfig | 'bootSequence' | 'clearTpmAction';
  category: CategoryId;
  title: string;
  cctkKey?: string;
  factoryCctkValue?: string;
  summary: string;
  lectureNote: string;
  riskNote?: string;
}

export interface LectureScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  patch: Partial<BiosConfig>;
}

export const FIRMWARE_METADATA = {
  vendor: 'Dell Inc.',
  model: 'Dell Pro Micro Plus QBM1250',
  sysId: '0D03',
  biosVersion: '1.20.0',
  importedBiosVer: '1.18.2',
  cctkEngineVer: '5.2.2.292',
  importedFileName: 'QBM1250_bios_config_58746970.ini',
  driverId: 'T2C2C',
  releaseDate: '03 Nov 2026',
  urgency: 'Critical',
  downloadType: 'System BIOS',
  category: 'BIOS',
  serviceTag: '8J3TFK4',
  expressServiceCode: '18574291044',
  mfgDate: '2026-05-05',
  firstPowerOnDate: '2026-06-26',
  uuid: '4C4C4544-004A-3310-8054-B8C04F464B34',
  ecVersion: '1.14.2',
  meFirmware: '18.0.15.2384',
  tpmVendor: 'Nuvoton NPCT76x (TPM 2.0)',
  tpmFirmware: '7.2.3.1',
  sha256: 'e4a8c1f902d7b416a9c3305e82f4c19d70b1a4431887d52e90f22a8a4b906c11',
};

const BOOT_ENTRY_HDD1: BootEntry = {
  id: 'hdd.1',
  cctkCode: 'hdd.1',
  label: 'UEFI: Windows Boot Manager (hdd.1 / M.2 SSD-0)',
  devicePath: 'PciRoot(0x0)/Pci(0x1D,0x0)/Pci(0x0,0x0)/NVMe(0x1,00-08-0D-04)/HD(1,GPT,8F2A-91C4)',
  type: 'nvme',
  signed: true,
  enabled: true,
  osLabel: 'Windows 11 Pro 24H2 (Primary M.2 SSD-0)',
};

const BOOT_ENTRY_HDD2: BootEntry = {
  id: 'hdd.2',
  cctkCode: 'hdd.2',
  label: 'UEFI: Secondary Storage / Lab OS (hdd.2 / M.2 SSD-1)',
  devicePath: 'PciRoot(0x0)/Pci(0x1B,0x0)/Pci(0x0,0x0)/NVMe(0x2,00-14-2D-09)/HD(1,GPT,41A9-CC12)',
  type: 'nvme',
  signed: false,
  enabled: true,
  osLabel: 'Secondary NVMe / Custom Lab Linux (Unsigned EFI)',
};

const BOOT_ENTRY_PXE_IPV4: BootEntry = {
  id: 'embnicipv4',
  cctkCode: 'embnicipv4',
  label: 'UEFI: Onboard NIC IPv4 PXE (embnicipv4)',
  devicePath: 'PciRoot(0x0)/Pci(0x1F,0x6)/MAC(5C80B6429A10,0x1)/IPv4(0.0.0.0)',
  type: 'pxe',
  signed: true,
  enabled: false,
  osLabel: 'Network Boot Server IPv4 (WDS / iPXE)',
};

const BOOT_ENTRY_PXE_IPV6: BootEntry = {
  id: 'embnicipv6',
  cctkCode: 'embnicipv6',
  label: 'UEFI: Onboard NIC IPv6 PXE (embnicipv6)',
  devicePath: 'PciRoot(0x0)/Pci(0x1F,0x6)/MAC(5C80B6429A10,0x1)/IPv6(::)',
  type: 'pxe',
  signed: true,
  enabled: false,
  osLabel: 'Network Boot Server IPv6',
};

const BOOT_ENTRY_URI: BootEntry = {
  id: 'uri',
  cctkCode: 'uri',
  label: 'UEFI: HTTPS / URI Network Boot (uri)',
  devicePath: 'PciRoot(0x0)/Pci(0x1F,0x6)/MAC(5C80B6429A10,0x1)/Uri()',
  type: 'uri',
  signed: true,
  enabled: false,
  osLabel: 'HTTPS Boot / BIOSConnect Cloud Image',
};

// Factory shipping defaults for Dell Pro Micro Plus QBM1250
export const FACTORY_BOOT_SEQUENCE: BootEntry[] = [
  { ...BOOT_ENTRY_HDD1, enabled: true },
  { ...BOOT_ENTRY_HDD2, enabled: true },
  { ...BOOT_ENTRY_PXE_IPV4, enabled: false },
  { ...BOOT_ENTRY_PXE_IPV6, enabled: false },
  { ...BOOT_ENTRY_URI, enabled: false },
];

// Imported from QBM1250_bios_config_58746970.ini:
// BootOrder=uefitype,+hdd.2,+hdd.1,+embnicipv4,+embnicipv6,+uri
export const IMPORTED_BOOT_SEQUENCE: BootEntry[] = [
  { ...BOOT_ENTRY_HDD2, enabled: true },
  { ...BOOT_ENTRY_HDD1, enabled: true },
  { ...BOOT_ENTRY_PXE_IPV4, enabled: true },
  { ...BOOT_ENTRY_PXE_IPV6, enabled: true },
  { ...BOOT_ENTRY_URI, enabled: true },
];

export const INITIAL_BOOT_SEQUENCE = FACTORY_BOOT_SEQUENCE;

// Original Factory Shipping State of Dell Pro Micro Plus QBM1250
export const FACTORY_BIOS_CONFIG: BiosConfig = {
  bootMode: 'UEFI Only',
  secureBoot: true,
  secureBootMode: 'Deployed Mode',
  microsoftUefiCa: true,
  uefiBootPathSecurity: 'Always Except Internal HDD',
  httpsBoot: true,
  bootSequence: FACTORY_BOOT_SEQUENCE.map((b) => ({ ...b })),

  sataNvmeOperation: 'RAID On',
  m2Slot0Enabled: true,
  m2Slot1Enabled: true,
  smartReporting: false,
  externalUsbBoot: true,

  integratedNic: 'Enabled w/ PXE',
  macAddressPassThrough: 'System Unique MAC',
  wirelessLan: true,
  bluetoothDevice: true,
  thunderboltEnabled: true,
  thunderboltSecurity: 'User Authorization',
  integratedAudio: true,
  internalMicrophone: true,
  integratedCamera: true,
  usbPowerShare: false,
  fnLockMode: 'Lock Mode Secondary',

  tpmEnabled: true,
  tpmPpiBypassEnable: false,
  tpmPpiBypassClear: false,
  smmSecurityMitigation: true,
  uefiCapsuleUpdates: true,
  absolutePersistence: 'Enabled',
  dataWipeNextBoot: false,

  adminPassword: '',
  systemPassword: '',
  nvmePassword: '',
  strongPassword: false,
  passwordBypass: 'Disabled',

  intelVtx: true,
  intelVtd: true,
  intelTxt: false,
  kernelDmaProtection: true,

  fastboot: 'Minimal',
  extendPostTime: '0 Seconds',
  adapterWarnings: true,
  numLockAtBoot: true,
  warningsAndErrors: 'Prompt on Warnings and Errors',

  thermalManagement: 'Optimized',
  wakeOnAc: false,
  blockSleep: false,
  deepSleepControl: 'Enabled in S4 and S5',
  usbWakeSupport: false,
  intelSpeedShift: true,

  wakeOnLan: 'Disabled',
  acRecovery: 'Power Off',
  autoOnTime: 'Disabled',
  serrMessages: true,

  supportAssistRecovery: true,
  biosConnect: true,
  rollbackProtection: false,
};

// Imported Config from QBM1250_bios_config_58746970.ini
export const IMPORTED_QBM1250_CONFIG: BiosConfig = {
  ...FACTORY_BIOS_CONFIG,
  secureBoot: false, // SecureBoot=Disabled (Factory: Enabled)
  bootSequence: IMPORTED_BOOT_SEQUENCE.map((b) => ({ ...b })), // +hdd.2,+hdd.1,+embnicipv4,+embnicipv6,+uri
  sataNvmeOperation: 'AHCI/NVMe', // EmbSataRaid=Ahci (Factory: Raid)
  deepSleepControl: 'Disabled', // DeepSleepCtrl=Disabled (Factory: Enabled in S4 and S5)
  wakeOnLan: 'LAN Only', // WakeOnLan=LanOnly (Factory: Disabled)
};

export const DEFAULT_BIOS_CONFIG = FACTORY_BIOS_CONFIG;

export const BIOS_CATEGORIES: { id: CategoryId; label: string; group: string }[] = [
  { id: 'overview', label: 'Overview', group: 'System' },
  { id: 'boot', label: 'Boot Configuration', group: 'Startup' },
  { id: 'storage', label: 'Storage', group: 'Hardware' },
  { id: 'system', label: 'System Configuration', group: 'Hardware' },
  { id: 'virtualization', label: 'Virtualization Support', group: 'Compute' },
  { id: 'security', label: 'Security', group: 'Protection' },
  { id: 'passwords', label: 'Passwords', group: 'Protection' },
  { id: 'preboot', label: 'Pre-boot Behavior', group: 'Startup' },
  { id: 'power', label: 'Power', group: 'Hardware' },
  { id: 'systemmanagement', label: 'System Management', group: 'Management' },
  { id: 'update', label: 'Update, Recovery', group: 'Firmware' },
  { id: 'logs', label: 'System Logs', group: 'Diagnostics' },
];

export const SETTING_HELP_MAP: Record<string, SettingMetadata> = {
  bootMode: {
    key: 'bootMode',
    category: 'boot',
    title: 'Boot Mode',
    summary:
      'Modern Dell UEFI systems (BIOS 1.20.0) operate exclusively in native UEFI mode with GPT partitioning.',
    lectureNote:
      'Legacy BIOS / CSM (Compatibility Support Module) is removed on modern Intel Core Ultra platforms so Secure Boot, Kernel DMA Protection, and Resizable BAR can initialize cleanly at firmware handoff.',
  },
  secureBoot: {
    key: 'secureBoot',
    category: 'boot',
    title: 'Secure Boot',
    cctkKey: 'SecureBoot',
    factoryCctkValue: 'Enabled',
    summary:
      'Validates cryptographic signatures of UEFI drivers, option ROMs, and OS bootloaders against trusted certificates in NVRAM before execution.',
    lectureNote:
      'In your imported QBM1250 config (8J3TFK4), SecureBoot was changed from Factory Enabled to Disabled so unsigned boot media or secondary OS kernels can boot without signature halts.',
    riskNote:
      'Disabling Secure Boot reduces boot-chain integrity and may trigger Windows BitLocker recovery prompts if PCR 7 changes.',
  },
  secureBootMode: {
    key: 'secureBootMode',
    category: 'boot',
    title: 'Secure Boot Mode',
    cctkKey: 'SecureBootMode',
    factoryCctkValue: 'DeployedMode',
    summary:
      'Deployed Mode enforces full UEFI signature validation. Audit Mode logs signature failures without blocking execution for testing custom images.',
    lectureNote:
      'Audit Mode is used by OS engineers and lab administrators to inspect which drivers or shims would fail validation prior to enrolling custom keys.',
  },
  microsoftUefiCa: {
    key: 'microsoftUefiCa',
    category: 'boot',
    title: 'Enable Microsoft UEFI CA',
    cctkKey: 'MSUefiCA',
    factoryCctkValue: 'Enabled',
    summary:
      'Controls whether the Microsoft Corporation UEFI CA 2011/2023 third-party certificate is trusted in the Secure Boot db database.',
    lectureNote:
      'Required for signed Linux shim bootloaders (Ubuntu, Fedora, RHEL) and third-party PCIe Option ROMs. Disabling this restricts Secure Boot strictly to first-party OS certificates.',
  },
  uefiBootPathSecurity: {
    key: 'uefiBootPathSecurity',
    category: 'boot',
    title: 'UEFI Boot Path Security',
    cctkKey: 'UefiBootPathSecurity',
    factoryCctkValue: 'AlwaysExceptInternalHdd',
    summary:
      'Determines whether the firmware requires the Admin Password when booting from an external UEFI path (e.g., USB drive or PXE).',
    lectureNote:
      'Prevents an attacker from simply pressing F12 at startup and booting a live USB OS when an Admin Password is configured.',
  },
  httpsBoot: {
    key: 'httpsBoot',
    category: 'boot',
    title: 'HTTPS Boot',
    cctkKey: 'HttpsBoot',
    factoryCctkValue: 'Enabled',
    summary:
      'Allows UEFI firmware to fetch signed OS recovery or deployment images over HTTPS via URI device paths.',
    lectureNote:
      'Works alongside the +uri entry in BootOrder for zero-touch cloud provisioning.',
  },
  bootSequence: {
    key: 'bootSequence',
    category: 'boot',
    title: 'Boot Sequence',
    cctkKey: 'BootOrder',
    factoryCctkValue: 'uefitype,+hdd.1,+hdd.2,-embnicipv4,-embnicipv6,-uri',
    summary:
      'Defines the priority order in which the UEFI Boot Manager searches enabled device paths for an EFI System Partition (ESP).',
    lectureNote:
      'Your imported QBM1250 .ini sets BootOrder=uefitype,+hdd.2,+hdd.1,+embnicipv4,+embnicipv6,+uri—placing secondary storage (hdd.2) first and enabling IPv4 PXE, IPv6 PXE, and HTTPS URI boot.',
  },
  sataNvmeOperation: {
    key: 'sataNvmeOperation',
    category: 'storage',
    title: 'SATA / NVMe Operation',
    cctkKey: 'EmbSataRaid',
    factoryCctkValue: 'Raid',
    summary:
      'Configures the Intel RST VMD (Volume Management Device) storage controller mode presented to the operating system.',
    lectureNote:
      'Your imported QBM1250 config switched EmbSataRaid from factory "Raid" (RAID On) to "Ahci" (AHCI/NVMe), making NVMe drives directly visible to standard Linux and OS installers.',
    riskNote:
      'Changing this setting after an operating system is installed may prevent the OS from booting.',
  },
  m2Slot0Enabled: {
    key: 'm2Slot0Enabled',
    category: 'storage',
    title: 'M.2 PCIe SSD-0',
    cctkKey: 'M2PcieSsd0',
    factoryCctkValue: 'Enabled',
    summary:
      'Enables or electrically isolates the primary M.2 2280 PCIe Gen4 x4 NVMe slot on the system board.',
    lectureNote:
      'Useful in secure labs or dual-drive isolation workflows when you want to boot exclusively from Slot-1 or USB without exposing the primary OS drive.',
  },
  m2Slot1Enabled: {
    key: 'm2Slot1Enabled',
    category: 'storage',
    title: 'M.2 PCIe SSD-1',
    cctkKey: 'M2PcieSsd1',
    factoryCctkValue: 'Enabled',
    summary:
      'Enables or disables the secondary M.2 PCIe storage bay.',
    lectureNote:
      'Disabling unused M.2 bays prevents unauthorized internal storage expansion.',
  },
  smartReporting: {
    key: 'smartReporting',
    category: 'storage',
    title: 'SMART Reporting',
    cctkKey: 'SmartErrors',
    factoryCctkValue: 'Disabled',
    summary:
      'Queries drive Self-Monitoring, Analysis, and Reporting Technology telemetry during POST and halts if a predictive failure threshold is crossed.',
    lectureNote:
      'Adds minimal POST latency while catching failing NAND flash wear indicators before boot.',
  },
  externalUsbBoot: {
    key: 'externalUsbBoot',
    category: 'storage',
    title: 'Enable External USB Drive',
    cctkKey: 'UsbEmu',
    factoryCctkValue: 'Enabled',
    summary:
      'Permits booting operating systems and recovery environments from USB Mass Storage devices.',
    lectureNote:
      'Often disabled in kiosk, exam, or enterprise endpoints alongside an Admin Password to prevent live-USB tampering.',
  },
  integratedNic: {
    key: 'integratedNic',
    category: 'system',
    title: 'Integrated NIC',
    cctkKey: 'EmbNic1',
    factoryCctkValue: 'EnabledPxe',
    summary:
      'Controls the onboard Gigabit/2.5GbE Ethernet controller and its Preboot Execution Environment (PXE) network boot stack.',
    lectureNote:
      'Must be set to "Enabled w/ PXE" for automated enterprise OS deployment (SCCM, FOG, Clonezilla, iPXE) over LAN.',
  },
  macAddressPassThrough: {
    key: 'macAddressPassThrough',
    category: 'system',
    title: 'MAC Address Pass-Through',
    summary:
      'Overrides a compatible Dell USB-C / Thunderbolt dock NIC MAC address with the system’s burned-in unique MAC address.',
    lectureNote:
      'Solves DHCP reservations and 802.1X NAC port-security issues in enterprise environments.',
  },
  wirelessLan: {
    key: 'wirelessLan',
    category: 'system',
    title: 'Wireless LAN',
    cctkKey: 'WirelessLan',
    factoryCctkValue: 'Enabled',
    summary:
      'Enables or disables the internal M.2 Wi-Fi radio module at firmware level.',
    lectureNote:
      'Can be disabled on wired-only lab workstations to enforce wired Ethernet policies.',
  },
  bluetoothDevice: {
    key: 'bluetoothDevice',
    category: 'system',
    title: 'Bluetooth Device',
    cctkKey: 'BluetoothDevice',
    factoryCctkValue: 'Enabled',
    summary:
      'Enables or disables the onboard Bluetooth controller prior to OS boot.',
    lectureNote:
      'Firmware-level Bluetooth toggle for secure workstation baselines.',
  },
  thunderboltEnabled: {
    key: 'thunderboltEnabled',
    category: 'system',
    title: 'Thunderbolt / USB4 Technology',
    summary:
      'Enables PCIe tunneling over USB-C / Thunderbolt 4 ports for high-speed docks, eGPUs, and NVMe enclosures.',
    lectureNote:
      'Because Thunderbolt exposes direct PCIe lanes, it interacts closely with Kernel DMA Protection and Thunderbolt Security Level.',
  },
  thunderboltSecurity: {
    key: 'thunderboltSecurity',
    category: 'system',
    title: 'Thunderbolt Security Level',
    summary:
      'Defines authorization policy before PCIe tunneling is established with a connected Thunderbolt peripheral.',
    lectureNote:
      '"No Security" leaves PCIe exposed; "User Authorization" prompts in OS; "Secure Connect" uses cryptographic challenge-response; "DisplayPort and USB Only" blocks PCIe DMA tunneling completely.',
  },
  integratedAudio: {
    key: 'integratedAudio',
    category: 'system',
    title: 'Enable Audio',
    summary:
      'Hardware-level enable/disable switch for the onboard Realtek High Definition Audio codec.',
    lectureNote:
      'Disabling at firmware level removes the PCIe/HDA device from ACPI tables so the OS cannot re-enable it.',
  },
  internalMicrophone: {
    key: 'internalMicrophone',
    category: 'system',
    title: 'Enable Microphone',
    summary:
      'Physically disconnects the internal digital array microphone from the audio DSP at firmware initialization.',
    lectureNote:
      'Preferred over OS mute in classified/SCIF facilities because software malware cannot override a firmware hardware cut.',
  },
  integratedCamera: {
    key: 'integratedCamera',
    category: 'system',
    title: 'Enable Camera',
    summary:
      'Disables the internal MIPI/USB webcam endpoint before OS enumeration.',
    lectureNote:
      'Complements physical camera shutters with firmware-level USB/MIPI bus isolation.',
  },
  usbPowerShare: {
    key: 'usbPowerShare',
    category: 'system',
    title: 'USB PowerShare',
    summary:
      'Supplies 5V power to the designated PowerShare USB port while the system is in S3/Modern Standby or S5 Off state.',
    lectureNote:
      'Stops supplying power once the internal battery falls below the configured reserve threshold.',
  },
  fnLockMode: {
    key: 'fnLockMode',
    category: 'system',
    title: 'Fn Lock Mode',
    summary:
      'Determines whether F1–F12 keys default to standard function keys (Standard) or media/brightness hotkeys (Secondary).',
    lectureNote:
      'Crucial ergonomics setting for developers and sysadmins who frequently use Alt+F4, F2, F5, and F12.',
  },
  tpmEnabled: {
    key: 'tpmEnabled',
    category: 'security',
    title: 'TPM 2.0 Security',
    summary:
      'Enables the discrete Trusted Platform Module 2.0 hardware root of trust and exposes it via ACPI to the operating system.',
    lectureNote:
      'Required for Windows 11, BitLocker automatic key sealing (PCR 0/2/4/7/11), Windows Hello for Business, and measured boot attestation.',
  },
  tpmPpiBypassEnable: {
    key: 'tpmPpiBypassEnable',
    category: 'security',
    title: 'PPI Bypass for Enable Commands',
    summary:
      'Allows OS-level management tools (like Dell Command | Configure) to enable TPM without a physical user pressing a key at POST.',
    lectureNote:
      'Physical Presence Interface (PPI) normally requires human confirmation at boot to prevent silent malware tampering.',
  },
  tpmPpiBypassClear: {
    key: 'tpmPpiBypassClear',
    category: 'security',
    title: 'PPI Bypass for Clear Commands',
    summary:
      'Allows remote automation to clear TPM endorsement and storage hierarchy keys without physical presence confirmation.',
    lectureNote:
      'Keep OFF in production unless zero-touch reprovisioning is required, as clearing the TPM destroys BitLocker keys.',
    riskNote: 'Clearing the TPM permanently erases all sealed keys and credentials.',
  },
  smmSecurityMitigation: {
    key: 'smmSecurityMitigation',
    category: 'security',
    title: 'SMM Security Mitigation',
    summary:
      'Enforces System Management Mode (Ring -2) memory isolation and restricts SMRAM page-table access during runtime.',
    lectureNote:
      'Hardens against firmware-level SMM privilege escalation vulnerabilities addressed in BIOS 1.20.0 (Critical Advisory T2C2C).',
  },
  uefiCapsuleUpdates: {
    key: 'uefiCapsuleUpdates',
    category: 'security',
    title: 'UEFI Capsule Firmware Updates',
    summary:
      'Allows signed BIOS updates (such as package T2C2C v1.20.0) to be staged via Windows Update / fwupd and flashed on next reboot.',
    lectureNote:
      'Linux LVFS (`fwupdmgr`) and Windows Update both deliver Dell BIOS 1.20.0 as signed UEFI Capsules.',
  },
  absolutePersistence: {
    key: 'absolutePersistence',
    category: 'security',
    title: 'Absolute® Persistence Module',
    summary:
      'Firmware-resident anti-theft and endpoint persistence agent embedded in SPI flash.',
    lectureNote:
      'Note the irreversible state: selecting "Permanently Disabled" blows a one-time firmware flag and cannot be re-enabled.',
  },
  dataWipeNextBoot: {
    key: 'dataWipeNextBoot',
    category: 'security',
    title: 'Wipe on Next Boot',
    summary:
      'Queues NIST SP 800-88 compliant cryptographic erase / NVMe Sanitize across all internal drives on the next reboot.',
    lectureNote:
      'Demonstrates built-in firmware sanitization used during corporate laptop decommissioning without needing external boot media.',
    riskNote: 'Destructive action: permanently erases all internal SSD partitions on next boot.',
  },
  adminPassword: {
    key: 'adminPassword',
    category: 'passwords',
    title: 'Admin Password',
    summary:
      'Protects BIOS Setup configuration changes and restricts one-time boot menu access when enabled.',
    lectureNote:
      'Click "Set / Manage" to assign a demo password (e.g. dell123). Subsequent edits or POST simulations will demonstrate the BIOS lock prompt!',
  },
  systemPassword: {
    key: 'systemPassword',
    category: 'passwords',
    title: 'System Password',
    summary:
      'Requires password authentication during every cold boot or reboot before the UEFI Boot Manager hands off to any OS.',
    lectureNote:
      'Unlike an OS login password, a System Password blocks execution before any storage device is accessed.',
  },
  nvmePassword: {
    key: 'nvmePassword',
    category: 'passwords',
    title: 'Internal SSD / NVMe Password',
    summary:
      'Sets an ATA/NVMe TCG Opal hardware lock directly on the SSD controller so the drive cannot be read even if removed.',
    lectureNote:
      'Hardware-level drive lock that protects data at rest independent of OS encryption.',
  },
  strongPassword: {
    key: 'strongPassword',
    category: 'passwords',
    title: 'Strong Password',
    summary:
      'Enforces minimum length (8+ chars) and uppercase/lowercase character complexity for BIOS passwords.',
    lectureNote:
      'Part of enterprise CIS / NIST baseline hardening policies.',
  },
  passwordBypass: {
    key: 'passwordBypass',
    category: 'passwords',
    title: 'Password Bypass',
    summary:
      'Allows warm reboots (e.g. Windows Update restarts) to bypass the System Password prompt while still requiring it on cold power-on.',
    lectureNote:
      'Balances security with unattended patching workflows.',
  },
  intelVtx: {
    key: 'intelVtx',
    category: 'virtualization',
    title: 'Intel® Virtualization Technology (VT-x)',
    summary:
      'Enables VMX root/non-root hardware CPU execution rings required by Type-1 and Type-2 hypervisors.',
    lectureNote:
      'Essential for WSL2, Hyper-V, VirtualBox, VMware Workstation, KVM/QEMU, and Windows Virtualization-Based Security (VBS).',
  },
  intelVtd: {
    key: 'intelVtd',
    category: 'virtualization',
    title: 'VT for Direct I/O (VT-d / IOMMU)',
    summary:
      'Enables hardware Input-Output Memory Management Unit (IOMMU) address translation and DMA remapping for PCIe devices.',
    lectureNote:
      'Required both for PCIe GPU/NIC passthrough to VMs and for protecting system RAM against rogue DMA attacks from external devices.',
  },
  intelTxt: {
    key: 'intelTxt',
    category: 'virtualization',
    title: 'Trusted Execution Technology (TXT)',
    summary:
      'Supports hardware-rooted Dynamic Root of Trust for Measurement (DRTM) to launch verified hypervisors.',
    lectureNote:
      'Used in high-assurance servers and enterprise Secured-Core PCs alongside TPM 2.0.',
  },
  kernelDmaProtection: {
    key: 'kernelDmaProtection',
    category: 'virtualization',
    title: 'Kernel DMA Protection',
    summary:
      'Uses VT-d / IOMMU isolation at pre-boot and OS runtime to block unauthorized Direct Memory Access from Thunderbolt/PCIe ports.',
    lectureNote:
      'Directly mitigates external PCIe/Thunderbolt cold-boot and DMA memory-scraping attacks.',
  },
  fastboot: {
    key: 'fastboot',
    category: 'preboot',
    title: 'Fastboot',
    summary:
      'Controls hardware initialization depth during POST: Minimal skips non-essential checks, Thorough performs full memory and bus training.',
    lectureNote:
      'Switch to "Thorough" and run the Reboot Demo to show students extended memory training and full device enumeration.',
  },
  extendPostTime: {
    key: 'extendPostTime',
    category: 'preboot',
    title: 'Extend BIOS POST Time',
    summary:
      'Adds a fixed delay (0s, 5s, or 10s) to the Dell splash screen so users have time to press F2 or F12.',
    lectureNote:
      'Very practical tip for students: NVMe SSDs boot so fast that pressing F2 can be difficult without extending POST time.',
  },
  adapterWarnings: {
    key: 'adapterWarnings',
    category: 'preboot',
    title: 'Adapter Warnings',
    summary:
      'Displays a pre-boot warning if an undersized USB-C / barrel AC adapter is connected (e.g., 45W on a 130W workstation).',
    lectureNote:
      'Explains why Dell throttles CPU turbo clocks when an unrecognized or low-wattage charger is detected.',
  },
  numLockAtBoot: {
    key: 'numLockAtBoot',
    category: 'preboot',
    title: 'Enable NumLock at Boot',
    summary:
      'Initializes the keyboard NumLock state ON during POST before OS handoff.',
    lectureNote: 'Useful for numeric PIN entry in BitLocker pre-boot authentication.',
  },
  warningsAndErrors: {
    key: 'warningsAndErrors',
    category: 'preboot',
    title: 'Warnings and Errors',
    summary:
      'Determines whether POST pauses for user acknowledgment on non-fatal warnings (fan, battery, thermal) or continues automatically.',
    lectureNote:
      'Headless lab machines often use "Continue on Warnings" to avoid stalling unattended reboots.',
  },
  thermalManagement: {
    key: 'thermalManagement',
    category: 'power',
    title: 'Thermal Management',
    summary:
      'Tunes Intel DPTF / fan curves and PL1/PL2 power limits between acoustic comfort and sustained turbo performance.',
    lectureNote:
      'Optimized balances acoustics and thermals; Ultra Performance maximizes fan RPM and sustained TDP for heavy compilation or VM workloads.',
  },
  wakeOnAc: {
    key: 'wakeOnAc',
    category: 'power',
    title: 'Wake on AC',
    summary:
      'Automatically powers on the system whenever AC wall power is restored or connected.',
    lectureNote:
      'Essential for lab racks, classroom podiums, and remote workstations after power outages.',
  },
  blockSleep: {
    key: 'blockSleep',
    category: 'power',
    title: 'Block Sleep',
    summary:
      'Prevents the operating system from entering S3 / Modern Standby (S0ix) sleep states.',
    lectureNote:
      'Used on Dell Pro Micro QBM1250 lab hosts or digital signage that must remain continuously reachable over the network without dropping into OS sleep. Leave OFF if normal sleep with Wake-on-LAN from S4/S5 is desired.',
  },
  deepSleepControl: {
    key: 'deepSleepControl',
    category: 'power',
    title: 'Deep Sleep Control',
    cctkKey: 'DeepSleepCtrl',
    factoryCctkValue: 'EnabledInS4AndS5',
    summary:
      'Powers down USB and onboard LAN standby rails in S4 (Hibernate) and S5 (Soft Off) to meet ErP Lot 6 low-power limits.',
    lectureNote:
      'CRITICAL FOR QBM1250 WAKE-ON-LAN: When Deep Sleep Control is enabled in S5 or S4/S5, the 3.3V standby rail to the onboard NIC is cut, so Magic Packets are ignored. You MUST set this to "Disabled" for Wake-on-LAN to function from shutdown.',
    riskNote:
      'Enabling Deep Sleep in S4/S5 disables Wake-on-LAN from shutdown or hibernate.',
  },
  usbWakeSupport: {
    key: 'usbWakeSupport',
    category: 'power',
    title: 'USB Wake Support',
    summary:
      'Allows external USB keyboards, mice, or dock power buttons to wake the system from standby.',
    lectureNote: 'Requires standby 5V rail on USB ports.',
  },
  intelSpeedShift: {
    key: 'intelSpeedShift',
    category: 'power',
    title: 'Intel® Speed Shift Technology',
    summary:
      'Delegates P-state frequency scaling directly to the CPU hardware (HWP) for sub-millisecond clock transitions.',
    lectureNote:
      'Replaces older OS-controlled ACPI P-state polling with autonomous hardware voltage/frequency scaling.',
  },
  wakeOnLan: {
    key: 'wakeOnLan',
    category: 'systemmanagement',
    title: 'Wake on LAN / WLAN',
    cctkKey: 'WakeOnLan',
    factoryCctkValue: 'Disabled',
    summary:
      'Allows the Dell Pro Micro QBM1250 to be powered on from S4 (Hibernate) or S5 (Soft Off) via a network Magic Packet.',
    lectureNote:
      'Imported QBM1250 config sets WakeOnLan=LanOnly (changed from Factory Disabled) together with DeepSleepCtrl=Disabled and EmbNic1=EnabledPxe.',
  },
  acRecovery: {
    key: 'acRecovery',
    category: 'systemmanagement',
    title: 'AC Recovery',
    summary:
      'Determines how the QBM1250 desktop behaves when AC wall power is restored after an unexpected power loss.',
    lectureNote:
      'Important companion to Wake-on-LAN: if a power outage occurs, "Power Off" leaves the NIC uninitialized until a cold boot unless "Last Power State" or "Power On" is selected.',
  },
  autoOnTime: {
    key: 'autoOnTime',
    category: 'systemmanagement',
    title: 'Auto On Time',
    summary:
      'Schedules an RTC (Real-Time Clock) hardware alarm to power on the system automatically on a daily or weekday schedule.',
    lectureNote:
      'Used alongside Wake-on-LAN for predictable overnight lab patching windows.',
  },
  serrMessages: {
    key: 'serrMessages',
    category: 'systemmanagement',
    title: 'SERR Messages',
    summary:
      'Enables or disables PCIe System Error (SERR#) reporting to firmware during runtime and POST.',
    lectureNote:
      'Helps diagnose faulty PCIe add-in cards or M.2 risers.',
  },
  supportAssistRecovery: {
    key: 'supportAssistRecovery',
    category: 'update',
    title: 'SupportAssist OS Recovery',
    summary:
      'Enables Dell’s embedded pre-boot recovery partition to repair unbootable OS installs or capture telemetry.',
    lectureNote:
      'Accessible via F12 One-Time Boot Menu even if the Windows bootloader is corrupted.',
  },
  biosConnect: {
    key: 'biosConnect',
    category: 'update',
    title: 'BIOSConnect',
    summary:
      'Allows the UEFI firmware to initialize Wi-Fi/Ethernet natively before OS load to download a cloud recovery image over HTTPS.',
    lectureNote:
      'Demonstrates a full UEFI network stack + TLS client living inside the 32 MB SPI flash chip!',
  },
  rollbackProtection: {
    key: 'rollbackProtection',
    category: 'update',
    title: 'UEFI BIOS Rollback Protection',
    summary:
      'Prevents flashing older BIOS versions prior to critical security baseline 1.20.0 (Driver ID T2C2C).',
    lectureNote:
      'Crucial anti-rollback defense: once a Critical security BIOS like 1.20.0 patches SMM or microcode flaws, attackers cannot downgrade to re-introduce known exploits.',
  },
};

export const LECTURE_SCENARIOS: LectureScenario[] = [
  {
    id: 'imported-qbm1250',
    title: '1. Imported QBM1250 Config (.ini)',
    subtitle: 'Actual 8J3TFK4 export (5 changes vs Factory)',
    description:
      'Loads QBM1250_bios_config_58746970.ini: SecureBoot OFF, AHCI/NVMe, DeepSleep Disabled, WakeOnLan LAN Only, BootOrder +hdd.2 first.',
    patch: {
      ...IMPORTED_QBM1250_CONFIG,
      bootSequence: IMPORTED_BOOT_SEQUENCE.map((b) => ({ ...b })),
    },
  },
  {
    id: 'default',
    title: '2. Dell Factory Original (Shipping State)',
    subtitle: 'Unmodified QBM1250 factory baseline',
    description:
      'Secure Boot ON, RAID On (Intel VMD), Deep Sleep S4/S5 ON, Wake on LAN Disabled, BootOrder +hdd.1 primary.',
    patch: {
      ...FACTORY_BIOS_CONFIG,
      bootSequence: FACTORY_BOOT_SEQUENCE.map((b) => ({ ...b })),
    },
  },
  {
    id: 'linux-dualboot',
    title: '3. Linux Dual-Boot & Secure Boot Trap',
    subtitle: 'Storage AHCI + Secure Boot ON vs Unsigned hdd.2',
    description:
      'Keeps Secure Boot ON with unsigned hdd.2 as Boot #1 to demonstrate Secure Boot Violation during POST.',
    patch: {
      sataNvmeOperation: 'AHCI/NVMe',
      secureBoot: true,
      fastboot: 'Thorough',
      extendPostTime: '5 Seconds',
      bootSequence: IMPORTED_BOOT_SEQUENCE.map((b) => ({ ...b })),
    },
  },
  {
    id: 'hypervisor-lab',
    title: '4. Hypervisor & PCIe Passthrough',
    subtitle: 'Virtualization, IOMMU & Thermal Performance',
    description:
      'Enables VT-x, VT-d (IOMMU), Intel TXT, Kernel DMA Protection, and Ultra Performance thermal profile.',
    patch: {
      intelVtx: true,
      intelVtd: true,
      intelTxt: true,
      kernelDmaProtection: true,
      thermalManagement: 'Ultra Performance',
      intelSpeedShift: true,
    },
  },
  {
    id: 'zero-trust',
    title: '5. Enterprise Zero-Trust Lockdown',
    subtitle: 'Hardened endpoint & Admin Password (dell123)',
    description:
      'Enforces Secure Boot Deployed Mode, disables external USB boot, sets Admin Password "dell123", Thunderbolt Secure Connect.',
    patch: {
      secureBoot: true,
      secureBootMode: 'Deployed Mode',
      uefiBootPathSecurity: 'Always',
      externalUsbBoot: false,
      tpmEnabled: true,
      smmSecurityMitigation: true,
      thunderboltSecurity: 'Secure Connect',
      adminPassword: 'dell123',
      strongPassword: false,
      rollbackProtection: true,
    },
  },
];

export const INITIAL_LOGS: BiosLogEntry[] = [
  {
    id: 'log-0',
    timestamp: '2026-11-16 06:18:00',
    category: 'BIOS Events',
    severity: 'INFO',
    message:
      'Imported CCTK config QBM1250_bios_config_58746970.ini (SvcTag 8J3TFK4, BiosVer 1.18.2): 5 differences detected vs Dell Factory Original.',
  },
  {
    id: 'log-1',
    timestamp: '2026-11-03 14:22:08',
    category: 'BIOS Events',
    severity: 'INFO',
    message: 'UEFI Capsule Update applied: System BIOS 1.20.0 (Package ID: T2C2C, Critical).',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-03 14:22:19',
    category: 'BIOS Events',
    severity: 'SECURITY',
    message: 'SMM Security Mitigation verified & UEFI Rollback Protection baseline updated to 1.20.0.',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-15 08:15:42',
    category: 'Power Events',
    severity: 'INFO',
    message: 'System power-on via 130W External AC Adapter (Dell Pro Micro Plus QBM1250).',
  },
  {
    id: 'log-4',
    timestamp: '2026-11-15 08:15:44',
    category: 'Thermal Events',
    severity: 'INFO',
    message: 'Thermal Management profile initialized: Optimized (CPU Package 39°C, Blower 1450 RPM).',
  },
];

export interface FactoryDiffItem {
  key: keyof BiosConfig;
  category: CategoryId;
  categoryLabel: string;
  label: string;
  cctkKey?: string;
  factoryValue: string;
  currentValue: string;
}

export function formatBiosSettingValue(key: keyof BiosConfig, value: unknown): string {
  if (key === 'bootSequence' && Array.isArray(value)) {
    return (value as BootEntry[])
      .map((b) => `${b.enabled ? '+' : '-'}${b.cctkCode}`)
      .join(',');
  }
  if (key === 'adminPassword' || key === 'systemPassword' || key === 'nvmePassword') {
    return value ? 'Set (••••••)' : 'Not Set';
  }
  if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
  if (typeof value === 'string') return value === '' ? 'Not Set' : value;
  return String(value);
}

export function computeFactoryDiffs(config: BiosConfig): FactoryDiffItem[] {
  const diffs: FactoryDiffItem[] = [];
  (Object.keys(FACTORY_BIOS_CONFIG) as (keyof BiosConfig)[]).forEach((key) => {
    if (JSON.stringify(config[key]) === JSON.stringify(FACTORY_BIOS_CONFIG[key])) {
      return;
    }
    const meta = SETTING_HELP_MAP[key];
    const category: CategoryId = meta?.category ?? 'overview';
    const categoryLabel =
      BIOS_CATEGORIES.find((c) => c.id === category)?.label ?? category;
    diffs.push({
      key,
      category,
      categoryLabel,
      label: meta?.title ?? String(key),
      cctkKey: meta?.cctkKey,
      factoryValue: formatBiosSettingValue(key, FACTORY_BIOS_CONFIG[key]),
      currentValue: formatBiosSettingValue(key, config[key]),
    });
  });
  return diffs;
}

