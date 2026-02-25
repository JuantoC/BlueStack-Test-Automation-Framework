import { WebDriver } from "selenium-webdriver";
import { BaseListicleSection, LiveBlogData } from "./BaseListicleSection.js";
import { LiveBlogStrategy, StandardStrategy } from "./ListicleStrategy.js";
import { EditorLiveBlogEventSection } from "../EditorLiveBlogEventSection.js";
import { RetryOptions } from "../../../../core/config/default.js";
import logger from "../../../../core/utils/logger.js";

export class LiveBlogSection extends BaseListicleSection {
  private eventSection: EditorLiveBlogEventSection;

  constructor(driver: WebDriver) {
    super(driver, LiveBlogStrategy);
    this.eventSection = new EditorLiveBlogEventSection(driver);
  }

  /**
   * Implementamos el hook. 
   * DRY: No tocamos fillAll, la base sabe cuándo llamar a esto.
   */
  protected async fillEventSection(data: LiveBlogData, config: RetryOptions): Promise<void> {
    if (!data.eventLiveBlog?.eventTitle) {
      logger.debug(`No se proporcionó un título para el evento de LiveBlog. Omitiendo este paso.`, { label: config.label });
      return;
    }
    await this.eventSection.fillEventTitle(data, config);
  }
}

export class ListicleSection extends BaseListicleSection {
  constructor(driver: WebDriver) {
    super(driver, StandardStrategy);
  }
}