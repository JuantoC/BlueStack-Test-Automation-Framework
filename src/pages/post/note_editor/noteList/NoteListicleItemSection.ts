import { WebDriver } from "selenium-webdriver";
import { BaseListicleSection, LiveBlogData } from "./BaseListicleSection.js";
import { LiveBlogStrategy, StandardStrategy } from "./ListicleStrategy.js";
import { NoteLiveBlogEventSection } from "../NoteLiveBlogEventSection.js";
import { RetryOptions } from "../../../../core/config/default.js";

export class LiveBlogSection extends BaseListicleSection {
  private eventSection: NoteLiveBlogEventSection;

  constructor(driver: WebDriver) {
    super(driver, LiveBlogStrategy);
    this.eventSection = new NoteLiveBlogEventSection(driver);
  }

  /**
   * Implementamos el hook. 
   * DRY: No tocamos fillAll, la base sabe cuándo llamar a esto.
   */
  protected async fillSpecificHeader(data: LiveBlogData, config: RetryOptions): Promise<void> {
    if (data.eventLiveBlog) {
      await this.eventSection.fillEventTitle(data.eventLiveBlog.eventTitle, config);
    }
  }
}

export class ListicleSection extends BaseListicleSection {
  constructor(driver: WebDriver) {
    super(driver, StandardStrategy);
  }
}