export interface IPaginationResponse {
	total: number;
	page: number;
	limit: number;
}

export interface IPaginationParams {
	page?: number;
	limit?: number;
}

