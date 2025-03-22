import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log("🟡 OpenRouter API Key 상태:", apiKey ? "OK" : "Missing");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.com", // 실제 도메인으로 수정하세요
        "X-Title": "Webtoon Generator",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          {
            role: "system",
            content: "당신은 웹툰 대사 및 장면 묘사를 JSON 형식 또는 문장으로 생성하는 AI입니다.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const raw = await response.text();
    console.log("🟢 OpenRouter 응답 원문:\n", raw);

    if (!response.ok) {
      return NextResponse.json({ error: "OpenRouter 호출 실패", detail: raw }, { status: 500 });
    }

    const data = JSON.parse(raw);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "AI 응답이 없습니다" }, { status: 500 });
    }

    // ✅ 1. JSON이면 줄거리 + 대사 생성용
    try {
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");
      const cleanContent = content.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(cleanContent);

      return NextResponse.json({ result: parsed });
    } catch (e) {
      // ✅ 2. JSON 파싱 실패 시: 장면 묘사 프롬프트 리턴용
      return NextResponse.json({ result: content.trim() });
    }
  } catch (error) {
    console.error("❌ 처리 중 오류:", error);
    return NextResponse.json({ error: "서버 오류", detail: String(error) }, { status: 500 });
  }
}

