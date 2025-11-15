export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    paginated: true;
    message?: string;
}