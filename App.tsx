
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { SettingsPanel } from './components/SettingsPanel';
import { Chapter, TranslationStatus, AppSettings, GENRE_INSTRUCTIONS, DEFAULT_GLOSSARY } from './types';
import { translateText } from './services/geminiService';
import { translateWithQwen } from './services/qwenService';
import { generateEpub } from './services/epubService';

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBatchTranslating, setIsBatchTranslating] = useState(false);
  const stopBatchRef = useRef(false);
  
  // Default settings
  const [settings, setSettings] = useState<AppSettings>({
    genre: 'ancient',
    systemInstruction: GENRE_INSTRUCTIONS['ancient'],
    glossary: DEFAULT_GLOSSARY,
    model: 'gemini-2.0-flash-exp',
    provider: 'gemini',
    qwenApiKey: ''
  });

  // Reset model when provider changes if the current model is invalid for the new provider
  useEffect(() => {
    if (settings.provider === 'gemini' && settings.model.startsWith('qwen')) {
      setSettings(prev => ({ ...prev, model: 'gemini-2.0-flash-exp' }));
    } else if (settings.provider === 'qwen' && settings.model.startsWith('gemini')) {
      setSettings(prev => ({ ...prev, model: 'qwen-max' }));
    }
  }, [settings.provider]);

  const handleUpload = async (fileList: FileList) => {
    const newChapters: Chapter[] = [];
    
    // Sort files by name naturally to ensure chapter order (e.g., c1, c2, c10)
    const sortedFiles = Array.from(fileList).sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (const file of sortedFiles) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        newChapters.push({
          id: Math.random().toString(36).substr(2, 9),
          filename: file.name,
          title: file.name.replace('.txt', ''),
          content: text,
          translation: '',
          status: TranslationStatus.IDLE
        });
      }
    }

    setChapters(prev => [...prev, ...newChapters]);
    if (newChapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(newChapters[0].id);
    }
  };

  // Helper function to translate a single chapter content
  const performTranslation = async (content: string) => {
    if (settings.provider === 'qwen') {
      return await translateWithQwen(
        content,
        settings.systemInstruction,
        settings.glossary,
        settings.model,
        settings.qwenApiKey
      );
    } else {
      return await translateText(
        content,
        settings.systemInstruction,
        settings.glossary,
        settings.model
      );
    }
  };

  const handleTranslateSingle = async () => {
    if (!selectedChapterId || isTranslating || isBatchTranslating) return;

    const chapterIndex = chapters.findIndex(c => c.id === selectedChapterId);
    if (chapterIndex === -1) return;

    const chapter = chapters[chapterIndex];
    updateChapterStatus(chapter.id, TranslationStatus.TRANSLATING);
    setIsTranslating(true);

    try {
      const translatedText = await performTranslation(chapter.content);
      
      setChapters(prev => {
        const newChapters = [...prev];
        const idx = newChapters.findIndex(c => c.id === chapter.id);
        if (idx !== -1) {
            newChapters[idx] = {
            ...newChapters[idx],
            translation: translatedText,
            status: TranslationStatus.COMPLETED,
            errorMessage: undefined
            };
        }
        return newChapters;
      });
    } catch (error: any) {
      updateChapterStatus(chapter.id, TranslationStatus.ERROR, error.message || "Unknown error");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBatchTranslate = async (range?: { start: number; end: number }) => {
    if (isBatchTranslating || chapters.length === 0) return;
    
    setIsBatchTranslating(true);
    stopBatchRef.current = false;

    let chaptersToProcess = chapters;

    // Apply range filter if provided (User uses 1-based index)
    if (range) {
      const startIndex = Math.max(0, range.start - 1); // convert to 0-based
      const endIndex = Math.min(chapters.length, range.end); // slice end is exclusive
      chaptersToProcess = chapters.slice(startIndex, endIndex);
    }

    // Filter chapters that need translation (IDLE or ERROR) within the target range
    const chaptersToTranslate = chaptersToProcess.filter(
        c => c.status === TranslationStatus.IDLE || c.status === TranslationStatus.ERROR
    );

    if (chaptersToTranslate.length === 0) {
      alert("Không có chương nào cần dịch trong khoảng đã chọn (các chương đã hoàn thành sẽ được bỏ qua).");
      setIsBatchTranslating(false);
      return;
    }

    for (const chapter of chaptersToTranslate) {
      if (stopBatchRef.current) break;

      // Select the chapter currently being translated so user can see it
      setSelectedChapterId(chapter.id);
      
      let attempts = 0;
      const maxRetries = 5;
      let success = false;

      while (!success && attempts < maxRetries && !stopBatchRef.current) {
        // Update status to translating (or retrying info)
        if (attempts > 0) {
            updateChapterStatus(chapter.id, TranslationStatus.TRANSLATING, `Đang thử lại (Lần ${attempts})...`);
        } else {
            updateChapterStatus(chapter.id, TranslationStatus.TRANSLATING);
        }

        try {
          const translatedText = await performTranslation(chapter.content);
          
          setChapters(prev => {
            const newChapters = [...prev];
            const idx = newChapters.findIndex(c => c.id === chapter.id);
            if (idx !== -1) {
              newChapters[idx] = {
                ...newChapters[idx],
                translation: translatedText,
                status: TranslationStatus.COMPLETED,
                errorMessage: undefined
              };
            }
            return newChapters;
          });
          
          success = true;
          // Standard delay between successful requests
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error: any) {
          const errorMsg = error.toString() + JSON.stringify(error);
          const isRateLimit = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Throttling');

          if (isRateLimit) {
            attempts++;
            // Exponential backoff: 5s, 10s, 20s...
            const waitTime = 5000 * Math.pow(2, attempts - 1);
            
            updateChapterStatus(
                chapter.id, 
                TranslationStatus.TRANSLATING, 
                `Quá tải (429). Đợi ${waitTime/1000}s...`
            );
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            updateChapterStatus(chapter.id, TranslationStatus.ERROR, error.message || "Unknown Error");
            break; // Stop retrying for non-rate-limit errors
          }
        }
      }

      if (!success && attempts >= maxRetries) {
        updateChapterStatus(chapter.id, TranslationStatus.ERROR, "Thất bại: Quá tải server liên tục.");
        // Optional: break loop if we want to stop entirely on persistent failure
        // break; 
      }
    }

    setIsBatchTranslating(false);
  };

  const handleStopBatch = () => {
    stopBatchRef.current = true;
  };

  const updateChapterStatus = (id: string, status: TranslationStatus, error?: string) => {
    setChapters(prev => prev.map(c => 
      c.id === id ? { ...c, status, errorMessage: error } : c
    ));
  };

  const updateTranslation = (text: string) => {
    if (!selectedChapterId) return;
    setChapters(prev => prev.map(c => 
      c.id === selectedChapterId ? { ...c, translation: text } : c
    ));
  };

  const handleExport = async () => {
    try {
      const blob = await generateEpub(chapters, "Bản Dịch AI", "AI Translator");
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Translated_Novel.epub";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const selectedChapter = chapters.find(c => c.id === selectedChapterId) || null;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar 
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        onSelectChapter={setSelectedChapterId}
        onUpload={handleUpload}
        onExport={handleExport}
        onBatchTranslate={handleBatchTranslate}
        onStopBatch={handleStopBatch}
        isBatchTranslating={isBatchTranslating}
      />
      
      <div className="flex-1 flex min-w-0">
        <Editor 
          chapter={selectedChapter}
          onTranslate={handleTranslateSingle}
          onUpdateTranslation={updateTranslation}
          isTranslating={isTranslating} // Keep this for single translate button disable state
        />
        
        <SettingsPanel 
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  );
};

export default App;
