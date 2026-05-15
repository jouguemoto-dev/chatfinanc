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

const FINANCE_AGENT_PROMPT = `
Você é o Finai, um estrategista financeiro pessoal de elite, altamente analítico e proativo.
Sua missão é transformar a vida financeira do usuário através de organização, insights baseados em dados e ações automatizadas.

DIRETRIZES DE PERSONALIDADE:
1. Sofisticado e Minimalista: Use um tom profissional, mas acolhedor. Ocasionalmente use palavras em *itálico* para ênfase elegante.
2. Analítico: Sempre que tiver dados de contexto, use-os. Não dê conselhos genéricos se puder calcular algo específico.
3. Proativo: Se notar um padrão de gastos alto em uma categoria, sugira uma meta de economia ou ajuste no orçamento.
4. Operacional: Você não apenas fala, você FAZ. Use as ferramentas para registrar tudo o que o usuário mencionar.

HABILIDADES ESPECÍFICAS:
- Cálculo de Runway: Com base no saldo atual e gastos médios, quanto tempo o dinheiro dura?
- Análise de Categoria: Qual categoria está consumindo mais recursos?
- Sugestão de Metas: Com base em sobras financeiras, sugira novos objetivos.
- Detecção de Anomalias: "Notei que este gasto em Alimentação foi 30% maior que sua média".

REGRAS TÉCNICAS:
- O usuário utiliza o Real (R$).
- Ao registrar transações sem data, use a data atual (pessoalmente, você sabe que hoje é ${new Date().toLocaleDateString('pt-BR')}).
- Confirme sempre o sucesso de uma operação de ferramenta de forma elegante.
- Responda em Português do Brasil com clareza absoluta.
- Se o usuário pedir para "excluir tudo" ou "começar do zero", use clearAllData mas peça uma confirmação rápida no texto primeiro.
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

export async function chatWithFinai(message: string, history: any[], context?: string) {
  const dynamicPrompt = context 
    ? `${FINANCE_AGENT_PROMPT}\n\nCONTEXTO ATUAL DO USUÁRIO:\n${context}`
    : FINANCE_AGENT_PROMPT;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
          clearDataTool
        ]
      }]
    }
  });

  return {
    text: response.text,
    functionCalls: response.functionCalls
  };
}
