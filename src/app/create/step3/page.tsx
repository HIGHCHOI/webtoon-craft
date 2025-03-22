"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Dialogue {
  speaker: string;
  line: string;
}

interface Story {
  title: string;
  story: string;
  dialogues: Dialogue[];
}

export default function Step3Page() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("step1Data");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      generateStory(parsedData);
    } else {
      router.push("/create");
    }
  }, [router]);

  const generateStory = async (data: any) => {
    try {
      const response = await fetch("/api/generateText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(data) }),
      });

      const result = await response.json();

      if (
        result.result &&
        result.result.title &&
        result.result.story &&
        Array.isArray(result.result.dialogues)
      ) {
        setStory(result.result);

        const fullData = { ...data, story: result.result };
        sessionStorage.setItem("step1Data", JSON.stringify(fullData));
      } else {
        setStory({
          title: "줄거리 생성 실패",
          story: "AI가 올바른 결과를 반환하지 않았습니다.",
          dialogues: [],
        });
      }
    } catch (error) {
      console.error("줄거리 생성 중 오류:", error);
      setStory({
        title: "줄거리 생성 실패",
        story: "AI가 올바른 결과를 반환하지 않았습니다.",
        dialogues: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buildPrompt = (data: any) => {
    const cutCount = data.cutCount;
    const cutNumber = cutCount === "4컷" ? 4 : cutCount === "8컷" ? 8 : 12;
  
    return `당신은 웹툰 시나리오를 작성하는 AI입니다. 아래 정보를 바탕으로 JSON 형식으로 출력하세요.
  
  조건:
  - JSON 형식 (title, story, dialogues 포함)
  - story는 총 ${cutNumber}개의 컷에 맞게 ${cutNumber}개의 문장 이상으로 구성
  - dialogues는 총 10개의 대사 포함 (speaker와 line 형태)
  - 설명이나 마크다운 없이 순수 JSON만 출력
  
  입력:
  장르: ${data.genre}
  등장인물: ${data.characters.map((c: any) => `${c.name}(${c.description})`).join(", ")}
  키워드: ${data.keyword}
  배경 설정: ${data.background}
  컷 수: ${data.cutCount}
  
  형식 예시:
  {
    "title": "웹툰 제목",
    "story": "장면1. ... 장면2. ... 장면3. ... (총 ${cutNumber}문장 이상)",
    "dialogues": [
      { "speaker": "이름", "line": "대사 내용" },
      ...
    ]
  }`;
  };  

  return (
    <main className="min-h-screen p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">웹툰 생성 중...</h1>

      {isLoading || !story ? (
        <p className="text-lg text-gray-600">AI가 웹툰 줄거리와 대사를 생성하는 중...</p>
      ) : (
        <div className="mt-6 p-4 bg-gray-100 rounded border text-sm w-full max-w-lg text-gray-800">
          <h2 className="text-xl font-semibold text-gray-900">📖 생성된 웹툰</h2>
          <p className="mt-2 text-gray-900">
            <span className="font-bold">제목:</span> {story.title}
          </p>
          <p className="mt-1 text-gray-800">
            <span className="font-bold">줄거리:</span> {story.story}
          </p>

          <h3 className="text-lg font-semibold mt-4 text-gray-900">💬 주요 대사</h3>
          <ul className="list-disc pl-5">
            {story.dialogues.map((dialogue, index) => (
              <li key={index} className="mt-1">
                <span className="font-medium text-gray-900">{dialogue.speaker}:</span>{" "}
                {dialogue.line}
              </li>
            ))}
          </ul>

          <button
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            onClick={() => router.push("/create/result")}
          >
            결과 보기 →
          </button>
        </div>
      )}
    </main>
  );
}



