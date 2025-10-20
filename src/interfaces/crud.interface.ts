export interface CrudInterface<T> {
    findAll(): Promise<T[] | undefined>
    findById(id: number): Promise<T | undefined>
    create(data: Partial<T>): Promise<T[]>
    update(id: number, patch: Partial<Omit<T, "id">>): Promise<T[]>
    delete(id: number): Promise<number>
}