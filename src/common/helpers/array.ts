import type { OnlyStringKeys } from '@/types/utility'

export const makeIndexed = <T extends object, U extends OnlyStringKeys<T>>(
  arr: T[],
  key: U
) => arr.reduce((acc, el) => {
    acc[el[key] as string] = el
    return acc
  }, {} as Record<string, T>)
