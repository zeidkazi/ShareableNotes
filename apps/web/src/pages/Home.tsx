import { useNavigate } from "react-router-dom";
import { PenSquare, FileText, Share2, Users } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <div className="w-20 h-20 border border-neutral-200 rounded-xl flex items-center justify-center bg-white hover:border-neutral-300 transition-all duration-300 hover:scale-105 shadow-sm">
              <PenSquare className="w-10 h-10 text-neutral-900" />
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-4 tracking-tight text-neutral-900">
            Notes App
          </h1>
          <p className="text-neutral-600 text-lg mb-10">
            Create and share notes instantly
          </p>

          <button
            onClick={() => navigate("/create")}
            className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-all duration-200 hover:scale-105"
          >
            Create Note
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-300 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm">
            <div className="w-12 h-12 border border-neutral-200 rounded-lg flex items-center justify-center mb-4 bg-neutral-50">
              <FileText className="w-6 h-6 text-neutral-900" />
            </div>
            <h3 className="font-semibold mb-2 text-neutral-900">Write</h3>
            <p className="text-neutral-600 text-sm">
              Distraction-free writing experience
            </p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-300 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm">
            <div className="w-12 h-12 border border-neutral-200 rounded-lg flex items-center justify-center mb-4 bg-neutral-50">
              <Share2 className="w-6 h-6 text-neutral-900" />
            </div>
            <h3 className="font-semibold mb-2 text-neutral-900">Share</h3>
            <p className="text-neutral-600 text-sm">
              Shareable links with unique IDs
            </p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-300 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm">
            <div className="w-12 h-12 border border-neutral-200 rounded-lg flex items-center justify-center mb-4 bg-neutral-50">
              <Users className="w-6 h-6 text-neutral-900" />
            </div>
            <h3 className="font-semibold mb-2 text-neutral-900">Collaborate</h3>
            <p className="text-neutral-600 text-sm">
              View or edit access control
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
