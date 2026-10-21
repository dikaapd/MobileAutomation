import { randomBytes } from "node:crypto";

export function randomCaption() {
  return `Test posting otomatis ${randomBytes(4).toString("hex")}`;
}
