import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const baseUrl = process.env.SELENIUM_BASE_URL ?? "https://mediahub.francescogioia.it";
const appBaseUrl = baseUrl.replace(/\/$/, "");
const loginUrl = `${appBaseUrl}/login`;
const watchlistUrl = `${appBaseUrl}/watchlist`;

const options = new chrome.Options();
options.addArguments("--headless=new", "--disable-gpu", "--window-size=1440,900");

const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .build();

try {
  // Ensure we start from an anonymous state.
  await driver.get(appBaseUrl);
  await driver.executeScript("window.localStorage.clear();");

  // Unauthenticated user should be redirected from protected route to login.
  await driver.get(watchlistUrl);
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes("/login");
  }, 10000);

  // Login page should load with expected form controls.
  await driver.get(loginUrl);
  await driver.wait(until.elementLocated(By.css('input[autocomplete="username"]')), 10000);
  await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);

  const passwordInput = await driver.findElement(By.css('input[autocomplete="current-password"]'));
  const initialType = await passwordInput.getAttribute("type");
  if (initialType !== "password") {
    throw new Error(`Expected password input type to be 'password', found '${initialType}'`);
  }

  const toggleButton = await driver.findElement(By.css('button.password-toggle'));
  await toggleButton.click();

  await driver.wait(async () => (await passwordInput.getAttribute("type")) === "text", 5000);

  await toggleButton.click();
  await driver.wait(async () => (await passwordInput.getAttribute("type")) === "password", 5000);

  // Attempt login with a random non-existing user and assert specific API error message.
  const identifierInput = await driver.findElement(By.css('input[autocomplete="username"]'));
  const randomId = `selenium_missing_${Date.now()}`;
  await identifierInput.clear();
  await identifierInput.sendKeys(randomId);

  await passwordInput.clear();
  await passwordInput.sendKeys("not-a-real-password");

  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await submitButton.click();

  const errorTextEl = await driver.wait(until.elementLocated(By.css(".status.error")), 10000);
  await driver.wait(until.elementTextContains(errorTextEl, "User does not exist."), 10000);

  console.log("Selenium E2E passed: protected-route redirect, password toggle, and missing-user login error are working.");
} finally {
  await driver.quit();
}
