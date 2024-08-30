import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as path from 'path';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';

export class GeminiApi {
  private genAi: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;

  constructor(geminiApiKey: string) {
    this.genAi = new GoogleGenerativeAI(geminiApiKey);
    this.fileManager = new GoogleAIFileManager(geminiApiKey);
  }

  async processImage(input: { mimeType: string; fileUri: string }) {
    const { mimeType, fileUri } = input;

    const model = this.genAi.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });

    try {
      const result = await model.generateContent([
        {
          fileData: {
            mimeType,
            fileUri,
          },
        },
        {
          text: 'Extraia o valor numérico do medidor presente na imagem a seguir. Retorne apenas o número, sem unidades ou outros caracteres.',
        },
      ]);

      return result.response.text();
    } catch (error) {
      throw new Error(error);
    }
  }

  async uploadFile(input: {
    fileBuffer: Buffer;
    originalname: string;
    mimeType: string;
  }) {
    const { fileBuffer, originalname, mimeType } = input;

    const tempDir = mkdtempSync('./');
    const tempFilePath = path.join(tempDir, originalname);
    writeFileSync(tempFilePath, fileBuffer);

    try {
      const result = await this.fileManager.uploadFile(tempFilePath, {
        mimeType,
        displayName: originalname,
      });

      rmSync(tempFilePath, { recursive: true }); // Remove file after upload
      rmSync(tempDir, { recursive: true }); // Remove folder after upload

      return result;
    } catch (error) {
      rmSync(tempFilePath, { recursive: true }); // Remove file after upload
      rmSync(tempDir, { recursive: true }); // Remove folder after upload
      throw new Error(error);
    }
  }
}
