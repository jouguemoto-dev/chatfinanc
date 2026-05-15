import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Moradia",
  "Outros"
];

export async function categorizeTransaction(description: string, history: Transaction[]): Promise<string> {
  if (!description) return "Outros";

  // Filter last 20 transactions for context
  const recentHistory = history
    .slice(-20)
    .map(t => ({ description: t.description, category: t.category }));

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Categorize a seguinte transação financeira baseada na descrição: "${description}".
    
    Categorias permitidas: ${CATEGORIES.join(", ")}.
    
    Histórico recente do usuário para contexto:
    ${JSON.stringify(recentHistory)}
    
    Responda APENAS com o nome da categoria que melhor se encaixa. Se não tiver certeza, use "Outros".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: CATEGORIES,
            description: "A categoria que melhor descreve a transação."
          }
        },
        required: ["category"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text);
    return result.category || "Outros";
  } catch (e) {
    console.error("Erro ao processar resposta da IA:", e);
    // Fallback simple matching if JSON fails or text is weird
    const text = response.text.trim();
    const found = CATEGORIES.find(c => text.includes(c));
    return found || "Outros";
  }
}
