import { BaseListicleSection } from "./BaseListicleSection.js";
import { LiveBlogStrategy, StandardStrategy } from "./ListicleStrategy.js";
export class LiveBlogSection extends BaseListicleSection {
    constructor(driver) {
        super(driver, LiveBlogStrategy);
    }
}
export class ListicleSection extends BaseListicleSection {
    constructor(driver) {
        super(driver, StandardStrategy);
    }
}
//# sourceMappingURL=NoteListicleItemSection.js.map