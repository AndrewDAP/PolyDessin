export interface Command {
    do(): void | Promise<void>;
    // test
}

export class MockCommand implements Command {
    // tslint:disable-next-line: no-empty
    do(): void {}
}
