// Shared type definitions

export interface Note {
  id: string;
  viewId: string;
  editId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// API request/response types

export interface CreateNoteRequest {
  content: string;
}

export interface UpdateNoteRequest {
  content: string;
  editId: string;
}

export interface NoteResponse {
  id: string;
  viewId: string;
  editId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
