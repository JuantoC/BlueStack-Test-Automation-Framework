import { BaseListicleSection } from "./NoteBaseListicleSection.js";
import { NotaListaStrategy } from "./strategies/NotaListaStrategy.js";
export class NotaListaSection extends BaseListicleSection {
    constructor(driver) {
        super(driver, new NotaListaStrategy());
    }
}
//# sourceMappingURL=NoteListicle.js.map