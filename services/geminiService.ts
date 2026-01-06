import { GoogleGenAI } from "@google/genai";
import { P2PQuakeEvent } from '../types';
import { getShindoLabel, getTsunamiLabel } from '../constants';

const API_KEY = process.env.API_KEY || '';

export const analyzeEarthquakeWithGemini = async (quake: P2PQuakeEvent): Promise<string> => {
  if (!API_KEY) {
    return "APIキーが設定されていないため、AI解説を利用できません。";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const scaleLabel = getShindoLabel(quake.earthquake.maxScale);
    const tsunamiInfo = getTsunamiLabel(quake.earthquake.domesticTsunami);
    const location = quake.earthquake.hypocenter.name;
    const magnitude = quake.earthquake.hypocenter.magnitude;
    const depth = quake.earthquake.hypocenter.depth;
    const time = quake.earthquake.time;

    const prompt = `
      あなたは防災と地震学の専門家です。以下の日本の地震情報をもとに、簡潔で分かりやすい一般市民向けの解説と安全アドバイスを作成してください。
      
      【地震情報】
      - 発生時刻: ${time}
      - 震源地: ${location}
      - マグニチュード: M${magnitude === -1 ? '不明' : magnitude}
      - 深さ: ${depth === -1 ? '不明' : depth + 'km'}
      - 最大震度: 震度${scaleLabel}
      - 津波の有無: ${tsunamiInfo}

      【出力フォーマット】
      以下の構成で、HTMLタグを使わずにプレーンテキストで出力してください。Markdownは使用可能です。
      
      1. **概況**: 地震の規模と揺れの強さについての簡潔なまとめ。
      2. **影響と注意点**: 震源の深さや規模から考えられる揺れの特徴や、余震の可能性について。
      3. **防災アドバイス**: この規模の地震が発生した直後に市民が取るべき行動（津波情報に基づく避難の必要性など）。
      
      文字数は全体で300文字程度にまとめてください。パニックを避け、冷静な行動を促すトーンでお願いします。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "AIからの応答がありませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI解析中にエラーが発生しました。しばらく待ってから再試行してください。";
  }
};