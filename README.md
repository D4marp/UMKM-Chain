# UMKMChain - KARISMA OJK 2026 Demo Monorepo

Platform regtech + fintech + financial inclusion untuk UMKM Indonesia.

Tema:

**Empowering MSMEs through Event-Driven Blockchain and IPFS Digital Ecosystems**

UMKMChain **bukan** aplikasi crypto trading. Fokus utama adalah onboarding identitas usaha, transparansi pembiayaan, pemantauan risiko, dan pengawasan regulator berbasis event-driven blockchain.

## 1. Arsitektur Singkat

```text
apps/web        -> Next.js dashboard (MSME, Lender, Regulator)
apps/api        -> Express + Socket.io + IPFS + smart contract bridge
packages/contracts -> Solidity UMKMFinance + Hardhat
packages/shared -> shared constants + ABI
packages/seed-data -> data UMKM Indonesia
infra/docker-compose.yml -> local MongoDB/PostgreSQL for demo infra
```

## 2. Fitur yang Sudah Terimplementasi

### MSME Dashboard
 
- Upload invoice via UI
- Pin dokumen ke IPFS (Pinata jika token tersedia, fallback local mock)
- Submit hash dokumen ke smart contract `submitDocument(hash)`
- Simpan status dokumen (`PENDING`, `SUBMITTED`, `CONFIRMED`, `FAILED`)
- Timeline riwayat dokumen on-chain di dashboard

### SIWE Role Authentication

- Login menggunakan MetaMask + SIWE message signature
- Role yang didukung: `MSME`, `LENDER`, `REGULATOR`
- Session disimpan lokal sebagai token JWT demo
- Dashboard memeriksa role sebelum menampilkan fitur utama

### Login Demo / Register

- Akun demo default sudah di-seed di backend untuk `MSME`, `LENDER`, dan `REGULATOR`
- Login/register memakai endpoint JSON biasa untuk demo cepat tanpa wallet
- Demo mode di halaman login memakai akun seeded yang sudah punya token JWT valid

#### Ringkasan payload endpoint

| Area | Endpoint | Payload singkat |
| --- | --- | --- |
| Auth | `POST /api/auth/register` | `{ email, password, role }` |
| Auth | `POST /api/auth/login` | `{ email, password }` |
| Auth | `GET /api/auth/demo?role=MSME` | `role` sebagai query param |
| Funding | `POST /api/funding/msme/register` | `{ businessId, businessName, owner, city, sector, walletAddress }` |
| Funding | `POST /api/funding/request/confirm` | `{ msmeId, amount, tenorMonths, purpose, walletAddress, txHash? }` |
| Funding | `POST /api/funding/document/upload` | `{ msmeId, fileName, fileContent, walletAddress? }` |

### MSME Onboarding and Funding

- Register usaha via `registerMSME()` dari dashboard MSME
- Ajukan pembiayaan via `requestFunding()` dari dashboard MSME
- Dashboard lender membaca request list dan event stream secara realtime

### Event Bridge Solidity -> Socket.io

- API listener memantau event smart contract dari RPC (`watchContractEvent`)
- Event penting dipush ke channel Socket.io:
  - `contract:event` (global)
  - `contract:event:lender` (room role LENDER)
  - `contract:event:regulator` (room role REGULATOR)
- Dashboard lender dan regulator subscribe event secara real-time

### Smart Contract Module

Contract `UMKMFinance` mencakup:

- `registerMSME(string businessId)`
- `submitDocument(string hash)`
- `requestFunding(uint256 amount)`
- `approveFunding(uint256 id)`
- `repayLoan(uint256 id)`
- `updateCreditScore(address msme, uint256 score)`

Event Solidity:

- `MSMERegistered`
- `DocumentUploaded`
- `FundingRequested`
- `FundingApproved`
- `PaymentCompleted`

## 3. Prasyarat

- Node.js 20+
- npm 10+
- MetaMask (untuk browser wallet flow)
- (Opsional) Docker untuk infra lokal

## 4. Setup Cepat

### 4.1 Install dependency

```bash
npm install
```

