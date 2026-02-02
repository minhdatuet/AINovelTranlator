
import React from 'react';
import { AppSettings, GENRE_INSTRUCTIONS, Genre } from '../types';
import { Settings, Sparkles, BookOpen, Key } from './Icons';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (key: keyof AppSettings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleGenreChange = (newGenre: Genre) => {
    onSettingsChange({
      ...settings,
      genre: newGenre,
      systemInstruction: GENRE_INSTRUCTIONS[newGenre]
    });
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <Settings size={18} className="text-gray-400" />
        <h2 className="font-semibold text-gray-200">Cấu Hình Dịch</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Genre Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-2">
             <BookOpen size={14} /> Thể Loại Truyện
          </label>
          <select 
            value={settings.genre}
            onChange={(e) => handleGenreChange(e.target.value as Genre)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ancient">Tiên Hiệp / Cổ Đại / Huyền Huyễn</option>
            <option value="modern">Đô Thị / Ngôn Tình / Hiện Đại</option>
          </select>
          <p className="text-xs text-gray-500">
            Chọn thể loại sẽ tự động cập nhật Prompt hệ thống để phù hợp với văn phong.
          </p>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Nhà Cung Cấp AI</label>
          <div className="flex bg-gray-800 p-1 rounded-md">
            <button
              onClick={() => handleChange('provider', 'gemini')}
              className={`flex-1 text-xs py-2 rounded-sm transition-all ${settings.provider === 'gemini' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Google Gemini
            </button>
            <button
              onClick={() => handleChange('provider', 'qwen')}
              className={`flex-1 text-xs py-2 rounded-sm transition-all ${settings.provider === 'qwen' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Alibaba Qwen
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Model AI</label>
          <select 
            value={settings.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {settings.provider === 'gemini' ? (
              <>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp (Quota cao nhất)</option>
                <option value="gemini-flash-latest">Gemini 1.5 Flash (Ổn định/Nhanh)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Mới)</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro (Thông minh/Chậm)</option>
              </>
            ) : (
              <>
                <optgroup label="Flagship (Thông minh nhất)">
                  <option value="qwen-max">Qwen-Max (SOTA - Tốt nhất)</option>
                  <option value="qwen-plus">Qwen-Plus (Cân bằng)</option>
                </optgroup>
                
                <optgroup label="Translation (Chuyên dịch thuật)">
                   <option value="qwen-mt-plus">Qwen-MT-Plus (Dịch hay nhất)</option>
                   <option value="qwen-mt-flash">Qwen-MT-Flash (Dịch nhanh)</option>
                   <option value="qwen-mt-lite">Qwen-MT-Lite (Siêu tốc/Tiết kiệm)</option>
                </optgroup>

                <optgroup label="Fast/Long Context (Nhanh/Dài)">
                  <option value="qwen-flash">Qwen-Flash (1M Token Context)</option>
                </optgroup>
                
                <optgroup label="Coding (Lập trình)">
                  <option value="qwen-coder-plus">Qwen-Coder-Plus</option>
                  <option value="qwen-coder-flash">Qwen-Coder-Flash</option>
                </optgroup>
                
                <optgroup label="Open Source">
                  <option value="qwen3-vl-32b-instruct">Qwen3-VL-32B-Instruct</option>
                </optgroup>
              </>
            )}
          </select>
          {settings.provider === 'gemini' && (
             <p className="text-xs text-gray-500">
               Nếu gặp lỗi 429, hãy chọn <b>Gemini 2.0 Flash Exp</b>.
             </p>
          )}
          {settings.provider === 'qwen' && settings.model.includes('mt') && (
             <p className="text-xs text-green-500">
               Model dòng <b>Qwen-MT</b> được tối ưu hóa đặc biệt cho dịch thuật đa ngôn ngữ.
             </p>
          )}
        </div>

        {/* API Key Input for Qwen */}
        {settings.provider === 'qwen' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-2">
               <Key size={14} /> Qwen API Key
            </label>
            <input
              type="password"
              value={settings.qwenApiKey}
              onChange={(e) => handleChange('qwenApiKey', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="sk-..."
            />
            <p className="text-[10px] text-gray-500">
              Nhập API Key từ Alibaba Cloud Console. Key được lưu tạm thời trên trình duyệt.
            </p>
          </div>
        )}

        {/* System Instruction */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-2">
             Prompt Hệ Thống
          </label>
          <textarea
            value={settings.systemInstruction}
            onChange={(e) => handleChange('systemInstruction', e.target.value)}
            className="w-full h-32 bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md p-3 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
            placeholder="Nhập hướng dẫn cho AI..."
          />
        </div>

        {/* Glossary */}
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-500"/> VP / Ghi chú (Glossary)
          </label>
          <div className="text-xs text-gray-500 mb-1">Định dạng: Nguyên tác=Dịch (Mỗi từ 1 dòng)</div>
          <textarea
            value={settings.glossary}
            onChange={(e) => handleChange('glossary', e.target.value)}
            className="w-full flex-1 min-h-[150px] bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md p-3 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
            placeholder="Tiêu Viêm=Tiêu Viêm..."
          />
        </div>
      </div>
    </div>
  );
};
