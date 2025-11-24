import { By } from 'selenium-webdriver';
// ===========================================
//      LOCALIZADORES Y DATA DE DEV-SAAS
// ===========================================
/**
 * Mapa de índices para los tipos de nota en el modal de creación.
 * La clave es el nombre legible del tipo de nota y el valor es el índice usado en el Locator.
 */
const NoteTypeIndexMap = {
    'New Post': '0',
    'New Listicle': '1',
    'New LiveBlog': '2',
};
/**
 * Módulo de localizadores específicos y datos no sensibles para el ambiente DEV-SAAS.
 */
export const DevSaasLocators = {
    Constants: {
        BASE_URL: 'testing.d39hyz3zgpw7gd.amplifyapp.com/admin/post/16',
        TIMEOUTS: {
            SHORT: 3000, // Interacciones rápidas (escritura, clicks en elementos visibles)
            MEDIUM: 60000, // Transiciones de UI (descarte de modal)
            LONG: 10000, // Redirecciones lentas (post-login, post-submit)
        },
    },
    // 2. CREDENCIALES DE AUTENTICACIÓN HTTP (BASIC AUTH)
    AuthData: {
        // ATENCIÓN: EN PRODUCCIÓN, ESTO DEBE SER CARGADO DESDE VARIABLES DE ENTORNO !!
        username: 'redaccion',
        password: '9.R3daxc10!n',
    },
    // 3. CREDENCIALES DE LOGIN DE LA APLICACIÓN
    LoginCredentials: {
        // ATENCIÓN: EN PRODUCCIÓN, ESTO DEBE SER CARGADO DESDE VARIABLES DE ENTORNO !!
        username: 'jtcaldera',
        password: 'uw%4sm1UIzIxT0',
    },
    // 4. LOCALIZADORES
    Locators: {
        // 2FA Modal
        twoFAModalDismissButton: By.css('[data-testid="btn-next"]'),
        //  de Creación de Nota (Elemento visible post-login)
        createNoteModalButton: By.css("button.btn-create-note"),
        // Localizadores de la página de Login
        usernameField: By.id('username-field-log'),
        passwordField: By.id('password-field-log'),
        loginButton: By.css('.security-card-submit-button'),
        // Localizadores de campos de la nota
        mainTitleField: By.css('textarea.content__input-title.main__title-height'),
        // secondaryTitleField: By.xpath('//div[@data-testid="titulo-content"]//label[contains(normalize-space(.),"2")]/following::textarea[1]'),
        subTitleField: By.css('ckeditor[data-testid="copete-content"] .ck-editor__editable'),
        halfTitleField: By.css('div[data-testid="volanta-content"] input[type="text"]'),
        bodyField: By.css('ckeditor[data-testid="ckCuerpoNota"] .ck-editor__editable'),
        tagsField: By.id('mat-mdc-chip-list-input-0'),
        hiddentagsField: By.id('mat-mdc-chip-list-input-1'),
        summaryField: By.id('resumen-content'),
        //Author Section
        authorInternalUserBtn: By.css('mat-icon="check_circle_outline"'),
        authorAnonymuosUserBtn: By.css('mat-icon="person_outline"'),
        authorManualUserBtn: By.css('mat-icon="draw"'),
        authorDescriptionField: By.css('.author-description__height'),
        authorNameField: By.css('input[data-testid="type_autocomplete"]'),
        //Side dropdown
        sideDropdownButton: By.css('mat-select[data-testid="select-lateral"]'),
        comboSectionOptions: By.css('mat-select[data-testid="section-options"]'),
        firstSectionOption: By.id('mat-option-74'),
        saveBtn: By.id('dropdown-save'),
        publishBtn: By.id('dropdown-publish'),
        /**
        * Función de Locator para los tipos de nota en el modal de creación.
        * Usa un mapa para encontrar el índice del botón por su nombre de negocio.
        * @param noteName El nombre legible de la nota (e.g., 'New Post', 'New Listicle').
        * @returns Un Locator (By.css) que apunta al botón correcto.
        */
        noteTypeBase: (noteName) => {
            const index = NoteTypeIndexMap[noteName];
            if (index === undefined) {
                throw new Error(`Error de Locator: El tipo de nota "${noteName}" no está definido en NoteTypeIndexMap.`);
            }
            return By.css(`#option-dropdown-${index} label`);
        }
    }
};
/**
 * Función que construye la URL de autenticación HTTP (Basic Auth).
 * Esto debe llamarse antes de driver.get().
 * @returns La URL completa con las credenciales inyectadas.
 */
export function getAuthUrl() {
    const { username, password } = DevSaasLocators.AuthData;
    const baseURL = DevSaasLocators.Constants.BASE_URL;
    return `https://${username}:${encodeURIComponent(password)}@${baseURL}`;
}
//# sourceMappingURL=Locators.js.map