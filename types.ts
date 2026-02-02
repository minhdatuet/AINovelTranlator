
export enum TranslationStatus {
  IDLE = 'IDLE',
  TRANSLATING = 'TRANSLATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type Genre = 'ancient' | 'modern';

export type AIProvider = 'gemini' | 'qwen';

export interface Chapter {
  id: string;
  filename: string;
  title: string; // Extracted from filename or first line
  content: string; // Original Chinese
  translation: string; // Vietnamese output
  status: TranslationStatus;
  errorMessage?: string;
}

export interface AppSettings {
  systemInstruction: string;
  glossary: string;
  model: string;
  genre: Genre;
  provider: AIProvider;
  qwenApiKey: string;
}

export const GENRE_INSTRUCTIONS = {
  ancient: `Bạn là một dịch giả chuyên nghiệp chuyên dịch truyện tiên hiệp/huyền ảo/cổ đại Trung Quốc sang tiếng Việt.
Phong cách dịch:
- Sử dụng văn phong cổ trang, trang trọng, hào hùng.
- Cách xưng hô: Bắt buộc sử dụng các đại từ nhân xưng đặc trưng như "ta", "ngươi", "hắn", "nàng", "tại hạ", "các hạ", "huynh", "đệ"... (Tuyệt đối không dùng "tôi", "bạn", "anh ấy", "cô ấy").
- Giữ nguyên các từ Hán Việt đặc trưng của dòng tu tiên (như: Đạo hữu, Bần đạo, Pháp bảo, Động phủ...).
- Dịch thoát ý nhưng vẫn sát nghĩa gốc, tránh văn phong hiện đại (như: ok, cool, nhé, ạ...).
- Xử lý mượt mà các đoạn thơ, câu đối nếu có.`,
  
  modern: `Bạn là một dịch giả chuyên nghiệp chuyên dịch truyện đô thị/ngôn tình/hiện đại Trung Quốc sang tiếng Việt.
Phong cách dịch:
- Sử dụng văn phong hiện đại, tự nhiên, nhưng vẫn giữ chất "truyện dịch".
- Cách xưng hô: 
  + Dẫn chuyện (Narrator): Bắt buộc dùng "hắn" (để chỉ nam), "nàng" (để chỉ nữ).
  + Hội thoại: Tùy ngữ cảnh. Vẫn ưu tiên sử dụng "ta", "ngươi" (khi nhân vật thể hiện sự bá đạo, lạnh lùng, hoặc đối đầu). Các trường hợp thân mật, đời thường mới dùng "anh", "em", "tôi", "cậu".
- Hạn chế lạm dụng từ Hán Việt, ưu tiên từ thuần Việt dễ hiểu (Ví dụ: thay "nữ hài" bằng "cô bé").
- Lời thoại nhân vật cần phản ánh đúng tính cách và bối cảnh hiện đại.
- Các thuật ngữ internet (slang) nếu có thể chuyển ngữ sang tiếng lóng Việt Nam tương đương.`
};

export const DEFAULT_GLOSSARY = `Tiêu Viêm=Tiêu Viêm
Đấu Khí=Đấu Khí
Hồn Điện=Hồn Điện
(Thêm các từ khóa đặc biệt ở đây, mỗi từ một dòng)`;
