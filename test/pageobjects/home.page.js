import assert from "node:assert/strict";
import { $$, browser } from "@wdio/globals";
import BasePage, { textSelectors } from "./base.page.js";
import {
  HINT_CAPTION,
  MSG_POST_SUCCESS,
  TEXT_CREATE_POST,
  TEXT_POST_BUTTON,
} from "../../config.js";

const UIA = "android=new UiSelector()";

class HomePage extends BasePage {
  get captionSelectors() {
    return [
      `//android.widget.EditText[contains(@hint,"${HINT_CAPTION}")]`,
      `${UIA}.className("android.widget.EditText").textContains("Apa yang kamu pikirkan")`,
      `${UIA}.className("android.widget.EditText").descriptionContains("Apa yang kamu pikirkan")`,
      `${UIA}.descriptionContains("Apa yang kamu pikirkan")`,
      `${UIA}.className("android.widget.EditText")`, // cadangan: input pertama di layar
    ];
  }

  // Tombol / judul "Buat Postingan" (jika composer harus dibuka dulu)
  get createPostSelectors() {
    return [
      `${UIA}.clickable(true).descriptionContains("${TEXT_CREATE_POST}")`,
      `${UIA}.clickable(true).textContains("${TEXT_CREATE_POST}")`,
      ...textSelectors(TEXT_CREATE_POST),
    ];
  }

  get postButtonSelectors() {
    return [
      `${UIA}.className("android.widget.Button").description("${TEXT_POST_BUTTON}")`,
      `${UIA}.className("android.widget.Button").text("${TEXT_POST_BUTTON}")`,
      `${UIA}.clickable(true).description("${TEXT_POST_BUTTON}")`,
      `${UIA}.clickable(true).text("${TEXT_POST_BUTTON}")`,
      `~${TEXT_POST_BUTTON}`,
    ];
  }

  async waitUntilLoaded(timeout = 30000) {
    const anchors = [
      ...this.captionSelectors.slice(0, 4),
      ...this.createPostSelectors,
      ...textSelectors("Belum ada postingan"),
    ];
    const found = await this.waitForAny(anchors, timeout);
    let foreground = "?";
    try {
      foreground = await browser.getCurrentPackage();
    } catch {}
    assert.ok(
      found,
      `Halaman beranda/feed tidak muncul setelah login (app di layar: ${foreground}). ` +
        "Kemungkinan login gagal atau email belum diverifikasi. Lihat evidence/debug_*.xml",
    );
  }

  async findCaptionField() {
    let field = await this.waitForAny(this.captionSelectors, 8000);
    if (!field) {
      const open = await this.waitForAny(this.createPostSelectors, 5000);
      if (open) {
        await open.click();
        field = await this.waitForAny(this.captionSelectors, 10000);
      }
    }
    assert.ok(
      field,
      "Kolom caption tidak ditemukan. Lihat evidence/debug_*.xml untuk isi layar.",
    );
    return field;
  }

  async typeCaption(caption) {
    const field = await this.findCaptionField();
    await field.click();
    await field.setValue(caption);
  }

  async tapPost() {
    let button = await this.waitForAny(this.postButtonSelectors, 5000);
    if (!button) {
      await this.hideKeyboard();
      button = await this.waitForAny(this.postButtonSelectors, 10000);
    }
    assert.ok(
      button,
      "Tombol 'Posting' tidak ditemukan. Lihat evidence/debug_*.xml untuk isi layar.",
    );
    await button.click();
  }

  async isPostSuccessMessageDisplayed(timeout = 15000) {
    return (
      (await this.waitForAny(textSelectors(MSG_POST_SUCCESS), timeout)) !== null
    );
  }

  async isCaptionInFeed(caption, timeout = 20000) {
    const selector =
      `//*[(contains(@content-desc,"${caption}") or contains(@text,"${caption}")) ` +
      'and not(contains(@class,"EditText"))]';
    return (await this.waitForAny([selector], timeout)) !== null;
  }
}

export default new HomePage();
