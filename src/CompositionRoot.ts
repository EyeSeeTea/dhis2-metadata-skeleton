import { UserRepository } from "$/domain/repositories/UserRepository";
import { D2Api } from "@eyeseetea/d2-api/2.36";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { UserD2Repository } from "$/data/repositories/UserD2Repository";
import { UserTestRepository } from "$/data/repositories/UserTestRepository";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    usersRepository: UserRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        users: {
            getCurrent: new GetCurrentUserUseCase(repositories.usersRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api) {
    const repositories: Repositories = {
        usersRepository: new UserD2Repository(api),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {
        usersRepository: new UserTestRepository(),
    };

    return getCompositionRoot(repositories);
}
