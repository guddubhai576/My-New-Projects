import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse large JSON requests (for image base64)
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, useSearch, modelLevel } = req.body;
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      let modelName = "gemini-3.5-flash"; // Default
      if (modelLevel === "complex") {
        modelName = "gemini-3.1-pro-preview";
      } else if (modelLevel === "fast") {
        modelName = "gemini-3.1-flash-lite";
      }

      const config: any = {
        systemInstruction: "You are a helpful, intelligent assistant integrated into Vision Identifier.",
      };

      if (useSearch && (modelName === "gemini-3.5-flash" || modelName === "gemini-3.1-pro-preview")) {
        config.tools = [{ googleSearch: {} }];
      }

      const chat = ai.chats.create({
        model: modelName,
        history: history || [],
        config
      });

      const response = await chat.sendMessage({ message });
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const searchChunks = groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web) || [];

      res.json({
        text: response.text,
        searchChunks
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Analyze Image Endpoint
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt } = req.body;
      
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      };

      const textPart = {
        text: prompt || "Analyze this image and describe what you see in detail. If it's a specific object, identify it.",
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: { parts: [imagePart, textPart] },
        });
      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("quota")) {
          console.warn("Quota exceeded for gemini-3.1-pro-preview, falling back to gemini-3.5-flash");
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: [imagePart, textPart] },
          });
        } else {
          throw err;
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Image analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
