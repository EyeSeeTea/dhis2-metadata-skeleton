import Title from "$/webapp/components/app-title/Title";
import { Logo } from "$/webapp/components/logo/Logo";
import Comparator from "$/webapp/components/comparator/Comparator";

export const LandingPage = () => {
    return (
        <div>
            <Logo />
            <Title>JSON Comparator</Title>

            <Comparator />
        </div>
    );
};
