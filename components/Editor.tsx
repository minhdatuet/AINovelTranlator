import React from 'react';
import { Chapter, TranslationStatus } from '../types';
import { Play, Loader2, Save, Sparkles } from './Icons';

interface EditorProps {
  chapter: Chapter | null;
  onTranslate: () => void;
  onUpdateTranslation: (text: string) => void;
  isTranslating: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  chapter, 
  onTranslate, 
  onUpdateTranslation,
  isTranslating 
}) => {
  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-500">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Chọn một chương để bắt đầu dịch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 min-w-0">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-800 flex items-center px-6 justify-between bg-gray-900/50 backdrop-blur-sm">
        <h2 className="font-semibold text-gray-100 truncate max-w-md" title={chapter.filename}>
          {chapter.filename}
        </h2>
        
        <div className="flex items-center gap-3">
           <span className={`text-xs px-2 py-1 rounded-full border ${
             chapter.status === TranslationStatus.COMPLETED ? 'border-green-800 bg-green-900/30 text-green-400' :
             chapter.status === TranslationStatus.ERROR ? 'border-red-800 bg-red-900/30 text-red-400' :
             'border-gray-700 bg-gray-800 text-gray-400'
           }`}>
             {chapter.status}
           </span>
           
          <button
            onClick={onTranslate}
            disabled={isTranslating}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              isTranslating 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
            }`}
          >
            {isTranslating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang dịch...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Dịch Chương Này
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source */}
        <div className="flex-1 flex flex-col border-r border-gray-800 bg-gray-900/30">
          <div className="p-2 bg-gray-900/80 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800 sticky top-0">
            Nguyên Tác (Trung)
          </div>
          <textarea
            readOnly
            value={chapter.content}
            className="flex-1 w-full p-6 bg-transparent text-gray-300 resize-none focus:outline-none leading-relaxed font-serif text-lg"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>

        {/* Target */}
        <div className="flex-1 flex flex-col bg-gray-950">
          <div className="p-2 bg-gray-900/80 text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-gray-800 sticky top-0 flex justify-between items-center">
            <span>Bản Dịch (Việt)</span>
            {chapter.status === TranslationStatus.COMPLETED && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Save size={10} /> Đã lưu
                </span>
            )}
          </div>
          <textarea
            value={chapter.translation}
            onChange={(e) => onUpdateTranslation(e.target.value)}
            placeholder={isTranslating ? "AI đang suy nghĩ và dịch..." : "Bản dịch sẽ xuất hiện ở đây..."}
            className="flex-1 w-full p-6 bg-transparent text-gray-100 resize-none focus:outline-none leading-relaxed font-serif text-lg selection:bg-indigo-500/30"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
      </div>
      
      {chapter.errorMessage && (
        <div className="bg-red-900/20 border-t border-red-900/50 p-2 text-red-400 text-sm px-6">
          Lỗi: {chapter.errorMessage}
        </div>
      )}
    </div>
  );
};