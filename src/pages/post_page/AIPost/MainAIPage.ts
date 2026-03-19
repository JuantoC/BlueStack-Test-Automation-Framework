import { WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../../core/config/defaultConfig.js";
import { step } from "allure-js-commons";
import logger from "../../../core/utils/logger.js";
import { AINoteData } from "../../../interfaces/data.js";
import { AIPostModal } from "./AIPostModal.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";

export class MainAIPage {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private readonly ai_post: AIPostModal;

  constructor(driver: WebDriver, config: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...config, label: stackLabel(config.label, 'MainAIPage') };
    this.ai_post = new AIPostModal(this.driver, this.config);
  }

  async generateNewAINote(data: Partial<AINoteData>): Promise<any> {
    await step("Generar nueva nota IA", async () => {
      try {
        await this.ai_post.fillAll(data);
        await this.ai_post.clickOnGenerateBtn();
        await this.ai_post.clickOnDoneBtn();
      } catch (error: any) {
        logger.error(`Error al generar nueva nota IA`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }
}