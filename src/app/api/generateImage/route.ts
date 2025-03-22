import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  const { prompt } = await req.json();
  console.log("🟡 받은 줄거리:", prompt);

  const refinedPrompt = buildImagePrompt(prompt);
  console.log("🟢 생성된 이미지 프롬프트:", refinedPrompt);

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: refinedPrompt,
      }),
    });

    if (response.status === 503) {
      return NextResponse.json({ error: "Hugging Face 서버가 일시적으로 사용 불가능합니다. 나중에 다시 시도해주세요." }, { status: 503 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 이미지 생성 실패:", errorText);
      return NextResponse.json({ error: "이미지 생성 실패", details: errorText }, { status: response.status });
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: imageUrl });
  } catch (error) {
    console.error("❌ 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류 발생", details: String(error) }, { status: 500 });
  }
}

// ✅ 줄거리로부터 구체적인 이미지 프롬프트를 생성하는 함수
function buildImagePrompt(storyText: string): string {
  // 아주 단순한 키워드 추출 및 보강 예시
  // 나중에 NLP 기반 키워드 추출로 고도화 가능
  const keywords = extractKeywords(storyText);
  const prompt = `${keywords.join(", ")}, anime style, highly detailed, dramatic lighting, comic scene`;

  return prompt;
}

// ✅ 핵심 명사/구 표현을 간단히 추출하는 함수
function extractKeywords(text: string): string[] {
  const words = text.match(/\b[가-힣a-zA-Z]{2,}\b/g) || [];
  const stopwords = ["그리고", "하지만", "그녀는", "그는", "그러나", "어느 날", "모든"];
  const filtered = words.filter((w) => !stopwords.includes(w) && w.length >= 2);

  // 상위 5개 단어만 반환 (단순한 빈도 기준 아님)
  return filtered.slice(0, 5);
}
