import prisma from "../config/prisma";
import { generateEditId, generateViewId } from "../utils/idGenerator";

export const notesService = {
  //Create new note
  create: async (content: string) => {
    const viewId = generateViewId();
    const editId = generateEditId();

    const note = await prisma.note.create({
      data: { viewId, editId, content },
    });

    return note;
  },

  //find note by viewID
  findByViewID: async (viewId: string) => {
    return await prisma.note.findUnique({ where: { viewId } });
  },

  //update note with editID validation
  update: async (viewId: string, editId: string, content: string) => {
    const note = await prisma.note.findUnique({ where: { editId } });

    if (!note || note.editId !== editId) {
      throw new Error("Unauthorized: Invalid edit token");
    }

    return await prisma.note.update({
      where: { viewId },
      data: { content },
    });
  },
};
