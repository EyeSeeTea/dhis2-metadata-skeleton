import { GenerateJSONDifferenceUseCase } from "$/domain/usecases/GenerateJSONDifferenceUseCase";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {};

function getCompositionRoot(_repositories: Repositories) {
    return {
        generateJSONDifference: new GenerateJSONDifferenceUseCase(),
    };
}

export function getWebappCompositionRoot() {
    const repositories: Repositories = {};

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {};

    return getCompositionRoot(repositories);
}
