import { browser } from "@wdio/globals";
import allureReporter from "@wdio/allure-reporter";

async function foreground() {
  try {
    return await browser.getCurrentPackage();
  } catch {
    return "?";
  }
}

export async function step(name, fn) {
  allureReporter.startStep(name);
  try {
    const result = await fn();
    allureReporter.endStep("passed");
    console.log(`[step OK]   ${name}  | app di layar: ${await foreground()}`);
    return result;
  } catch (error) {
    allureReporter.endStep("failed");
    console.log(`[step GAGAL] ${name}  | app di layar: ${await foreground()}`);
    throw error;
  }
}
