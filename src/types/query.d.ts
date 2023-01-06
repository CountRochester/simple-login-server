import type { ResolveType } from './utility'

export type GetValues<T extends object> = T[keyof T]

export type QueryStringOption = 'contains' | 'in' | 'endsWith' | 'startsWith'
| 'gte' | 'gt' | 'lte' | 'lt' | 'not' | 'notIn'

export type QueryDateOption = 'in' | 'gte' | 'gt' | 'lte' | 'lt' | 'not' | 'notIn' | 'in'

export type ArrayModification = 'in' | 'notIn'

export type QueryKey<TName extends string, TValue> = TValue extends string
  ? `${TName}_${QueryStringOption}` | TName
  : TValue extends Date
    ? `${TName}_${QueryDateOption}` | TName
    : TName

export type ExtractModification<T extends string> = T extends `${string}_${infer U}` ? U : never

export type QueryObject<
  TName extends string,
  TValue,
  T0 extends QueryKey<TName, TValue> = QueryKey<TName, TValue>
> = {
    [K in T0]: ExtractModification<K> extends ArrayModification
      ? ExtractModification<K> extends 'equals' ? TValue : readonly TValue[]
      : TValue
}

export type QueryObj<
    TName extends string,
    TValue,
    TOptions extends Partial<QueryObject<TName, TValue>>
  > = {
    [K in keyof TOptions ]: {
      key: K,
      modification: K extends `${TName}_${infer U}` ? U : 'equals',
      value: TOptions[K]
    }
  }

export type QueryOutput<
  TName extends string,
  TValue,
  TOptions extends Readonly<Partial<QueryObject<TName, TValue>>>,
  T0 extends QueryObj<TName, TValue, TOptions> = QueryObj<TName, TValue, TOptions>
  > = {
  [K in T0[keyof T0]['modification']]: Extract<GetValues<T0>, { modification: K }>['value']
  }

export type QueryOptions<
  T extends object,
  TK extends Extract<keyof T, string> = Extract<keyof T, string>,
  T0 extends {
    [K in TK]: {
      key: K,
      value: T[K],
      options: QueryKey<K, T[K]>
    }
  } = { [K in TK]: {
    key: K,
    value: T[K],
    options: QueryKey<K, T[K]>
  } },
  T1 extends {
    [K2 in T0[keyof T0]['options']]: K2 extends `${infer Key}_${infer Mod}`
      ? Mod extends ArrayModification
        ? (Extract<GetValues<T0>, { key: Key }>['value'])[]
        : Extract<GetValues<T0>, { key: Key }>['value']
      : Extract<GetValues<T0>, { key: K2 }>['value']
  } = {
    [K2 in T0[keyof T0]['options']]: K2 extends `${infer Key}_${infer Mod}`
      ? Mod extends ArrayModification
        ? (Extract<GetValues<T0>, { key: Key }>['value'])[]
        : Extract<GetValues<T0>, { key: Key }>['value']
      : Extract<GetValues<T0>, { key: K2 }>['value']
  },
> = ResolveType<Partial<T1> & { pageSize?: number, page?: number }>

export type WhereQuery<
  T extends object,
> = ResolveType<{
    [K in Extract<keyof T, string>]: QueryOutput<
      K,
      T[K],
      Partial<QueryObject<K, T[K]>>
    >
}>
