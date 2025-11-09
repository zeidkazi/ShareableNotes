import { Router } from "express";
import { notesController } from "../controllers/notes.controller";

const router = Router();

//create a new post
router.post("/", notesController.create);

//get notes with viewId
router.get("/:viewId", notesController.getNote);

router.put("/:viewId", notesController.update);

//update note with viewId

export default router;
