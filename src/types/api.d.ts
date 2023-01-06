export type PaginationData = {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export type EntityList<T> = {
  data: T[]
  pagination: PaginationData
}
