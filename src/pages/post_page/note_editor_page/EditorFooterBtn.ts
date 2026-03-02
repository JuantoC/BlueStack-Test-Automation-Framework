import { Locator, By, WebDriver } from "selenium-webdriver";

export class NoteFooterBtn {
  private readonly addContentContainer: Locator = By.css("div[id='add-content-id']")
  private readonly addContentBtn: Locator = By.css('div[id="add-content-id"] div[data-testid="add-post-circle-container"]')
  private readonly addListicleItemBtn: Locator = By.css('button[data-testid="add-listicle-item"]');
  private driver: WebDriver

  constructor(driver: WebDriver){
    this.driver = driver
  }

  
}