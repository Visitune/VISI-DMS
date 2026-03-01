import { GoogleGenAI } from "@google/genai";

// Get API key from localStorage or environment variable
const getApiKey = (): string => {
  // First check localStorage (user entered in settings)
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) return storedKey;
  
  // Then check environment variable
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Lazy initialization of AI client
const getAi = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const refineMeetingNote = async (rawText: string, section: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API Key missing - Gemini features disabled. Add your API key in Settings.");
    return rawText;
  }

  try {
    const ai = getAi();
    if (!ai) return rawText;

    const prompt = `
      Tu es un assistant expert en Lean Management et HSE.
      Reformule la note suivante prise rapidement lors d'une réunion terrain.
      La note concerne la section: "${section}".
      Rends-la claire, professionnelle, et actionnable.
      Corrige les fautes. Garde-la concise (1 phrase si possible).
      
      Note brute: "${rawText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text?.trim() || rawText;
  } catch (error) {
    console.error("Gemini refinement failed:", error);
    return rawText;
  }
};

export const analyzeRisk = async (description: string): Promise<{ riskLevel: string; suggestion: string }> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { riskLevel: 'Inconnu', suggestion: 'Ajoutez une clé API dans Paramètres' };
  }

  try {
    const ai = getAi();
    if (!ai) return { riskLevel: 'Inconnu', suggestion: 'API non configurée' };

    const prompt = `
      Analyse ce problème signalé sur un site industriel : "${description}".
      1. Détermine le niveau de risque (Faible, Moyen, Élevé, Critique).
      2. Suggère une action immédiate de sécurisation en moins de 10 mots.
      Réponds au format JSON uniquement : { "riskLevel": "...", "suggestion": "..." }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    return { riskLevel: 'Erreur', suggestion: 'Analyse échouée' };
  } catch (error) {
    return { riskLevel: 'Erreur', suggestion: 'Erreur de service' };
  }
};

// Function to save API key to localStorage
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem('gemini_api_key', apiKey);
};

// Function to check if API key is configured
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};
