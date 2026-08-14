import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير متوفر في متغيرات البيئة.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

/**
 * Text-to-Speech API using gemini-3.1-flash-tts-preview
 */
app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      regionName = "النجدية (الوسطى)",
      regionCode = "najdi",
      gender = "female",
      voiceName = "Kore", // Kore, Zephyr, Aoede, Fenrir, Charon, Puck
      tone = "طبيعي وودود",
      emotion = "فرح وترحاب",
      speed = 1.0,
      pitch = "عادي",
      includePhonetics = true,
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "يرجى إدخال النص المراد تحويله إلى كلام." });
    }

    const ai = getGenAI();

    // Construct directive instructions for the Saudi TTS model
    let dialectGuidance = "";
    switch (regionCode) {
      case "najdi":
        dialectGuidance = "اللهجة النجدية السعودية الأصيلة (منطقة الرياض والقصيم وحائل)، بنطق مخارج الحروف النجدية السليمة مثل الكاف والقاف والضاد والتسكين المميز.";
        break;
      case "hijazi":
        dialectGuidance = "اللهجة الحجازية السعودية العريقة (مكة المكرمة وجدة والمدينة المنورة)، بنبرة حجازية دافئة ومخارج ناعمة وإيقاع حجازي أصيل.";
        break;
      case "eastern":
        dialectGuidance = "اللهجة الشرقاوية الحساوية السعودية (الدمام والخبر والأحساء والقطيف)، بنغمة خليجية شرقية مميزة ودافئة.";
        break;
      case "southern":
        dialectGuidance = "اللهجة الجنوبية السعودية الأصيلة (عسير وأبها وجازان ونجران)، بنبرة جبلية فصيحة ومخارج قوية وحفاوة جنوبية مشهورة.";
        break;
      case "northern":
        dialectGuidance = "اللهجة الشمالية السعودية (تبوك وعرعر والجوف)، بنطق بدوي أصيل وكرم ونبرة جزلة.";
        break;
      case "fusha_saudi":
      default:
        dialectGuidance = "اللغة العربية الفصحى المعاصرة بنبرة وإلقاء سعودي فخم ومخارج متقنة تليق بالإعلانات والوثائقيات.";
        break;
    }

    // Build the contextual instruction wrapper for TTS
    let speedInstruction = "";
    if (speed < 0.9) speedInstruction = "تحدث بتمهل وهدوء وتأنٍ واسترخاء.";
    else if (speed > 1.15) speedInstruction = "تحدث بإيقاع سريع وحيوي ونشط.";

    const ttsPrompt = `اقرأ النص التالي بالصوت المختار بنطق سعودي متقن.
التوجيه الصوتي:
- اللهجة المستهدفة: ${dialectGuidance}
- النبرة: ${tone}
- المشاعر والتعبير العاطفي: ${emotion}
- حدة الصوت: ${pitch}
${speedInstruction}
- التزم بنطق الكلمات بتنغيم طبيعي غير آلي ومطابق للمشاعر المطلوبة.

النص:
${text.trim()}`;

    // Call gemini-3.1-flash-tts-preview
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: ttsPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (!base64Audio) {
      return res.status(500).json({
        error: "لم يتم استلام بيانات صوتية من النموذج. يرجى المحاولة مرة أخرى.",
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      sampleRate: 24000,
      meta: {
        regionName,
        regionCode,
        voiceName,
        gender,
        tone,
        emotion,
        speed,
        textLength: text.length,
      },
    });
  } catch (error: any) {
    console.error("TTS API Error:", error);
    return res.status(500).json({
      error: error?.message || "حدث خطأ أثناء معالجة الصوت في الخادم.",
    });
  }
});

/**
 * Intelligent Saudi Dialect Adaptation & Refinement API
 * Converts Standard Arabic or general text into authentic Saudi dialect vocabulary
 */
app.post("/api/adapt-dialect", async (req, res) => {
  try {
    const { text, targetRegion = "najdi" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "النص مطلوب للتحويل." });
    }

    const ai = getGenAI();

    let regionDetails = "";
    switch (targetRegion) {
      case "najdi":
        regionDetails = "اللهجة النجدية (الوسطى، الرياض، القصيم، حائل). استبدل الكلمات بعبارات نجدية شائعة مثل: (وش لونك، وش عندك، أبشر بعزك، ما قصرت، ياحبي لك، ودك، سمّ، طال عمرك، زين، وراه، كذا).";
        break;
      case "hijazi":
        regionDetails = "اللهجة الحجازية (مكة، جدة، المدينة، الطائف). استبدل الكلمات بعبارات حجازية دافئة مثل: (ايش بك، كيفك يا غالي، دحين، يا سيدي، من عيوني، تمام، ما عليك، أهلاً وسهلاً، قوام).";
        break;
      case "eastern":
        regionDetails = "اللهجة الشرقاوية / الحساوية (الدمام، الأحساء، القطيف). استبدل بعبارات شرقية محببة مثل: (شخبارك، شحوالك، عساك بخير، چان، هالحزة، بعد قلبي، وايد/واجد، خوش).";
        break;
      case "southern":
        regionDetails = "اللهجة الجنوبية (أبها، عسير، جازان، نجران). استبدل بعبارات جنوبية أصيلة مثل: (وش علمك، مرحباً ألوف، أرحبوا، جعله عوافي، يا مرحبا ترحيبة السيل، هيد، علمني).";
        break;
      case "northern":
        regionDetails = "اللهجة الشمالية (تبوك، عرعر، الجوف). استبدل بعبارات شمالية مثل: (وش نوحك، يا بعد حيي، يا هلا ومسهلا، وش سالفتك، على خشمي، حياك الله).";
        break;
      default:
        regionDetails = "اللهجة السعودية المعاصرة المفهومة والراقية.";
        break;
    }

    const prompt = `أنت خبير لغوي متخصص في اللهجات السعودية الأصيلة.
المهمة: أعد صياغة النص التالي ليكون مكتوباً بـ ${regionDetails}.
حافظ على المعنى الأصلي تماماً، واجعله يبدو عفوياً وطبيعياً جداً ومشكولاً بالشكل الخفيف لتسهيل النطق الصحيح.

أعطني النتيجة بتنسيق JSON فقط بالشكل التالي:
{
  "adaptedText": "النص المحوّل والمشكول للهجة المستهدفة",
  "explanation": "شرح موجز جداً للتغييرات وأبرز المفردات المستخدمة",
  "keyVocabulary": ["مفردة 1 مع معناها", "مفردة 2 مع معناها"]
}

النص الأصلي:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawJson = response.text || "{}";
    const parsed = JSON.parse(rawJson);

    return res.json({
      success: true,
      originalText: text,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Dialect Adapt API Error:", error);
    return res.status(500).json({
      error: error?.message || "فشل تكييف النص مع اللهجة.",
    });
  }
});

async function startServer() {
  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`صوت السعودية Server running at http://localhost:${PORT}`);
  });
}

startServer();
