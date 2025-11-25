import { Locator } from "selenium-webdriver";

export class NoteHeaderActions {
    public saveBtn: Locator = By.css('button[data-testid="dropdown-actions"]')
    public dropdownSave: Locator = By.id('dropdown-save');
    public saveAndExitBtn: Locator = By.id("option-dropdown-0")
    public ExitBtn: Locator = By.id("option-dropdown-1")
    public dropdownPublish: Locator = By.id('dropdown-publish');
    public publishBtn: Locator = By.css('button[data-testid="dropdown-action"]')
    public publishAndExitBtn: Locator = By.id("option-dropdown-0")
    public scheduleBtn: Locator = By.id("option-dropdown-1")
    public backBtn: Locator = By.css('a[data-testid="btn-exit-note"]')

    //  Modales
    public exitAnywayBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="btn-cancel"]')
    public saveAndExitBtnModal: Locator = By.css('button[data-testid="btn-calendar-confirm"]')
    public cancelBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]')
    public publishBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]')

}