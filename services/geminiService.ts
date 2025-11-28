import { GoogleGenAI } from "@google/genai";
import { ScanResultDetail } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // Fail gracefully if key is missing, though strictly it should be there.
    // We throw here so the catch block in generateScanSummary handles it.
    throw new Error("API_KEY not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateScanSummary = async (
  totalScanned: number,
  updatedMaterials: ScanResultDetail[]
): Promise<{ summary: string; actionItems: Record<number, string> }> => {
  try {
    const ai = getClient();
    
    // If no updates, return generic response to save tokens/latency
    if (updatedMaterials.length === 0) {
      return {
        summary: `Scanned ${totalScanned} materials. No status changes detected. All certificates are within their current validity parameters.`,
        actionItems: {}
      };
    }

    const prompt = `
      You are the "Halal Audit Agent" for Hotel Seri Malaysia.
      You just performed a daily scan of ${totalScanned} raw materials.
      
      Here are the materials that changed status or require attention:
      ${JSON.stringify(updatedMaterials)}

      Task:
      1. Write a short, professional summary (2-3 sentences) describing the scan results, focusing on risks.
      2. For each material in the list, recommend a short specific action (e.g., "Contact supplier X immediately", "Schedule renewal").

      Return the result as a pure JSON object with this structure:
      {
        "summary": "string",
        "actionItems": {
           "material_id_as_string": "action string"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response from Gemini");
    }

    let result;
    try {
        result = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response", text);
        // Attempt to extract JSON from code block if model wrapped it
        const match = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
            try {
                result = JSON.parse(match[1]);
            } catch (e2) {
                throw new Error("Invalid JSON structure in response");
            }
        } else {
             throw new Error("Invalid JSON response from Gemini");
        }
    }
    
    // Normalize actionItems keys to numbers
    const actionItems: Record<number, string> = {};
    if (result.actionItems) {
        Object.entries(result.actionItems).forEach(([key, value]) => {
            const numericKey = Number(key);
            if (!isNaN(numericKey)) {
                actionItems[numericKey] = String(value);
            }
        });
    }

    return {
        summary: result.summary || `Scan completed. ${updatedMaterials.length} items updated.`,
        actionItems
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if AI fails so the app continues working
    return {
        summary: `Scanned ${totalScanned} materials. Found ${updatedMaterials.length} status updates. (AI Analysis unavailable: ${error instanceof Error ? error.message : 'Unknown error'})`,
        actionItems: {}
    };
  }
};