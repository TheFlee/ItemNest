export interface CreateReportRequest {
  itemPostId: string;
  reason: number;
  description: string;
}

export interface ReviewReportRequest {
  status: number;
}

export interface ReportItem {
  id: string;
  reporterUserId: string;
  reporterFullName: string;
  itemPostId: string;
  itemPostTitle: string;
  reason: number;
  description: string;
  status: number;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
}