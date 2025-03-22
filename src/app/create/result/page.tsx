"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("step1Data");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setFormData(parsed);

      const cutCount = parsed.cutCount === "4컷" ? 4 : parsed.cutCount === "8컷" ? 8 : 12;
      const rawStory = parsed.story?.story;

      let cuts: string[] = [];

      if (typeof rawStory === "string") {
        cuts = splitStoryIntoCuts(rawStory, cutCount);
      } else if (Array.isArray(rawStory)) {
        cuts = rawStory.slice(0, cutCount);
      } else {
        console.warn("❗ storyText가 문자열도 배열도 아닙니다:", rawStory);
        return;
      }

      setLoadingImage(true);
      generateImages(cuts).then((urls) => {
        setImageUrls(urls);
        setLoadingImage(false);
      });
    } else {
      router.push("/create");
    }
  }, [router]);

  function splitStoryIntoCuts(storyText: string, count: number): string[] {
    const sentences = storyText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    while (sentences.length < count) {
      sentences.push("장면을 더 추가해 주세요.");
    }

    return sentences.slice(0, count);
  }

  async function buildPromptForImage(sceneDescription: string): Promise<string> {
    try {
      const res = await fetch("/api/rewritePrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene: sceneDescription }),
      });
  
      const data = await res.json();
  
      if (data.result) {
        return data.result;
      } else {
        console.warn("⚠️ rewritePrompt API 응답이 없음:", data);
        return sceneDescription;
      }
    } catch (err) {
      console.error("❌ rewritePrompt 호출 실패:", err);
      return sceneDescription;
    }
  }  

  async function generateImages(cuts: string[]): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const cut of cuts) {
      const prompt = await buildPromptForImage(cut);
      console.log("🟡 최종 프롬프트:", prompt);

      try {
        const res = await fetch("/api/generateImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        if (data.image) {
          imageUrls.push(data.image);
        } else {
          console.warn("⚠️ 이미지 생성 실패 응답:", data);
          imageUrls.push("");
        }
      } catch (err) {
        console.error("❌ 이미지 생성 중 오류:", err);
        imageUrls.push("");
      }
    }

    return imageUrls;
  }

  if (!formData) {
    return <p className="text-center mt-10">데이터를 불러오는 중...</p>;
  }

  return (
    <main className="min-h-screen p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">웹툰 생성 완료!</h1>

      <div className="mt-6 p-4 bg-gray-100 rounded border w-full max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-900">📖 생성된 웹툰</h2>
        <p className="mt-2 font-bold">제목: {formData.story?.title || "제목 없음"}</p>
        <p className="mt-2 text-gray-800">줄거리: {Array.isArray(formData.story?.story) ? formData.story.story.join(" ") : formData.story?.story || "줄거리 없음"}</p>

        <h3 className="text-lg font-semibold mt-4">💬 주요 대사</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {(formData.story?.dialogues || []).map((dialogue: any, index: number) => (
            <li key={index} className="mt-1">
              <span className="font-semibold">{dialogue.speaker}:</span> {dialogue.line}
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mt-6">🖼️ AI 생성 이미지</h3>
        {loadingImage ? (
          <p className="text-gray-600 mt-2">이미지를 생성 중입니다...</p>
        ) : imageUrls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {imageUrls.map((url, idx) => (
              url ? (
                <div key={idx}>
                  <p className="mb-1 text-sm text-gray-700 font-medium">컷 {idx + 1}</p>
                  <img src={url} alt={`컷 ${idx + 1}`} className="rounded border" />
                </div>
              ) : (
                <div key={idx} className="p-4 border rounded text-gray-500 text-center">
                  컷 {idx + 1} 이미지 생성 실패
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">이미지를 불러올 수 없습니다.</p>
        )}

        <button
          className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/")}
        >
          홈으로 돌아가기
        </button>
      </div>
    </main>
  );
}




