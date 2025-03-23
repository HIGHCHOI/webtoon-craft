import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log("🟡 OpenRouter API Key 상태:", apiKey ? "OK" : "MISSING");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.com",
        "X-Title": "Webtoon Generator",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that generates ONLY clean JSON. Do NOT use markdown, LaTeX, boxed, or any extra formatting. Return only the JSON object with fields: title, story (array or string), and dialogues (array of objects).",
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

    try {
      // 응답 문자열에서 JSON 추출
      let cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\\boxed{/g, "")
        .replace(/\\n/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\{/g, "{")
        .replace(/\\}/g, "}")
        .trim();

      const firstJsonStart = cleaned.indexOf("{");
      const firstJsonEnd = cleaned.lastIndexOf("}") + 1;
      const pureJson = cleaned.slice(firstJsonStart, firstJsonEnd);

      const parsed = JSON.parse(pureJson);
      return NextResponse.json({ result: parsed });
    } catch (e) {
      console.error("❌ JSON 파싱 실패:", e);
      return NextResponse.json({
        result: {
          title: "줄거리 생성 실패",
          story: "AI가 올바른 JSON을 반환하지 않았습니다.",
          dialogues: [],
        },
      });
    }
  } catch (error) {
    console.error("❌ 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류", detail: String(error) }, { status: 500 });
  }
}
