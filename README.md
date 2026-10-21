# BelajarBarengApps - Automation Test (Node.js + WebdriverIO + Appium + Allure)

Automation untuk aplikasi **Belajar Bareng** (Flutter, package `com.example.belajar_bareng`).
Stack: Node.js, JavaScript (ESM), WebdriverIO v9, Appium 2 (UiAutomator2), Mocha, Allure Report.

Skenario:

- **TC-LOGIN-001** - login dengan akun valid, assert notifikasi **"Login berhasil"** tampil.
- **TC-LOGIN-002** (tambahan) - password salah, assert pesan error tampil.
- **TC-POST-001** - login, buat postingan feed dengan **caption acak**, assert notifikasi **"Post berhasil"** tampil dan caption muncul di feed.

## 1. Prasyarat

- Node.js 18.20+ (disarankan 20 atau 22)
- Android SDK + emulator (atau HP Android dengan USB debugging). Cek dengan `adb devices`
- Java JDK 11+ (dibutuhkan Allure CLI untuk membuat report)

## 2. Setup

```bash
npm install
npm run setup:driver          # install driver UiAutomator2 untuk Appium (sekali saja)

cp .env.example .env          # Windows: copy .env.example .env
# isi TEST_EMAIL dan TEST_PASSWORD di .env
# letakkan APK di: app/app-release.apk
```

`TEST_EMAIL`/`TEST_PASSWORD` harus akun yang **sudah terdaftar** (daftar lewat menu Register di aplikasi; jika Supabase mewajibkan konfirmasi email, konfirmasi dulu).

## 3. Menjalankan test

Nyalakan emulator / sambungkan HP, lalu:

```bash
npm test
```

Hanya satu skenario: `npm run test:login` atau `npm run test:post`.
Catatan: test posting benar-benar membuat postingan di backend (Supabase), satu postingan per run.
Appium dijalankan otomatis oleh WebdriverIO, jadi tidak perlu terminal terpisah.
Screenshot bukti tersimpan otomatis di `evidence/` (mis. `01_login_berhasil.png`) dan terlampir di Allure.

## 4. Allure Report

```bash
npm run report:serve          # membuat report lalu membukanya di browser
# atau
npm run report:generate && npm run report:open
```

Ambil screenshot halaman **Overview** dan detail test (steps + attachment), simpan ke `evidence/`
(mis. `allure_overview.png`, `allure_detail.png`). Ambil juga screenshot terminal yang menunjukkan
test **passed** (mis. `terminal_test.png`).

## 5. Push ke GitHub

Buat repo kosong di GitHub, lalu:

```bash
git init
git add .
git commit -m "Add WebdriverIO login automation for BelajarBarengApps"
git branch -M main
git remote add origin https://github.com/USERNAME/BelajarBarengApps-Automation.git
git push -u origin main
```

`.env`, `node_modules/`, dan APK sudah di-ignore, jadi kredensial tidak ikut ter-push.

## Struktur

```
wdio.conf.js                 konfigurasi WebdriverIO, Appium, Allure
config.js                    konstanta + pembacaan .env
test/pageobjects/            Page Object (base.page.js, login.page.js)
test/specs/login.spec.js     test case login
test/helpers/step.js         helper step untuk Allure
scripts/build-submission-pdf.js   pembuat PDF
```

## Troubleshooting

- **"Halaman Login tidak ditemukan"** - aplikasi mungkin terbuka di halaman lain. Buka **Appium Inspector**, cek elemen asli, lalu sesuaikan selector di `test/pageobjects/login.page.js`.
- **Notifikasi tidak terdeteksi** - SnackBar hanya tampil beberapa detik. Cek teks di Inspector (content-desc atau text) dan ubah `MSG_LOGIN_SUCCESS` di `config.js`.
- **Sesi Appium gagal dibuat** - pastikan emulator/HP terdeteksi di `adb devices`, driver sudah di-install (`npm run setup:driver`), dan `DEVICE_NAME` sesuai.
- **`allure` tidak jalan** - pastikan Java terpasang (`java -version`).
