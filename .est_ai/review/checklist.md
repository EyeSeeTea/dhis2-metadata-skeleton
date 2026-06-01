# Review checklist — dhis2-react

Verify before committing. Applies to any task that adds or modifies code in `domain/`, `data/` or `webapp/`.

---

## Architecture

- [ ] New code lives in the correct layer: entities, value objects and repository interfaces in `domain/`, implementations in `data/`, components in `webapp/`
- [ ] `domain/` does not import anything from `data/` or `webapp/`
- [ ] `domain/` does not import anything from web like File
- [ ] If a new repository is added, both the interface in `domain/repositories/` **and** the implementation in `data/repositories/` exist
- [ ] Repository interfaces express domain capabilities — method names reflect what the domain needs, not how the data is stored
- [ ] Repositories do not call other repositories — if multiple data sources are needed, the use case coordinates them
- [ ] Repositories treat data as a collection — no business logic, no calculated fields inside the repository
- [ ] Repositories return domain entities, not primitives
- [ ] Each repository defines only the methods its use cases need — no generic `Repository<T>` base interface
- [ ] Use cases expose only one public method: `execute()` — shared logic between use cases belongs in entity methods or helper functions, not in a second public method
- [ ] Read use cases return domain entities, not primitives (no `execute(): string` for a query)
- [ ] Independent domain entities relate by Id, not by object reference — if a use case needs data from a related entity, it fetches it separately through its own repository
- [ ] Not everything needs a use case or repository interface — infrastructure concerns (app config, file exports, external tool integrations) are resolved outside `domain/`
- [ ] Validation of external inputs (API responses, user input) happens in `data/` or `webapp/` — not inside domain entities
- [ ] Entities contain business logic methods — they are not plain data containers
- [ ] Use cases orchestrate flow — business rules that belong to an entity (e.g. `user.isAdmin()`, `campaign.isActive()`) live in the entity, not in the use case
- [ ] Use cases do not call other use cases — shared logic belongs in domain entities, value objects, or repositories
- [ ] Values with domain meaning or constraints are modeled as entities or value objects — not passed as raw primitives between layers
- [ ] Domain entities model application concepts, not DHIS2 structures — prefer `Country` over `OrgUnit`, `Indicator` over `DataElement`; the repository maps from DHIS2 to domain. `D2*` types must not appear in `domain/`. Exception: when the DHIS2 concept is genuinely the application's domain (e.g. a metadata management tool where `OrgUnit` is the core concept)

## CompositionRoot

- [ ] New dependencies are wired in `getCompositionRoot()`, not instantiated inside components or use cases
- [ ] CompositionRoot is only consumed from custom hooks or components
- [ ] Composition root only return use cases

## Async

- [ ] Repository methods return `FutureData<Error, T>` or `FutureData<T>`, not `Promise<T>`
- [ ] In React components, Futures are executed with `.run(onSuccess, onError)` inside `useEffect`
- [ ] `.toPromise()` only appears in tests

## D2Api

- [ ] No repository calls `fetch` or `axios` directly — only `d2-api` is used
- [ ] `D2Api` is only instantiated in `getWebappCompositionRoot()`
- [ ] `D2Api` is only used from repositories

## React

- [ ] Components access `compositionRoot` only through `useAppContext()`
- [ ] No business logic in components — it belongs in use cases or entities
- [ ] No presentation logic in componenets - it belongs in custom hooks
- [ ] Only render logic and event handlers in components
- [ ] Prefer styledComponents over MakeStyle

## Tests

- [ ] Use case tests use test doble of repository
- [ ] Domain and use case tests do not import from `data/` or any infrastructure module
- [ ] If the change affects observable behavior, a test covering that behavior is added or updated — not just existing tests re-run
- [ ] Business rules are tested at the domain layer, not only through integration or component tests
- [ ] Tests pass before closing the task

## Functional Programming

- [ ] No `for` / `forEach` loops with a mutable accumulator — use `map`, `flatMap`, `filter`, or `reduce` instead
- [ ] No `array.push()` or in-place mutation — return new arrays/objects instead
- [ ] Searching a collection uses `array.find()` or `array.filter()` — not a `for` loop with a `break`
- [ ] Function arguments are not mutated — transformations return new values
- [ ] Data structures that should not change after creation use `Readonly<T>` or `ReadonlyArray<T>`
- [ ] `const` is used by default — `let` only when reassignment is genuinely required

## TypeScript

- [ ] Union types that also need runtime values use `as const` arrays with derived types — never `as Type[]` casts
- [ ] API field selections use `MetadataPick` — no inline type duplication
- [ ] New type compositions follow existing patterns (`Pick`, `Omit`, `MetadataPick`) rather than redeclaring shapes inline

---