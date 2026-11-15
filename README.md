# Dell System BIOS 1.20.0 (T2C2C) — UEFI Setup & QBM1250 Emulator

An interactive **Dell UEFI BIOS Setup Utility** and **POST / Wake-on-LAN Simulator** built for technical lectures and live classroom demonstrations (modeled on **Dell Pro Micro Plus QBM1250**, System BIOS `1.20.0`, Driver ID `T2C2C`, Released `03 Nov 2026`).

## Features
- **3-Pane Dell UEFI Setup Interface**: Interactive toggles, radio selectors, dropdowns, UEFI Boot Sequence reordering, and global search (`Ctrl+F`).
- **Live QBM1250 Wake-on-LAN (WoL) Workflow**:
  - `System Management` (`Wake on LAN / WLAN`, `AC Recovery`, `Auto On Time`, `SERR Messages`)
  - `Power` (`Deep Sleep Control`, `Block Sleep`, `USB Wake Support`) with live dependency warnings
  - `System Configuration` (`Integrated NIC`, `Thunderbolt Security`, hardware kill switches)
  - Built-in **How to Enable Wake-on-LAN Guide (English & Deutsch)** covering BIOS, Windows Fast Startup, NIC Power Management / Advanced Driver properties, and Magic Packet testing
  - **Test S5 Wake-on-LAN** simulator demonstrating Magic Packet drops vs. successful S5 wake
- **POST & Boot-Chain Simulator**: Demonstrates `F2 Setup`, `F12 One-Time Boot Menu`, Admin/System Password gates, `Secure Boot Violation` on unsigned EFI binaries, and `INACCESSIBLE_BOOT_DEVICE` when switching `RAID On` to `AHCI/NVMe`.
- **Lecture Scenario Presets**: One-click configurations for Factory Default, Wake-on-LAN Lab, Linux Dual-Boot & AHCI, Hypervisor/VT-d, and Zero-Trust Lockdown.

---

## Deploying via GitHub & Docker on Your Server

### 1. Push this repository to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Dell QBM1250 BIOS 1.20.0 emulator"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Run on your server with Docker Compose
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
docker compose up -d --build
```

The emulator will be available at `http://<your-server-ip>:8080`.
To use a different host port (for example port `3000` or `80`), run:
```bash
PORT=3000 docker compose up -d --build
```

### 3. Alternative: Plain Docker CLI
```bash
docker build -t dell-bios-emulator .
docker run -d --name dell-bios-emulator -p 8080:80 --restart unless-stopped dell-bios-emulator
```

### 4. Local Development (Node.js 20+)
```bash
npm install
npm run dev
```
