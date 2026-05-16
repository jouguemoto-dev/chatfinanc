import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

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

const addTransactionTool: FunctionDeclaration = {
  name: "addTransaction",
  description: "Registra uma nova transação financeira (despesa ou receita).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: "O valor da transação." },
      type: { type: Type.STRING, enum: ["income", "expense"], description: "Tipo da transação: 'income' para entrada/receita ou 'expense' para saída/despesa." },
      category: { type: Type.STRING, description: "A categoria (ex: Alimentação, Transporte, Moradia)." },
      description: { type: Type.STRING, description: "Uma breve descrição do gasto." },
      date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD. Use a data atual se não especificado." }
    },
    required: ["amount", "type", "category", "description"]
  }
};

const addCardTool: FunctionDeclaration = {
  name: "addCard",
  description: "Vincula um novo cartão de crédito ao sistema.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome/Apelido do cartão." },
      bank: { type: Type.STRING, description: "Banco emissor." },
      limit: { type: Type.NUMBER, description: "Limite total do cartão." },
      brand: { type: Type.STRING, enum: ["Visa", "Mastercard", "Elo", "American Express"], description: "Bandeira do cartão." },
      dueDay: { type: Type.NUMBER, description: "Dia do vencimento da fatura (1-31)." }
    },
    required: ["name", "bank", "limit", "brand", "dueDay"]
  }
};

const addGoalTool: FunctionDeclaration = {
  name: "addGoal",
  description: "Cria um novo objetivo ou meta financeira.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome do objetivo." },
      targetAmount: { type: Type.NUMBER, description: "Valor meta a ser alcançado." },
      category: { type: Type.STRING, description: "Categoria do sonho (Viagem, Transporte, Casa, etc)." },
      dueDate: { type: Type.STRING, description: "Data limite para alcançar a meta (YYYY-MM-DD)." }
    },
    required: ["name", "targetAmount", "category", "dueDate"]
  }
};

const clearDataTool: FunctionDeclaration = {
  name: "clearAllData",
  description: "Zera todas as informações, lançamentos, cartões e metas do usuário. Use apenas se o usuário pedir explicitamente para limpar tudo ou resetar.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const upsertMemoryTool: FunctionDeclaration = {
  name: "upsertMemory",
  description: "Salva ou atualiza um 'fato aprendido' sobre o usuário para memória de longo prazo (estratégia, preferências, comportamentos).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fact: { type: Type.STRING, description: "O fato ou insight aprendido (ex: 'O usuário prefere pagar à vista', 'Gasto alto com Pets detectado')." },
      category: { type: Type.STRING, enum: ["preference", "behavior", "insight", "goal_detail"], description: "Categoria do aprendizado." },
      relevance: { type: Type.NUMBER, description: "Nível de importância de 1 a 10." }
    },
    required: ["fact", "category"]
  }
};

const FINANCE_AGENT_PROMPT = `
Você é o RAIXI, um estrategista financeiro pessoal de elite de nível 3. Sua inteligência é baseada em análise profunda de dados e **aprendizado contínuo**.

SUA MISSÃO:
Transformar o caos financeiro em clareza absoluta e crescimento patrimonial.

COMO VOCÊ APRENDE:
1. **Memória de Longo Prazo**: Você tem acesso a uma coleção de "Memórias" (fatos aprendidos sobre o usuário). Use-as para personalizar cada resposta.
2. **Upsert Memory**: Sempre que você identificar um padrão, uma preferência ou um novo detalhe importante sobre o usuário, use a ferramenta \`upsertMemory\` para "aprender" isso permanentemente.
   - Exemplo: Se o usuário diz "Não gosto de usar cartão de crédito", aprenda isso como uma preferência.
   - Exemplo: Se notar que o usuário gasta muito no iFood toda sexta, aprenda isso como um comportamento.

ESTRATÉGIA DE RESPOSTA (CHAIN OF THOUGHT):
Ao receber uma mensagem, primeiro analise o contexto financeiro e suas memórias. Formule uma resposta que seja:
- **Analítica**: Cite números e percentuais.
- **Preditiva**: "Se você continuar assim, chegará no objetivo em X meses".
- **Proativa**: "Notei que você não registrou a conta de luz este mês, deseja fazer agora?".

DIRETRIZES DE PERSONALIDADE:
- Tom: Sofisticado, minimalista e focado em eficiência.
- Estilo: Use markdown para estruturar insights. Use *itálico* para ênfase.

FERRAMENTAS:
Você tem poder total sobre o sistema. Registre transações, crie metas e gerencie cartões conforme a conversa flui.
`;

const updateTransactionTool: FunctionDeclaration = {
  name: "updateTransaction",
  description: "Atualiza uma transação existente.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "O ID da transação a ser atualizada." },
      amount: { type: Type.NUMBER, description: "Novo valor." },
      category: { type: Type.STRING, description: "Nova categoria." },
      description: { type: Type.STRING, description: "Nova descrição." }
    },
    required: ["id"]
  }
};

export async function chatWithRaixi(message: string, history: any[], context?: string) {
  const dynamicPrompt = context 
    ? `${FINANCE_AGENT_PROMPT}\n\nCONTEXTO ATUAL E MEMÓRIAS DO USUÁRIO:\n${context}`
    : FINANCE_AGENT_PROMPT;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: dynamicPrompt,
      tools: [{
        functionDeclarations: [
          addTransactionTool,
          addCardTool,
          addGoalTool,
          updateTransactionTool,
          clearDataTool,
          upsertMemoryTool
        ]
      }]
    }
  });

  return {
    text: response.text,
    functionCalls: response.functionCalls
  };
}