### 4.2 Copy file environment

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp packages/contracts/.env.example packages/contracts/.env
```

### 4.3 Isi environment penting

#### Root `.env`

- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `NEXT_PUBLIC_CHAIN_ID=11155111`
- `NEXT_PUBLIC_CONTRACT_ADDRESS=<alamat kontrak sepolia/local>`
- `RPC_URL=<rpc sepolia atau local node>`
- `PRIVATE_KEY=<private key deployer/test wallet>`
- `PINATA_JWT=<pinata jwt, optional>`

#### API `.env`

- `CONTRACT_ADDRESS=<alamat kontrak UMKMFinance>`
- `CHAIN_ID=11155111`
- `RPC_URL=<rpc url>`
- `PRIVATE_KEY=<wallet server untuk submit hash mode backend>`
- `PINATA_JWT=<pinata jwt, optional>`

> Jika `PINATA_JWT` tidak diisi, upload IPFS tetap jalan dalam mode fallback local-mock.

### 4.4 Seed data

```bash
npm run seed
```

### 4.5 Jalankan semua service

```bash
npm run dev
```

Akses:

- Web: http://localhost:3000
- API: http://localhost:4000

## 5. Deploy Smart Contract (Hardhat)

### 5.1 Compile + test

```bash
npm run contracts:compile
npm run contracts:test
```

### 5.2 Deploy ke localhost

Terminal A:

```bash
npm run node --workspace=@umkmchain/contracts
```

Terminal B:

```bash
npm run deploy:localhost --workspace=@umkmchain/contracts
```

### 5.3 Deploy ke Sepolia

Pastikan `packages/contracts/.env` terisi `RPC_URL` + `PRIVATE_KEY`, lalu:

```bash
npm run deploy:sepolia --workspace=@umkmchain/contracts
```

Copy alamat kontrak hasil deploy ke:

- `apps/api/.env` -> `CONTRACT_ADDRESS`
- `apps/web/.env.local` -> `NEXT_PUBLIC_CONTRACT_ADDRESS`

## 6. Runbook Demo Day KARISMA OJK 2026

### 6.1 Checklist teknis sebelum presentasi

1. `npm install` sukses tanpa error fatal.
2. `npm run contracts:test` passing.
3. `npm run build` sukses untuk semua workspace.
4. API startup log menampilkan `Contract event bridge active on ...`.
5. Dashboard lender/regulator menampilkan status stream `connected`.

### 6.2 Skenario presentasi yang direkomendasikan

1. Buka `/dashboard/msme`, upload invoice.
2. Tunjukkan response status dokumen (IPFS + chain submission).
3. Buka `/dashboard/lender`, lihat event real-time masuk.
4. Buka `/dashboard/regulator`, tunjukkan feed event + KPI monitoring.

### 6.3 Fallback plan jika RPC/IPFS bermasalah

1. Kosongkan `PINATA_JWT` -> sistem pakai local-mock hash.
2. Jika tx on-chain gagal, UI tetap menampilkan status `FAILED` dan detail error.
3. Event dari alur aplikasi masih dikirim via Socket.io untuk menjaga demo continuity.

## 7. Endpoint API Utama

- `GET /api/health`
- `GET /api/funding/requests`
- `POST /api/funding/request`
- `POST /api/funding/:id/approve`
- `POST /api/funding/:id/repay`
- `POST /api/funding/document/upload`
- `GET /api/funding/documents?msmeId=UMKM-001`
- `GET /api/funding/events`
- `GET /api/dashboard/msme`
- `GET /api/dashboard/lender`
- `GET /api/dashboard/regulator`

## 8. Catatan Operasional

- Gunakan wallet testnet khusus demo, jangan wallet produksi.
- Jangan commit private key atau secret env ke repository.
- Untuk demo stabil, siapkan dua RPC endpoint (primary + cadangan) di catatan tim.

## 9. Struktur File Kunci

- `apps/web/app/dashboard/msme/page.js`
- `apps/web/app/dashboard/lender/page.js`
- `apps/web/app/dashboard/regulator/page.js`
- `apps/web/lib/use-realtime-events.js`
- `apps/api/src/controllers/funding.controller.js`
- `apps/api/src/services/contract-event-listener.service.js`
- `apps/api/src/services/event-bridge.service.js`
- `apps/api/src/services/ipfs.service.js`
- `apps/api/src/services/contract.service.js`
- `packages/contracts/contracts/UMKMFinance.sol`

## 10. Next Hardening (Post-Competition)

- Persist data ke MongoDB/PostgreSQL (bukan in-memory state)
- Tambah SIWE untuk auth wallet role-based
- Tambah integration test untuk alur IPFS + chain + websocket
- Tambah CI/CD deployment otomatis untuk environment staging/demo
# UMKM-Chain
