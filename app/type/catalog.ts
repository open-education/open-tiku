export interface Catalog {
  label: string,
  key: string,
  order: number,
  children?: Catalog[]
}
