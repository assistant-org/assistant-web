import { z } from "zod";
import { EventType } from "./types";

export const eventFormSchema = z.object({
  name: z.string().min(1, "O nome do evento é obrigatório."),
  date: z.string().min(1, "A data é obrigatória."),
  type: z.nativeEnum(EventType, { error: "O tipo de evento é obrigatório." }),
  observations: z.string().optional(),
});

export type EventFormSchema = z.infer<typeof eventFormSchema>;
