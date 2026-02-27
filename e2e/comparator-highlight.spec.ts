import { test, expect } from "@playwright/test";
import { ComparatorPage } from "./pages/comparator.page";

test.describe("Comparator: Highlight-in-Merge-Panel", () => {
    let comparator: ComparatorPage;

    test.beforeEach(async ({ page }) => {
        comparator = new ComparatorPage(page);
        await comparator.goto();
        await comparator.uploadFiles();
        await comparator.waitForEditorReady();
        await comparator.waitForChangeItems();
    });

    test("should display change items after uploading two files", async () => {
        const count = await comparator.getChangeItems().count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test("should show highlight on hover and clear on mouse leave", async () => {
        // Use "version" — a "modified" diff that exists in the merged text.
        // "addedField" (first item alphabetically) has no lines in the merged
        // text because it comes from the right file only.
        const item = comparator.getChangeItemByPath("version");

        await item.hover();
        await comparator.page.waitForTimeout(500);

        const highlighted = comparator.getHighlightedLines("highlight-modified");
        await expect(highlighted.first()).toBeVisible({ timeout: 3000 });

        // Move mouse away to clear highlights
        await comparator.progressText.hover();
        await comparator.page.waitForTimeout(500);

        for (const cls of ["highlight-added", "highlight-removed", "highlight-modified"] as const) {
            await expect(comparator.getHighlightedLines(cls)).toHaveCount(0);
        }
    });

    test("should show direction chevron after clicking Use Left", async () => {
        const firstItem = comparator.getChangeItems().first();

        await expect(comparator.getDirectionIcon(firstItem)).toHaveCount(0);

        await comparator.getUseLeftButton(firstItem).click();

        await expect(comparator.getDirectionIcon(firstItem)).toBeVisible();
        await expect(comparator.getDirectionIcon(firstItem).locator("svg")).toBeVisible();
    });

    test("should show direction chevron after clicking Use Right", async () => {
        const firstItem = comparator.getChangeItems().first();

        await comparator.getUseRightButton(firstItem).click();

        await expect(comparator.getDirectionIcon(firstItem)).toBeVisible();
    });

    test("should show glyph-warning for unhandled and arrow for handled on hover", async () => {
        // Use "version" — exists in merged text, so decorations will appear
        const item = comparator.getChangeItemByPath("version");

        // Hover unhandled item
        await item.hover();
        await comparator.page.waitForTimeout(500);

        const warningGlyphs = comparator.getGlyphElements("glyph-warning");
        await expect(warningGlyphs.first()).toBeVisible({ timeout: 3000 });

        // Handle the item
        await comparator.getUseLeftButton(item).click();

        // Hover again
        await item.hover();
        await comparator.page.waitForTimeout(500);

        const arrowGlyphs = comparator.getGlyphElements("glyph-arrow-left");
        await expect(arrowGlyphs.first()).toBeVisible({ timeout: 3000 });
    });

    test("should scroll editor to block when clicking a change item", async () => {
        // Use "removedField" — a removed diff near the end of the JSON, ensuring
        // the editor must scroll. It exists in the merged text (from left file).
        const item = comparator.getChangeItemByPath("removedField");

        await item.click();
        await comparator.page.waitForTimeout(500);

        // Hover to trigger highlight
        await item.hover();
        await comparator.page.waitForTimeout(500);

        const highlighted = comparator.getHighlightedLines("highlight-removed");
        await expect(highlighted.first()).toBeInViewport();
    });

    test("should filter change items with filter buttons", async () => {
        const totalCount = await comparator.getChangeItems().count();

        // Handle the first item
        const firstItem = comparator.getChangeItems().first();
        await comparator.getUseLeftButton(firstItem).click();

        // Filter: Handled
        await comparator.getFilterButton("handled").click();
        expect(await comparator.getChangeItems().count()).toBe(1);

        // Filter: Unhandled
        await comparator.getFilterButton("unhandled").click();
        expect(await comparator.getChangeItems().count()).toBe(totalCount - 1);

        // Filter: All
        await comparator.getFilterButton("all").click();
        expect(await comparator.getChangeItems().count()).toBe(totalCount);
    });

    test("should update progress text when handling changes", async () => {
        const totalText = await comparator.progressText.textContent();
        expect(totalText).toMatch(/0\s*\/\s*\d+\s*handled/);

        const firstItem = comparator.getChangeItems().first();
        await comparator.getUseLeftButton(firstItem).click();

        const updatedText = await comparator.progressText.textContent();
        expect(updatedText).toMatch(/1\s*\/\s*\d+\s*handled/);
    });
});
