import { Output } from "../../types";

export type OutputResponse = Output;

export type OutputsListResponse = Output[];

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
