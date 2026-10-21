import fs from "node:fs";
import path from "node:path";
import { $$, browser } from "@wdio/globals";
import allureReporter from "@wdio/allure-reporter";
import { EVIDENCE_DIR } from "../../config.js";

export const textSelectors = (text) => [
  `android=new UiSelector().descriptionContains("${text}")`,
  `android=new UiSelector().textContains("${text}")`,
];

export default class BasePage {
  sessionUsed = false;
  async findFirst(selectors) {
    for (const selector of selectors) {
      const elements = await $$(selector);
      if (elements.length > 0) return elements[0];
    }
    return null;
  }

  async waitForAny(selectors, timeout = 15000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const element = await this.findFirst(selectors);
      if (element) return element;
      await browser.pause(250);
    }
    return null;
  }

  async hideKeyboard() {
    try {
      if (await browser.isKeyboardShown()) {
        await browser.hideKeyboard();
        await browser.pause(500);
      }
    } catch {
      // abaikan: keyboard sudah tertutup
    }
  }
  async resetApp() {
    if (this.sessionUsed) await browser.reloadSession();
    this.sessionUsed = true;
  }

  async screenshot(name) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    const file = path.join(EVIDENCE_DIR, `${name}.png`);
    await browser.saveScreenshot(file);
    allureReporter.addAttachment(name, fs.readFileSync(file), "image/png");
    return file;
  }
}
