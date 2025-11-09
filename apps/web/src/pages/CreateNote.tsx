import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNoteStorage } from "../hooks/useNoteStorage";
import { useCreateNote } from "../lib/react-query/hooks";

export default function CreateNote() {
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { mutations } = useCreateNote();
  const { saveNoteToken } = useNoteStorage();

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      const result = await mutations.createNoteMutation.mutateAsync({
        content,
      });
      if (result.editId) {
        saveNoteToken(result.viewId, result.editId);
      }
      toast.success("Note created!");
      navigate(`/note/${result.viewId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create note");
    }
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="border-b border-neutral-200 bg-white p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h2 className="text-sm font-medium text-neutral-600">New Note</h2>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your note..."
            className="w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 sm:p-6 bg-white border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-neutral-400 text-neutral-900 placeholder:text-neutral-400 transition-colors text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors text-neutral-700 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || mutations.createNoteMutation.isPending}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium hover:bg-neutral-800 transition-colors text-sm sm:text-base"
          >
            {mutations.createNoteMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {mutations.createNoteMutation.isPending ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
