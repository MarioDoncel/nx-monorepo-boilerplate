export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	perPage: number;
}

export interface PaginationArgs {
	page?: number;
	perPage?: number;
}
