import api from "./axios.config";
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteResponse,
} from "../types";

// HTTP functions for notes API

export const notesApi = {
  // Create a new note
  create: async (data: CreateNoteRequest): Promise<NoteResponse> => {
    const response = await api.post<NoteResponse>("/notes", data);
    return response.data;
  },

  // Get note by viewId
  getByViewId: async (viewId: string): Promise<NoteResponse> => {
    const response = await api.get<NoteResponse>(`/notes/${viewId}`);
    return response.data;
  },

  // Update note
  update: async (
    viewId: string,
    data: UpdateNoteRequest
  ): Promise<NoteResponse> => {
    const response = await api.put<NoteResponse>(`/notes/${viewId}`, data);
    return response.data;
  },
};
