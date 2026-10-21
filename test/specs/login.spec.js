import assert from "node:assert/strict";
import allureReporter from "@wdio/allure-reporter";
import LoginPage from "../pageobjects/login.page.js";
import { step } from "../helpers/step.js";
import { TEST_EMAIL, TEST_PASSWORD } from "../../config.js";

describe("Login", () => {
  before(() => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error(
        "TEST_EMAIL dan TEST_PASSWORD belum diisi. Salin .env.example menjadi .env lalu isi.",
      );
    }
  });

  beforeEach(async () => {
    await LoginPage.resetApp();
  });

  it("TC-LOGIN-001: Login valid menampilkan notifikasi 'Login berhasil'", async () => {
    allureReporter.addEpic("BelajarBarengApps");
    allureReporter.addFeature("Login");
    allureReporter.addStory("Login berhasil");
    allureReporter.addSeverity("critical");

    await step("Buka halaman Login", () => LoginPage.waitUntilLoaded());
    await step("Isi email", () => LoginPage.enterEmail(TEST_EMAIL));
    await step("Isi password", () => LoginPage.enterPassword(TEST_PASSWORD));
    await step("Tekan tombol Login", () => LoginPage.tapLogin());
    await step("Verifikasi notifikasi 'Login berhasil' tampil", async () => {
      const shown = await LoginPage.isSuccessMessageDisplayed();
      if (shown) await LoginPage.screenshot("01_login_berhasil");
      assert.ok(
        shown,
        "Notifikasi 'Login berhasil' tidak tampil setelah menekan tombol Login",
      );
    });
  });

  it("TC-LOGIN-002 (tambahan): Password salah menampilkan pesan error", async () => {
    allureReporter.addEpic("BelajarBarengApps");
    allureReporter.addFeature("Login");
    allureReporter.addStory("Login gagal");
    allureReporter.addSeverity("normal");

    await step("Buka halaman Login", () => LoginPage.waitUntilLoaded());
    await step("Login dengan password salah", () =>
      LoginPage.login(TEST_EMAIL, `${TEST_PASSWORD}_salah`),
    );
    await step("Verifikasi pesan error tampil", async () => {
      const shown = await LoginPage.isErrorMessageDisplayed();
      if (shown) await LoginPage.screenshot("02_login_gagal");
      assert.ok(
        shown,
        "Pesan error login tidak tampil untuk password yang salah",
      );
    });
  });
});
