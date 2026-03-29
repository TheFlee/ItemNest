import api from "./axios";
import type {
  CreateReportRequest,
  ReportItem,
  ReviewReportRequest,
} from "../types/report";

export async function createReport(request: CreateReportRequest): Promise<ReportItem> {
  const response = await api.post<ReportItem>("/reports", request);
  return response.data;
}

export async function getMyReports(): Promise<ReportItem[]> {
  const response = await api.get<ReportItem[]>("/reports/my");
  return response.data;
}

export async function getAllReports(): Promise<ReportItem[]> {
  const response = await api.get<ReportItem[]>("/reports");
  return response.data;
}

export async function reviewReport(
  id: string,
  request: ReviewReportRequest
): Promise<ReportItem> {
  const response = await api.put<ReportItem>(`/reports/${id}/review`, request);
  return response.data;
}