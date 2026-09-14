import test from "node:test";
import assert from "node:assert/strict";
import {
  isSyntheticPhoneEmail,
  extractPhoneFromSyntheticEmail,
  displayEmailOrPhone,
  displayUserName,
  cleanDisplayValue,
} from "../../src/lib/phone.ts";

test("isSyntheticPhoneEmail identifies synthetic emails", () => {
  assert.equal(isSyntheticPhoneEmail("233552231466@phone.PREDICTA.live"), true);
  assert.equal(isSyntheticPhoneEmail("0552231466@phone.PREDICTA.live"), true);
  assert.equal(isSyntheticPhoneEmail("0241234567@PREDICTA.live"), true);
  assert.equal(isSyntheticPhoneEmail("2348031234567@phone.PREDICTA.live"), true);
  assert.equal(isSyntheticPhoneEmail("0552231466@PREDICTA.live"), true);
  assert.equal(isSyntheticPhoneEmail("owusujunior2004@gmail.com"), false);
  assert.equal(isSyntheticPhoneEmail("aaronyeboah545@gmail.com"), false);
  assert.equal(isSyntheticPhoneEmail(""), false);
  assert.equal(isSyntheticPhoneEmail(null), false);
});

test("extractPhoneFromSyntheticEmail formats correctly", () => {
  assert.equal(extractPhoneFromSyntheticEmail("233552231466@phone.PREDICTA.live"), "055 223 1466");
  assert.equal(extractPhoneFromSyntheticEmail("0552231466@phone.PREDICTA.live"), "055 223 1466");
  assert.equal(extractPhoneFromSyntheticEmail("552231466@phone.PREDICTA.live"), "055 223 1466");
  assert.equal(extractPhoneFromSyntheticEmail("2348031234567@phone.PREDICTA.live"), "0803 123 4567");
  assert.equal(extractPhoneFromSyntheticEmail("08031234567@PREDICTA.live"), "0803 123 4567");
  assert.equal(extractPhoneFromSyntheticEmail("aaronyeboah545@gmail.com"), null);
});

test("displayEmailOrPhone returns clean display", () => {
  assert.equal(displayEmailOrPhone("233552231466@phone.PREDICTA.live", "055 223 1466"), "055 223 1466");
  assert.equal(displayEmailOrPhone("233552231466@phone.PREDICTA.live", null), "055 223 1466");
  assert.equal(displayEmailOrPhone("0241234567@PREDICTA.live", null), "024 123 4567");
  assert.equal(displayEmailOrPhone("aaronyeboah545@gmail.com", null), "aaronyeboah545@gmail.com");
  assert.equal(displayEmailOrPhone(null, null), "—");
});

test("displayUserName uses name, phone, or clean number", () => {
  assert.equal(displayUserName("Kwame Mensah", "233552231466@phone.PREDICTA.live"), "Kwame Mensah");
  assert.equal(displayUserName(null, "233552231466@phone.PREDICTA.live"), "055 223 1466");
  assert.equal(displayUserName(null, "0241234567@PREDICTA.live"), "024 123 4567");
  assert.equal(displayUserName(null, "aaronyeboah545@gmail.com"), "aaronyeboah545@gmail.com");
  assert.equal(displayUserName("", "", ""), "Member");
});

test("cleanDisplayValue strips synthetic domain from objects/strings", () => {
  assert.equal(cleanDisplayValue("233552231466@phone.PREDICTA.live"), "055 223 1466");
  assert.equal(cleanDisplayValue("aaronyeboah545@gmail.com"), "aaronyeboah545@gmail.com");
  assert.equal(cleanDisplayValue(123), 123);
});
