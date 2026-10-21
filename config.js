// Konfigurasi terpusat. Nilai sensitif dibaca dari environment / file .env
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BASE_DIR = path.dirname(fileURLToPath(import.meta.url));

export const APP_PATH = path.resolve(
  BASE_DIR,
  process.env.APP_PATH || "app/app-release.apk",
);
export const DEVICE_NAME = process.env.DEVICE_NAME || "Android Emulator";
export const EVIDENCE_DIR = path.join(BASE_DIR, "evidence");

// Dari AndroidManifest.xml aplikasi
export const APP_PACKAGE = "com.example.belajar_bareng";

export const TEST_EMAIL = process.env.TEST_EMAIL;
export const TEST_PASSWORD = process.env.TEST_PASSWORD;

// Teks notifikasi yang ada di dalam aplikasi
export const MSG_LOGIN_SUCCESS = "Login berhasil";
export const MSG_LOGIN_FAILED = "Email atau password yang Anda masukkan salah";

// Alur posting feed
export const HINT_CAPTION = "Apa yang kamu pikirkan hari ini?";
export const TEXT_CREATE_POST = "Buat Postingan";
export const TEXT_POST_BUTTON = "Posting";
export const MSG_POST_SUCCESS = "Post berhasil";
