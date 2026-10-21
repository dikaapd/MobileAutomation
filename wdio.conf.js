import fs from "node:fs";
import { browser } from "@wdio/globals";
import allureReporter from "@wdio/allure-reporter";
import { APP_PATH, BASE_DIR, DEVICE_NAME, EVIDENCE_DIR } from "./config.js";

export const config = {
  runner: "local",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",

  specs: ["./test/specs/**/*.js"],
  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": DEVICE_NAME,
      "appium:app": APP_PATH,
      "appium:noReset": false,
      "appium:autoGrantPermissions": true,
      "appium:newCommandTimeout": 300,
    },
  ],

  logLevel: "warn",
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,

  // Appium dijalankan otomatis oleh WebdriverIO (tidak perlu terminal terpisah)
  services: ["appium"],

  framework: "mocha",
  mochaOpts: { ui: "bdd", timeout: 180000 },

  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "allure-results",
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true, // screenshot dilampirkan manual
      },
    ],
  ],

  onPrepare() {
    if (!fs.existsSync(APP_PATH)) {
      throw new Error(
        `APK tidak ditemukan di ${APP_PATH}. Letakkan app-release.apk di folder app/.`,
      );
    }
    fs.rmSync(`${BASE_DIR}/allure-results`, { recursive: true, force: true });
  },

  async afterTest(test, context, { passed }) {
    if (passed) return;
    const safe = test.title.replace(/[^a-z0-9]+/gi, "_").slice(0, 40);
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    try {
      const png = await browser.takeScreenshot();
      allureReporter.addAttachment(
        "screenshot_saat_gagal",
        Buffer.from(png, "base64"),
        "image/png",
      );
      fs.writeFileSync(
        `${EVIDENCE_DIR}/debug_${safe}.png`,
        Buffer.from(png, "base64"),
      );
    } catch {
      // abaikan
    }
    try {
      // Isi layar saat gagal (dipakai untuk memperbaiki selector)
      const pkg = await browser.getCurrentPackage();
      const activity = await browser.getCurrentActivity();
      const source = await browser.getPageSource();
      fs.writeFileSync(
        `${EVIDENCE_DIR}/debug_${safe}.xml`,
        `<!-- package: ${pkg} | activity: ${activity} -->\n${source}`,
      );
      allureReporter.addAttachment("page_source", source, "text/xml");
    } catch {
      // abaikan
    }
  },
};
