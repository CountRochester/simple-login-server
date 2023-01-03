export type FirstCharLowerCase<T extends string> = T extends `${infer U}${infer Rest}`
  ? `${Lowercase<U>}${Rest}`
  : T
