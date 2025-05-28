import Title from "$/webapp/components/app-title/Title";
import { Logo } from "$/webapp/components/logo/Logo";
import Comparator from "$/webapp/components/comparator/Comparator";

export const LandingPage = () => {
    return (
        <div>
            <Logo />
            <Title>Json Comparator</Title>

            <Comparator/>
        </div>
    );
};
