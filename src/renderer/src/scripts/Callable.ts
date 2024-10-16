export interface Callable<P, R> {
    call(param: P): R;
}
