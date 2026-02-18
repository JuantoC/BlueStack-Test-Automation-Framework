import { WebDriver } from "selenium-webdriver";
import { BaseListicleSection } from "./BaseListicleSection.js";
import { LiveBlogStrategy, StandardStrategy } from "./ListicleStrategy.js";

export class LiveBlogSection extends BaseListicleSection {
  constructor(driver: WebDriver) {
    super(driver, LiveBlogStrategy);
  }
  // Aquí solo pones lo que es ÚNICO de LiveBlog (ej. el timestamp)
}

export class ListicleSection extends BaseListicleSection {
  constructor(driver: WebDriver) {
    super(driver, StandardStrategy);
  }
}