import { WebDriver } from "selenium-webdriver";
import { BaseListicleSection, LiveBlogData } from "./BaseListicleSection.js";
import { LiveBlogStrategy, StandardStrategy } from "./ListicleStrategy.js";
import { LiveBlogEventSection } from "./LiveBlogEventSection.js";
import logger from "../../../../core/utils/logger.js";
import { RetryOptions } from "../../../../core/config/defaultConfig.js";

export class LiveBlogSection extends BaseListicleSection {
  private eventSection: LiveBlogEventSection;

  constructor(driver: WebDriver, opts: RetryOptions) {
    super(driver, LiveBlogStrategy, opts);
    this.eventSection = new LiveBlogEventSection(driver, this.config);
  }

  /**
   * Implementamos el hook. 
   * DRY: No tocamos fillAll, la base sabe cuándo llamar a esto.
   */
  protected async fillEventSection(data: LiveBlogData): Promise<void> {
    if (!data.eventLiveBlog?.eventTitle) {
      logger.debug(`No se proporcionó un título para el evento de LiveBlog. Omitiendo este paso.`, { label: this.config.label });
      return;
    }
    await this.eventSection.fillEventTitle(data);
  }
}

export class ListicleSection extends BaseListicleSection {
  constructor(driver: WebDriver, opts: RetryOptions) {
    super(driver, StandardStrategy, opts);
  }
}