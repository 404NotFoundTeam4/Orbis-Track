export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    maxPage: number;
    paginated: true;
    message?: string;
}