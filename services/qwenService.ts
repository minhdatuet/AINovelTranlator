
export const translateWithQwen = async (
  text: string,
  systemInstruction: string,
  glossary: string,
  modelName: string,
  apiKey: string
): Promise<string> => {
  const cleanApiKey = apiKey?.trim();
  if (!cleanApiKey) {
    throw new Error("Vui lòng nhập Alibaba Cloud API Key trong phần Cấu Hình.");
  }

  // Cập nhật Endpoint theo tài liệu cho khu vực Singapore (International)
  // Base URL: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
  const endpoint = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

  const prompt = `
Dịch chương truyện sau sang tiếng Việt.

GHI CHÚ/TỪ ĐIỂN RIÊNG (Ưu tiên sử dụng các từ này):
${glossary}

NỘI DUNG CẦN DỊCH:
${text}
`;

  // Một số model Qwen (đặc biệt là dòng Qwen-MT, Qwen-VL hoặc các model cũ)
  // có thể báo lỗi "Role must be in [user, assistant]" nếu gặp role 'system' qua API OpenAI-compatible.
  // Giải pháp an toàn: Gộp System Instruction vào đầu User Message.
  const finalUserContent = systemInstruction 
    ? `${systemInstruction}\n\n---\n\n${prompt}`
    : prompt;

  const payload = {
    model: modelName,
    messages: [
      {
        role: "user",
        content: finalUserContent
      }
    ],
    temperature: 0.3
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        // Cố gắng lấy message chi tiết từ response của Alibaba
        errorMessage = errorData.message || errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {
        // Nếu không parse được JSON, thử lấy text raw
        try {
            const textError = await response.text();
            if (textError) errorMessage = textError;
        } catch (textEx) {
            // ignore
        }
      }
      throw new Error(`Qwen API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    
    // Parse response theo format OpenAI
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content || "";
    } else {
       console.warn("Qwen Empty Response:", data);
       throw new Error("API trả về thành công nhưng không có nội dung dịch.");
    }

  } catch (error: any) {
    console.error("Qwen Translation Detailed Error:", error);
    
    // Xử lý lỗi Failed to fetch (Network/CORS)
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
       throw new Error(
         `Lỗi kết nối (Failed to fetch). \n` +
         `1. Kiểm tra API Key.\n` +
         `2. Kiểm tra kết nối mạng.\n` +
         `3. Mở F12 (Developer Tools) -> tab Network để xem chi tiết lỗi (thường là lỗi CORS hoặc chặn kết nối).`
       );
    }
    
    throw error;
  }
};
