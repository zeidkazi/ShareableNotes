import { Request, Response } from "express";
import { notesService } from "../services/notes.service";

export const notesController = {
  //POST /api/notes - create a new note
  create: async (req: Request, res: Response) => {
    try {
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({
          error: "Content is required and must be string",
        });
      }

      const note = await notesService.create(content);

      res.status(201).json({
        id: note.id,
        viewId: note.viewId,
        editId: note.editId,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  },

  //GET /api/notes/:viewId - get a note by viewId
  getNote: async (req: Request, res: Response) => {
    try {
      const { viewId } = req.params;

      const note = await notesService.findByViewID(viewId);

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      // dont send editId
      res.json({
        id: note.id,
        viewId: note.viewId,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
    } catch (error) {
      console.error("Error in fetching note:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  },

  //PUT /api/notes/:viewId - update a note
  update: async (req: Request, res: Response) => {
    try {
      const { viewId } = req.params;
      const { editId, content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({
          error: "Content is required and must be string",
        });
      }

      if (!editId || typeof editId !== "string") {
        return res.status(400).json({
          error: "EditId is required for updating",
        });
      }

      const note = await notesService.update(viewId, editId, content);

      res.json({
        id: note.id,
        viewId: note.viewId,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
    } catch (error: any) {
      if (error.message.includes("Unauthorized"))
        return res.status(403).json({ error: error.message });
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  },
};
