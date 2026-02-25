import { DB } from './db';
import { GoogleGenAI } from '@google/genai';

export class AIEngine {
  private genAI: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  async getStorageInsights() {
    const stats = DB.getStorageStats();
    const duplicates = DB.getDuplicateCandidates();
    
    // Rule-based reasoning (Offline)
    const insights = [
      `You have ${stats.length} drives indexed.`,
      `Found ${duplicates.length} potential duplicate groups based on file size.`,
    ];

    if (this.genAI) {
      // Online Mode: Advanced reasoning
      const model = this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this storage metadata: ${JSON.stringify({ stats, duplicates })}. 
        Provide a professional storage health report for a filmmaker. 
        Suggest which year's projects to archive and how much space can be recovered.`
      });
      const response = await model;
      return response.text;
    }

    return insights.join('\n');
  }
}
