import { DownloadFileUseCase } from "$/domain/usecases/DownloadFileUseCase";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {};

function getCompositionRoot(_repositories: Repositories) {
    return {
        downloadFile: new DownloadFileUseCase(),
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
