import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "../axios/httpFunctions";
import type { CreateNoteRequest, UpdateNoteRequest } from "../types";

export function useCreateNote() {
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: (data: CreateNoteRequest) => notesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return { mutations: { createNoteMutation } };
}

export function useNote(viewId: string) {
  const getNoteService = useQuery({
    queryKey: ["notes", viewId],
    queryFn: () => notesApi.getByViewId(viewId),
    enabled: !!viewId,
  });

  return { services: { getNoteService } };
}

export function useUpdateNote(viewId: string) {
  const queryClient = useQueryClient();

  const updateNoteMutation = useMutation({
    mutationFn: (data: UpdateNoteRequest) => notesApi.update(viewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", viewId] });
    },
  });

  return { mutations: { updateNoteMutation } };
}
