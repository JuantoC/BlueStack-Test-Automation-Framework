import { BaseListicleSection } from "./NoteBaseListicleSection.js";
import { LiveBlogStrategy } from "./strategies/LiveBlogStrategy.js";
export class LiveBlogSection extends BaseListicleSection {
    constructor(driver) {
        super(driver, new LiveBlogStrategy());
    }
}
//# sourceMappingURL=NoteLiveBlogSection.js.map