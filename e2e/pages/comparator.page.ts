import { type Page, type Locator } from "@playwright/test";
import path from "path";

export class ComparatorPage {
    readonly page: Page;

    readonly uploadFile1: Locator;
    readonly uploadFile2: Locator;
    readonly changeList: Locator;
    readonly progressText: Locator;
    readonly mergedEditor: Locator;

    constructor(page: Page) {
        this.page = page;
        this.uploadFile1 = page.locator("#upload-file-1");
        this.uploadFile2 = page.locator("#upload-file-2");
        this.changeList = page.locator("[data-testid='change-list']");
        this.progressText = page.locator("[data-testid='progress-text']");
        this.mergedEditor = page.locator("[data-testid='merged-editor']");
    }

    async goto() {
        await this.page.goto("/");
    }

    async uploadFiles() {
        const fixturesDir = path.resolve(__dirname, "../fixtures");
        await this.uploadFile1.setInputFiles(path.join(fixturesDir, "file-left.json"));
        await this.uploadFile2.setInputFiles(path.join(fixturesDir, "file-right.json"));
    }

    async waitForEditorReady() {
        await this.mergedEditor.locator(".view-lines").waitFor({ state: "visible", timeout: 15000 });
    }

    async waitForChangeItems() {
        await this.getChangeItems().first().waitFor({ state: "visible", timeout: 10000 });
    }

    getChangeItems(): Locator {
        return this.changeList.locator("[data-testid^='change-item-']");
    }

    getChangeItemByPath(diffPath: string): Locator {
        return this.page.locator(`[data-testid='change-item-${diffPath}']`);
    }

    getFilterButton(status: "all" | "unhandled" | "handled"): Locator {
        return this.page.locator(`[data-testid='filter-${status}']`);
    }

    getUseLeftButton(item: Locator): Locator {
        return item.locator("[data-testid='use-left']");
    }

    getUseRightButton(item: Locator): Locator {
        return item.locator("[data-testid='use-right']");
    }

    getDirectionIcon(item: Locator): Locator {
        return item.locator("[data-testid='direction-icon']");
    }

    getChangeType(item: Locator): Locator {
        return item.locator("[data-testid='change-type']");
    }

    getHighlightedLines(
        className: "highlight-added" | "highlight-removed" | "highlight-modified"
    ): Locator {
        return this.mergedEditor.locator(`.${className}`);
    }

    getGlyphElements(
        glyphClass: "glyph-arrow-left" | "glyph-arrow-right" | "glyph-warning"
    ): Locator {
        return this.mergedEditor.locator(`.${glyphClass}`);
    }
}
