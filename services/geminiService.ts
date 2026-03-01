import { GoogleGenAI } from "@google/genai";

// Access API key from Vite's import.meta.env or process.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) || 
                '';
const ai = new GoogleGenAI({ apiKey });

export const refineMeetingNote = async (rawText: string, section: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key missing, returning raw text");
    return rawText;
  }

  try {
    const prompt = `
      Tu es un assistant expert en Lean Management et HSE.
      Reformule la note suivante prise rapidement lors d'une réunion terrain.
      La note concerne la section: "${section}".
      Rends-la claire, professionnelle, et actionnable.
      Corrige les fautes. Garde-la concise (1 phrase si possible).
      
      Note brute: "${rawText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || rawText;
  } catch (error) {
    console.error("Gemini refinement failed:", error);
    return rawText;
  }
};

export const analyzeRisk = async (description: string): Promise<{ riskLevel: string; suggestion: string }> => {
  if (!apiKey) return { riskLevel: 'Inconnu', suggestion: 'Vérifier manuellement' };

  try {
     const prompt = `
      Analyse ce problème signalé sur un site industriel : "${description}".
      1. Détermine le niveau de risque (Faible, Moyen, Élevé, Critique).
      2. Suggère une action immédiate de sécurisation en moins de 10 mots.
      Réponds au format JSON uniquement : { "riskLevel": "...", "suggestion": "..." }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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