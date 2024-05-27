export interface ExceptionCatcher {
  catchException({
    exception,
    tags
  }: ExceptionCatcher.params): ExceptionCatcher.result
}

export namespace ExceptionCatcher {
  export type params = { exception: Error; tags?: { [key: string]: string } }
  export type result = void
}
