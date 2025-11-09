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
      <div className="border-b border-neutral-200 bg-white p-3 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors truncate"
              />
              <button
                onClick={copyUrl}
                className="px-3 sm:px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm hover:bg-neutral-100 hover:border-neutral-300 flex items-center gap-1 sm:gap-2 text-neutral-700 transition-colors flex-shrink-0"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>

            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 sm:px-4 py-2 bg-black text-white rounded-lg flex items-center gap-1 sm:gap-2 font-medium hover:bg-neutral-800 transition-colors text-xs sm:text-sm flex-shrink-0"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {!canEdit && !isEditing && (
              <button
                onClick={handleCreateCopy}
                disabled={createMutations.createNoteMutation.isPending}
                className="px-3 sm:px-4 py-2 bg-black text-white rounded-lg flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:bg-neutral-800 transition-colors text-xs sm:text-sm flex-shrink-0"
              >
                {createMutations.createNoteMutation.isPending ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <CopyPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">
                  {createMutations.createNoteMutation.isPending
                    ? "Creating..."
                    : "Create Copy"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] shadow-sm">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-3 sm:p-4 bg-transparent border border-neutral-200 rounded-lg resize-none focus:outline-none focus:border-neutral-400 text-neutral-900 transition-colors text-sm sm:text-base"
            />
          ) : (
            <div className="whitespace-pre-wrap min-h-[300px] sm:min-h-[400px] md:min-h-[500px] text-neutral-800 leading-relaxed text-sm sm:text-base">
              {note.content || (
                <span className="text-neutral-400">No content</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-neutral-600">
            <p>Created {new Date(note.createdAt).toLocaleString()}</p>
            {note.updatedAt !== note.createdAt && (
              <p>Updated {new Date(note.updatedAt).toLocaleString()}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setContent(note.content);
                  setIsEditing(false);
                }}
                className="w-full sm:w-auto px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutations.updateNoteMutation.isPending}
                className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium hover:bg-neutral-800 transition-colors text-sm sm:text-base"
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
