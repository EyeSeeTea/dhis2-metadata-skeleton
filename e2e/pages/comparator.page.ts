import { type Page, type Locator } from "@playwright/test";
import path from "path";

export class ComparatorPage {
    readonly page: Page;

    readonly uploadFile1: Locator;
    readonly uploadFile2: Locator;
    readonly changeList: Locator;
    readonly mergedEditor: Locator;

    constructor(page: Page) {
        this.page = page;
        this.uploadFile1 = page.locator("#upload-file-1");
        this.uploadFile2 = page.locator("#upload-file-2");
        this.changeList = page.getByRole("list", { name: "Select Changes" });
        this.mergedEditor = page.getByLabel("Merged Result");
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
        // Monaco editor uses .view-lines internally — no accessible alternative
        await this.mergedEditor
            .locator(".view-lines")
            .waitFor({ state: "visible", timeout: 15000 });
    }

    async waitForChangeItems() {
        await this.getChangeItems().first().waitFor({ state: "visible", timeout: 10000 });
    }

    getChangeItems(): Locator {
        return this.changeList.getByRole("listitem");
    }

    getChangeItemByPath(diffPath: string): Locator {
        return this.changeList.getByRole("listitem").filter({ hasText: diffPath });
    }

    getFilterButton(status: "all" | "unhandled" | "handled"): Locator {
        const labels: Record<string, string> = {
            all: "All",
            unhandled: "Unhandled",
            handled: "Handled",
        };
        return this.page.getByRole("button", { name: labels[status], exact: true });
    }

    getUseLeftButton(item: Locator): Locator {
        return item.getByRole("button", { name: /Use Left/ });
    }

    getUseRightButton(item: Locator): Locator {
        return item.getByRole("button", { name: /Use Right/ });
    }

    getDirectionIcon(item: Locator): Locator {
        return item.getByLabel("Direction");
    }

    getProgressText(): Locator {
        return this.page.getByText(/\d+\s*\/\s*\d+\s*handled/);
    }

    // Monaco decoration classes — CSS selectors required (no accessible alternative)
    getHighlightedLines(
        className: "highlight-added" | "highlight-removed" | "highlight-modified"
    ): Locator {
        return this.mergedEditor.locator(`.${className}`);
    }

    // Monaco glyph classes — CSS selectors required (no accessible alternative)
    getGlyphElements(
        glyphClass: "glyph-arrow-left" | "glyph-arrow-right" | "glyph-warning"
    ): Locator {
        return this.mergedEditor.locator(`.${glyphClass}`);
    }

    async getMergedEditorText(): Promise<string> {
        const text = await this.mergedEditor.locator(".view-lines").innerText();
        // Monaco may use non-breaking spaces (U+00A0) in rendered text; normalize to ASCII space
        return text.replace(/\u00a0/g, " ");
    }
}
