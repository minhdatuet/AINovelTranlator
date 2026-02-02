import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey });

export const translateText = async (
  text: string, 
  systemInstruction: string,
  glossary: string,
  modelName: string = 'gemini-2.0-flash-exp'
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing via process.env.API_KEY");
  }

  const prompt = `
Dịch chương truyện sau sang tiếng Việt.

GHI CHÚ/TỪ ĐIỂN RIÊNG (Ưu tiên sử dụng các từ này):
${glossary}

NỘI DUNG CẦN DỊCH:
${text}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for more consistent translation
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
};