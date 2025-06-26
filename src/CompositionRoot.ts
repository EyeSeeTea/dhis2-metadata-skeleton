export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {};

function getCompositionRoot(_repositories: Repositories) {
    return {};
}

export function getWebappCompositionRoot() {
    const repositories: Repositories = {};

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {};

    return getCompositionRoot(repositories);
}
