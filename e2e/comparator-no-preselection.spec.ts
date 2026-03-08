import { test, expect } from "@playwright/test";
import { ComparatorPage } from "./pages/comparator.page";

test.describe("Comparator: No Default Pre-Selection", () => {
    let comparator: ComparatorPage;

    test.beforeEach(async ({ page }) => {
        comparator = new ComparatorPage(page);
        await comparator.goto();
        await comparator.uploadFiles();
        await comparator.waitForEditorReady();
        await comparator.waitForChangeItems();
    });

    test("should show all buttons inactive on initial load", async () => {
        const items = comparator.getChangeItems();
        const count = await items.count();

        for (let i = 0; i < count; i++) {
            const item = items.nth(i);
            const useLeft = comparator.getUseLeftButton(item);
            const useRight = comparator.getUseRightButton(item);

            // Both buttons should have the same background color (both inactive)
            const leftBg = await useLeft.evaluate(el => getComputedStyle(el).backgroundColor);
            const rightBg = await useRight.evaluate(el => getComputedStyle(el).backgroundColor);
            expect(leftBg).toBe(rightBg);
        }
    });

    test("should show no direction icons on initial load", async () => {
        const allDirectionIcons = comparator.changeList.getByLabel("Direction");
        await expect(allDirectionIcons).toHaveCount(0);
    });

    test("should show 0 handled on initial load", async () => {
        await expect(comparator.getProgressText()).toHaveText(/0\s*\/\s*\d+\s*handled/);
    });

    test("should show no items under Handled filter on initial load", async () => {
        await comparator.getFilterButton("handled").click();
        await expect(comparator.getChangeItems()).toHaveCount(0);
    });

    test("should default merged output to left-side values", async () => {
        const mergedText = await comparator.getMergedEditorText();

        // Left-side values should be present in the merged output
        expect(mergedText).toContain("1.0");
        expect(mergedText).toContain("Original description");
        expect(mergedText).toContain("First Item");
        expect(mergedText).toContain("Third Item");
        expect(mergedText).toContain("this will be removed");

        // Right-only values should NOT be present
        expect(mergedText).not.toContain("2.0");
        expect(mergedText).not.toContain("Modified description");
        expect(mergedText).not.toContain("this is new");
    });

    test("should activate button and update progress after explicit selection", async () => {
        const item = comparator.getChangeItemByPath("version");

        // Before: no direction icon, 0 handled
        await expect(comparator.getDirectionIcon(item)).toHaveCount(0);
        await expect(comparator.getProgressText()).toHaveText(/0\s*\/\s*\d+\s*handled/);

        // Click Use Right
        await comparator.getUseRightButton(item).click();

        // After: direction icon appears, progress increments
        await expect(comparator.getDirectionIcon(item)).toBeVisible();
        await expect(comparator.getProgressText()).toHaveText(/1\s*\/\s*\d+\s*handled/);
    });

    test("should keep item handled when changing selection", async () => {
        const item = comparator.getChangeItemByPath("description");

        // Select Use Left
        await comparator.getUseLeftButton(item).click();
        await expect(comparator.getProgressText()).toHaveText(/1\s*\/\s*\d+\s*handled/);

        // Switch to Use Right — should still be 1 handled, not 2
        await comparator.getUseRightButton(item).click();
        await expect(comparator.getProgressText()).toHaveText(/1\s*\/\s*\d+\s*handled/);
    });
});
