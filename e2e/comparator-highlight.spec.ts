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

        const highlighted = comparator.getHighlightedLines("highlight-modified");
        await expect(highlighted).toHaveCount(1, { timeout: 3000 });

        // Move mouse away to clear highlights
        await comparator.getProgressText().hover();

        for (const cls of ["highlight-added", "highlight-removed", "highlight-modified"] as const) {
            await expect(comparator.getHighlightedLines(cls)).toHaveCount(0);
        }
    });

    test("should show direction chevron after clicking Use Left", async () => {
        const firstItem = comparator.getChangeItems().first();

        await expect(comparator.getDirectionIcon(firstItem)).toHaveCount(0);

        await comparator.getUseLeftButton(firstItem).click();

        await expect(comparator.getDirectionIcon(firstItem)).toBeVisible();
    });

    test("should show direction chevron after clicking Use Right", async () => {
        const firstItem = comparator.getChangeItems().first();

        await comparator.getUseRightButton(firstItem).click();

        await expect(comparator.getDirectionIcon(firstItem)).toBeVisible();
    });

    test("should show persistent glyph-warning for unhandled and arrow for handled", async () => {
        // Glyphs are persistent — visible without hovering
        const warningGlyphs = comparator.getGlyphElements("glyph-warning");
        const initialCount = await warningGlyphs.count();
        expect(initialCount).toBeGreaterThan(0);

        // Handle a change item
        const item = comparator.getChangeItemByPath("version");
        await comparator.getUseLeftButton(item).click();

        // Arrow glyph should be visible without hovering
        const arrowGlyphs = comparator.getGlyphElements("glyph-arrow-left");
        await expect(arrowGlyphs).toHaveCount(1, { timeout: 3000 });
    });

    test("should scroll editor to block when clicking a change item", async () => {
        // Use "removedField" — a removed diff near the end of the JSON, ensuring
        // the editor must scroll. It exists in the merged text (from left file).
        const item = comparator.getChangeItemByPath("removedField");

        await item.click();
        await item.hover();

        const highlighted = comparator.getHighlightedLines("highlight-removed");
        await expect(highlighted).toHaveCount(1, { timeout: 3000 });
        await expect(highlighted.first()).toBeInViewport();
    });

    test("should filter change items with filter buttons", async () => {
        const totalCount = await comparator.getChangeItems().count();

        // Handle the first item
        const firstItem = comparator.getChangeItems().first();
        await comparator.getUseLeftButton(firstItem).click();

        // Filter: Handled
        await comparator.getFilterButton("handled").click();
        await expect(comparator.getChangeItems()).toHaveCount(1);

        // Filter: Unhandled
        await comparator.getFilterButton("unhandled").click();
        await expect(comparator.getChangeItems()).toHaveCount(totalCount - 1);

        // Filter: All
        await comparator.getFilterButton("all").click();
        await expect(comparator.getChangeItems()).toHaveCount(totalCount);
    });

    test("should update progress text when handling changes", async () => {
        await expect(comparator.getProgressText()).toHaveText(/0\s*\/\s*\d+\s*handled/);

        const firstItem = comparator.getChangeItems().first();
        await comparator.getUseLeftButton(firstItem).click();

        await expect(comparator.getProgressText()).toHaveText(/1\s*\/\s*\d+\s*handled/);
    });
});
