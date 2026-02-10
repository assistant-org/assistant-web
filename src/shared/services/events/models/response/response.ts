import { Event } from "../../types";

export type EventResponse = Event;

export type EventsListResponse = Event[];

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}