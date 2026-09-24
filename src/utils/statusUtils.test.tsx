import { describe, expect, it } from "vitest";

import {
  canCancelTransaction,
  formatStatusText,
  getAdjustmentTypeColor,
  getStatusColor,
  getPaymentStatusColor,
  getStatusLabel,
  getStatusVariant,
  isTransactionCancelled,
  isTransactionPosted,
} from "./statusUtils";

describe("status contracts", () => {
  it.each([
    ["posted", "success"],
    ["unposted", "warning"],
    ["cancelled", "danger"],
    // An archived record is still posted, so it shares Posted's colour.
    ["archived", "success"],
    ["unknown", "primary"],
  ] as const)("maps %s to %s", (status, color) => {
    expect(getStatusColor(status)).toBe(color);
  });

  it.each([
    ["cleared", "success"],
    ["pending", "warning"],
    ["reversed", "danger"],
    ["cancelled", "danger"],
    ["unknown", "primary"],
  ] as const)("maps payment status %s to %s", (paymentStatus, color) => {
    expect(getPaymentStatusColor(paymentStatus)).toBe(color);
  });

  it("labels archived records as still posted", () => {
    expect(getStatusLabel("archived")).toBe("Posted (Hidden)");
    expect(getStatusLabel("ARCHIVED")).toBe("Posted (Hidden)");
    expect(formatStatusText("archived")).toBe("POSTED (HIDDEN)");
    // Other statuses are passed through untouched.
    expect(getStatusLabel("posted")).toBe("posted");
    expect(getStatusLabel("unposted")).toBe("unposted");
  });

  it("preserves current transaction action rules", () => {
    expect(isTransactionPosted("POSTED")).toBe(true);
    expect(isTransactionCancelled("cancelled")).toBe(true);
    expect(canCancelTransaction("posted")).toBe(true);
    expect(canCancelTransaction("unposted")).toBe(false);
    expect(getStatusVariant("cancelled")).toBe("outlined");
    expect(formatStatusText("posted")).toBe("POSTED");
  });

  it("maps stock adjustment direction", () => {
    expect(getAdjustmentTypeColor("surplus")).toBe("success");
    expect(getAdjustmentTypeColor("deficit")).toBe("danger");
  });
});
