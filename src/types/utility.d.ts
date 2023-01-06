export type FirstCharLowerCase<T extends string> = T extends `${infer U}${infer Rest}`
  ? `${Lowercase<U>}${Rest}`
  : T

export type SwitchKeyValue<
  T,
  T1 extends Record<string, any> = { [K in keyof T]: { key: K; value: T[K] } },
  T2 = {
    [K in GetValues<T1>['value']]: Extract<GetValues<T1>, { value: K }>['key']
  }
  > = T2

export type ResolveType<T> = T extends object ? { [K in keyof T]: ResolveType<T[K]> } : T

export type OnlyStringKeys<
  TObj extends object,
  > = {
    [K in Extract<keyof TObj, string>]: TObj[K] extends string ? K : never
  }[Extract<keyof TObj, string>]
