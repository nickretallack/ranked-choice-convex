// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SingleArgument<F extends (arg: any) => any> = [
  Parameters<F>[0],
  ReturnType<F>,
];
