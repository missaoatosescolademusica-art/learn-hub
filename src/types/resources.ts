export interface Resource {
  id: string;
  type: string;
  path: string;
  originalName: string;
  categoryPath: string;
  size: number | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface ResourcesResponse {
  data: Resource[];
  page: number;
  totalPages: number;
}
