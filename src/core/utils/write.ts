import { WebElement } from "selenium-webdriver";

export async function writeToEditable(element: WebElement, text: string): Promise<void> {
  const driver = element.getDriver();

  await driver.executeScript("arguments[0].focus(); arguments[0].innerHTML = '';", element);
  await element.sendKeys(text);
}

export async function writeToStandard(element: WebElement, text: string): Promise<void> {
  await element.clear();
  await element.sendKeys(text);
}
