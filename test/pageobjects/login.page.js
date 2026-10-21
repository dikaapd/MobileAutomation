import assert from "node:assert/strict";
import { $$, browser } from "@wdio/globals";
import BasePage, { textSelectors } from "./base.page.js";
import { MSG_LOGIN_FAILED, MSG_LOGIN_SUCCESS } from "../../config.js";

class LoginPage extends BasePage {
  get inputSelector() {
    return 'android=new UiSelector().className("android.widget.EditText")';
  }

  get loginButtonSelectors() {
    return [
      'android=new UiSelector().className("android.widget.Button").descriptionContains("Login")',
      'android=new UiSelector().className("android.widget.Button").textContains("Login")',
      'android=new UiSelector().clickable(true).descriptionContains("Login")',
      'android=new UiSelector().clickable(true).textContains("Login")',
    ];
  }

  async inputs() {
    return $$(this.inputSelector);
  }

  async waitUntilLoaded(timeout = 20000) {
    const end = Date.now() + timeout;
    let count = 0;
    while (Date.now() < end) {
      count = (await this.inputs()).length;
      if (count >= 2) break;
      await browser.pause(500);
    }
    assert.equal(
      count,
      2,
      `Halaman Login tidak ditemukan (input terdeteksi: ${count}, seharusnya 2: email & password). ` +
        "Cek locator dengan Appium Inspector.",
    );
  }

  async enterEmail(email) {
    const field = (await this.inputs())[0];
    await field.click();
    await field.setValue(email);
  }

  async enterPassword(password) {
    const field = (await this.inputs())[1];
    await field.click();
    await field.setValue(password);
  }

  async findLoginButton(timeout) {
    let button = await this.waitForAny(this.loginButtonSelectors, timeout);
    if (!button) {
      // Cadangan: elemen TERAKHIR yang memuat teks "Login" (judul halaman biasanya muncul sebelum tombol)
      for (const selector of textSelectors("Login")) {
        const matches = await $$(selector);
        if (matches.length > 0) {
          button = matches[matches.length - 1];
          break;
        }
      }
    }
    return button;
  }

  async tapLogin() {
    let button = await this.findLoginButton(5000);
    if (!button) {
      await this.hideKeyboard();
      button = await this.findLoginButton(10000);
    }
    let foreground = "?";
    try {
      foreground = await browser.getCurrentPackage();
    } catch {
      // abaikan
    }
    assert.ok(
      button,
      `Tombol Login tidak ditemukan. App di layar saat ini: ${foreground} ` +
        "(jika bukan com.example.belajar_bareng, aplikasi keluar/crash). Lihat evidence/debug_*.xml",
    );
    await button.click();
  }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapLogin();
  }

  async isSuccessMessageDisplayed(timeout = 15000) {
    return (
      (await this.waitForAny(textSelectors(MSG_LOGIN_SUCCESS), timeout)) !==
      null
    );
  }

  async isErrorMessageDisplayed(timeout = 15000) {
    return (
      (await this.waitForAny(textSelectors(MSG_LOGIN_FAILED), timeout)) !== null
    );
  }
}

export default new LoginPage();
