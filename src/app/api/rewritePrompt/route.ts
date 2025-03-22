import { NextResponse } from "next/server";
import nlp from "compromise"; // ✅ 자연어 처리 도구

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  const { scene } = await req.json();

  const prompt = `
다음 장면을 영어로 번역하고 이미지 생성을 위한 시각적 프롬프트로 바꿔줘. 
인물 외형, 분위기, 배경, 조명, 구도 등을 최대한 시네마틱하게 묘사해줘.

장면:
"${scene}"
`;

  try {
    // 1. OpenRouter 요청
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.com",
        "X-Title": "Webtoon Prompt Rewriter",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that transforms scene descriptions into vivid, visual prompts for image generation (e.g., Stable Diffusion).",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      return NextResponse.json({ error: "No description returned from OpenRouter" }, { status: 500 });
    }

    console.log("🟢 OpenRouter 응답:", description);

    // 2. POS 분석 기반 키워드 추출
    const compressedPrompt = extractKeywordsFromDescription(description);
    console.log("🟢 추출된 키워드 프롬프트:", compressedPrompt);

    return NextResponse.json({ result: compressedPrompt });
  } catch (err) {
    console.error("❌ rewritePrompt API 실패:", err);
    return NextResponse.json({ error: "Rewrite failed", detail: String(err) }, { status: 500 });
  }
}

// ✅ POS 기반 키워드 추출 함수
function extractKeywordsFromDescription(text: string): string {
  const doc = nlp(text);

  const nouns = doc.nouns().out("array");
  const adjectives = doc.adjectives().out("array");

  const keywords = [...new Set([...nouns, ...adjectives])]; // 중복 제거

  const styleWords = ["anime style", "highly detailed", "comic panel"];

  return [...keywords, ...styleWords].join(", ");
}
