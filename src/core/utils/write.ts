import { WebElement } from "selenium-webdriver";

export async function writeToEditable(element: WebElement, text: string): Promise<void> {
  const driver = element.getDriver();
  console.log(`writeSafe: es un elemento editable!`)

  await driver.executeScript("arguments[0].focus(); arguments[0].innerHTML = '';", element);
  await element.sendKeys(text);
}

export async function writeToStandard(element: WebElement, text: string): Promise<void> {
    console.log(`writeSafe: NO es un elemento editable!`)
  await element.clear();
  await element.sendKeys(text);
}
