import assert from "node:assert/strict";
import allureReporter from "@wdio/allure-reporter";
import LoginPage from "../pageobjects/login.page.js";
import HomePage from "../pageobjects/home.page.js";
import { step } from "../helpers/step.js";
import { randomCaption } from "../helpers/random.js";
import { TEST_EMAIL, TEST_PASSWORD } from "../../config.js";

describe("Posting Feed", () => {
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

  it("TC-POST-001: Login lalu posting feed dengan caption acak, notifikasi 'Post berhasil' tampil", async () => {
    const caption = randomCaption();
    allureReporter.addEpic("BelajarBarengApps");
    allureReporter.addFeature("Feed");
    allureReporter.addStory("Posting feed");
    allureReporter.addSeverity("critical");
    allureReporter.addArgument("caption", caption);

    await step("Buka halaman Login", () => LoginPage.waitUntilLoaded());
    await step("Login dengan akun valid", () =>
      LoginPage.login(TEST_EMAIL, TEST_PASSWORD),
    );
    await step("Tunggu halaman beranda / feed", () =>
      HomePage.waitUntilLoaded(),
    );
    await step(`Isi caption acak: "${caption}"`, () =>
      HomePage.typeCaption(caption),
    );
    await step("Tekan tombol 'Posting'", () => HomePage.tapPost());
    await step("Verifikasi notifikasi 'Post berhasil' tampil", async () => {
      const shown = await HomePage.isPostSuccessMessageDisplayed();
      if (shown) await HomePage.screenshot("03_post_berhasil");
      assert.ok(
        shown,
        "Notifikasi 'Post berhasil' tidak tampil setelah menekan tombol Posting",
      );
    });
    await step("Verifikasi caption muncul di feed", async () => {
      const inFeed = await HomePage.isCaptionInFeed(caption);
      if (inFeed) await HomePage.screenshot("04_caption_di_feed");
      assert.ok(inFeed, `Caption "${caption}" tidak ditemukan di daftar feed`);
    });
  });
});
