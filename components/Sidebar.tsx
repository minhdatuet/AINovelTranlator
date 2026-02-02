import React, { useRef, useState, useEffect } from 'react';
import { Chapter, TranslationStatus } from '../types';
import { FolderOpen, FileText, CheckCircle, Loader2, AlertCircle, Download, PlayCircle, StopCircle, BookOpen } from './Icons';

interface SidebarProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onUpload: (files: FileList) => void;
  onExport: () => void;
  onBatchTranslate: (range?: { start: number; end: number }) => void;
  onStopBatch: () => void;
  isBatchTranslating: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  chapters, 
  selectedChapterId, 
  onSelectChapter, 
  onUpload,
  onExport,
  onBatchTranslate,
  onStopBatch,
  isBatchTranslating
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Batch translation state
  const [batchMode, setBatchMode] = useState<'all' | 'range'>('all');
  const [rangeStart, setRangeStart] = useState<string>('1');
  const [rangeEnd, setRangeEnd] = useState<string>('');

  // Auto-update range end when chapters change
  useEffect(() => {
    if (chapters.length > 0) {
      setRangeEnd(chapters.length.toString());
    }
  }, [chapters.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartBatch = () => {
    if (batchMode === 'all') {
      onBatchTranslate();
    } else {
      const start = parseInt(rangeStart, 10);
      const end = parseInt(rangeEnd, 10);
      
      if (isNaN(start) || isNaN(end) || start > end || start < 1) {
        alert("Vui lòng nhập khoảng chương hợp lệ.");
        return;
      }
      onBatchTranslate({ start, end });
    }
  };

  const getStatusIcon = (status: TranslationStatus) => {
    switch (status) {
      case TranslationStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case TranslationStatus.TRANSLATING:
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case TranslationStatus.ERROR:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-600" />;
    }
  };

  const completedCount = chapters.filter(c => c.status === TranslationStatus.COMPLETED).length;

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10 space-y-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-indigo-600 p-1 rounded-md"><FileText size={20} /></span>
          AI Dịch Truyện
        </h1>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 py-2 px-2 rounded-md transition-colors border border-gray-700"
            title="Mở thư mục chứa truyện"
          >
            <FolderOpen size={14} />
            Mở Folder
          </button>
          
          <button
            onClick={onExport}
            disabled={chapters.length === 0}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 py-2 px-2 rounded-md transition-colors border border-gray-700 disabled:opacity-50"
            title="Tải xuống Epub"
          >
            <BookOpen size={14} />
            Tải Epub
          </button>
        </div>

        {/* Batch Controls */}
        {chapters.length > 0 && (
          <div className="pt-3 border-t border-gray-800 space-y-2">
            {!isBatchTranslating ? (
              <>
                 {/* Mode Toggle */}
                <div className="flex bg-gray-800 p-1 rounded-md">
                  <button 
                    onClick={() => setBatchMode('all')}
                    className={`flex-1 text-xs py-1.5 rounded-sm transition-all ${batchMode === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Tất cả
                  </button>
                  <button 
                    onClick={() => setBatchMode('range')}
                    className={`flex-1 text-xs py-1.5 rounded-sm transition-all ${batchMode === 'range' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Chọn chương
                  </button>
                </div>

                {/* Range Inputs */}
                {batchMode === 'range' && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 uppercase block mb-1">Từ</label>
                      <input 
                        type="number" 
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 uppercase block mb-1">Đến</label>
                      <input 
                        type="number" 
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartBatch}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-900/50 hover:bg-indigo-900/80 text-indigo-200 text-xs py-2 px-3 rounded-md transition-colors border border-indigo-500/30 font-medium"
                >
                  <PlayCircle size={14} />
                  {batchMode === 'all' ? `Dịch (${chapters.length - completedCount} chưa xong)` : 'Bắt Đầu Dịch'}
                </button>
              </>
            ) : (
              <button
                onClick={onStopBatch}
                className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900/80 text-red-200 text-xs py-2 px-3 rounded-md transition-colors border border-red-500/30 animate-pulse font-medium"
              >
                <StopCircle size={14} />
                Dừng Dịch
              </button>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          // @ts-ignore
          webkitdirectory="" 
          directory=""
          multiple
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chapters.length === 0 && (
          <div className="text-center text-gray-500 mt-10 p-4 text-sm">
            Chưa có file nào.<br/>Vui lòng chọn thư mục.
          </div>
        )}
        
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className={`w-full text-left px-3 py-3 rounded-md text-sm flex items-center gap-3 transition-colors ${
              selectedChapterId === chapter.id
                ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span className="text-xs text-gray-600 min-w-[20px]">{index + 1}.</span>
            {getStatusIcon(chapter.status)}
            <div className="truncate flex-1">
              <div className="font-medium truncate text-gray-200">{chapter.filename}</div>
              <div className="text-xs text-gray-500 truncate">{chapter.content.substring(0, 30)}...</div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer Stats */}
      <div className="p-3 bg-gray-950 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
        <span>Tổng: {chapters.length}</span>
        <span className="text-green-500">Hoàn thành: {completedCount}</span>
      </div>
    </div>
  );
};