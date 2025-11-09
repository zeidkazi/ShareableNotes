import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Copy, Edit, Loader2, CopyPlus } from "lucide-react";
import {
  useNote,
  useUpdateNote,
  useCreateNote,
} from "../lib/react-query/hooks";
import { useNoteStorage } from "../hooks/useNoteStorage";

export default function ViewNote() {
  const { viewId } = useParams<{ viewId: string }>();
  const navigate = useNavigate();
  const { services } = useNote(viewId || "");
  const { mutations: updateMutations } = useUpdateNote(viewId || "");
  const { mutations: createMutations } = useCreateNote();
  const { hasEditAccess, getNoteToken, saveNoteToken } = useNoteStorage();

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const { data: note, isLoading, error } = services.getNoteService;

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setShareUrl(`${window.location.origin}/note/${note.viewId}`);
    }
  }, [note]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSave = async () => {
    if (!viewId) return;

    const editId = getNoteToken(viewId);
    if (!editId) {
      toast.error("No permission to edit");
      return;
    }

    try {
      await updateMutations.updateNoteMutation.mutateAsync({ content, editId });
      toast.success("Saved!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to save");
    }
  };

  const handleCreateCopy = async () => {
    if (!content.trim()) return;

    try {
      const result = await createMutations.createNoteMutation.mutateAsync({
        content,
      });
      if (result.editId) {
        saveNoteToken(result.viewId, result.editId);
      }
      toast.success("Copy created!");
      navigate(`/note/${result.viewId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create copy");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Note not found</p>
          <button
            onClick={() => navigate("/")}
            className="text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const canEdit = hasEditAccess(viewId || "");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-neutral-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
            />
            <button
              onClick={copyUrl}
              className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-100 hover:border-neutral-300 flex items-center gap-2 text-neutral-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>

          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 font-medium hover:bg-neutral-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}

          {!canEdit && !isEditing && (
            <button
              onClick={handleCreateCopy}
              disabled={createMutations.createNoteMutation.isPending}
              className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:bg-neutral-800 transition-colors"
            >
              {createMutations.createNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CopyPlus className="w-4 h-4" />
              )}
              {createMutations.createNoteMutation.isPending
                ? "Creating..."
                : "Create Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-neutral-200 p-6 min-h-[500px] shadow-sm">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 bg-transparent border border-neutral-200 rounded-lg resize-none focus:outline-none focus:border-neutral-400 text-neutral-900 transition-colors"
            />
          ) : (
            <div className="whitespace-pre-wrap min-h-[500px] text-neutral-800 leading-relaxed">
              {note.content || (
                <span className="text-neutral-400">No content</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-neutral-600">
            <p>Created {new Date(note.createdAt).toLocaleString()}</p>
            {note.updatedAt !== note.createdAt && (
              <p>Updated {new Date(note.updatedAt).toLocaleString()}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setContent(note.content);
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutations.updateNoteMutation.isPending}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium hover:bg-neutral-800 transition-colors"
              >
                {updateMutations.updateNoteMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {updateMutations.updateNoteMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
