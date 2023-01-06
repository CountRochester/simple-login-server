import type {
  QueryOptions, WhereQuery, QueryStringOption, QueryDateOption
} from '@/types/query'

export const formWhereOptions = <T extends object>(options: QueryOptions<T>): WhereQuery<T> => {
  const keys = Object
    .keys(options)
    .filter(key => key !== 'page' && key !== 'pageSize') as (
      Extract<keyof typeof options, string>
    )[]
  const output = keys.reduce((acc, key) => {
    const [field, modification] = key.split('_') as [
      Extract<keyof T, string>,
      QueryStringOption | QueryDateOption
    ]
    const value = options[key]
    const existed = acc[field]
    if (existed) {
      if (!modification) {
        acc[field] = {
          ...existed,
          equals: value
        }
      } else {
        acc[field] = {
          ...existed,
          [modification]: value
        }
      }
    } else if (!modification) {
      acc[field] = {
        equals: value
      } as unknown as WhereQuery<T>[typeof field]
    } else {
      acc[field] = {
        [modification]: value
      } as unknown as WhereQuery<T>[typeof field]
    }

    return acc
  }, {} as WhereQuery<T>)

  return output
}
