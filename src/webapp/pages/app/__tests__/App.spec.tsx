import { render } from "@testing-library/react";
import App from "$/webapp/pages/app/App";
import { getTestContext } from "$/utils/tests";

describe("App", () => {
    it("renders the feedback component", async () => {
        const view = getView();

        expect(await view.findByText("Send feedback")).toBeInTheDocument();
    });
});

function getView() {
    const { compositionRoot } = getTestContext();
    return render(<App compositionRoot={compositionRoot} />);
}
