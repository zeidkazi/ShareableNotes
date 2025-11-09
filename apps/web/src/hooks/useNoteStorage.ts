const STORAGE_KEY = "noteTokens";

export function useNoteStorage() {
  const getNoteTokens = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveNoteToken = (viewId: string, editId: string) => {
    const tokens = getNoteTokens();
    tokens[viewId] = editId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  };

  const getNoteToken = (viewId: string) => {
    return getNoteTokens()[viewId] || null;
  };

  const hasEditAccess = (viewId: string) => {
    return !!getNoteToken(viewId);
  };

  return {
    saveNoteToken,
    getNoteToken,
    hasEditAccess,
  };
}
