import Title from "$/webapp/components/Title";
import { Logo } from "$/webapp/components/Logo";
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
