"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const backgrounds = ["도시", "학교", "우주선", "중세 성", "숲속"];
const cutOptions = ["4컷", "8컷", "12컷 이상"];

export default function Step2Form() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>("");
  const [selectedCut, setSelectedCut] = useState<string>("");

  useEffect(() => {
    // Step1에서 입력한 데이터 불러오기
    const storedData = sessionStorage.getItem("step1Data");
    if (storedData) {
      setFormData(JSON.parse(storedData));
    } else {
      // Step1 입력 없이 직접 접근하면 돌아가기
      router.push("/create");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBackground || !selectedCut) {
      alert("배경과 컷 수를 선택해주세요.");
      return;
    }

    const fullData = {
      ...formData,
      background: selectedBackground,
      cutCount: selectedCut,
    };

    sessionStorage.setItem("step1Data", JSON.stringify(fullData));

    // Step3로 이동
    router.push("/create/step3");
  };

  if (!formData) {
    return <p className="text-center mt-10">데이터를 불러오는 중...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 text-gray-900">
      {/* 배경 선택 */}
      <div>
        <label className="block text-lg font-semibold mb-2">배경 선택</label>
        <div className="flex flex-wrap gap-3">
          {backgrounds.map((bg) => (
            <button
              key={bg}
              type="button"
              className={`px-4 py-2 rounded-full border transition ${
                selectedBackground === bg
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-900 border-gray-400 hover:border-blue-500"
              }`}
              onClick={() => setSelectedBackground(bg)}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* 컷 수 선택 */}
      <div>
        <label className="block text-lg font-semibold mb-2">컷 수 선택</label>
        <div className="flex flex-wrap gap-3">
          {cutOptions.map((cut) => (
            <button
              key={cut}
              type="button"
              className={`px-4 py-2 rounded-full border transition ${
                selectedCut === cut
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-900 border-gray-400 hover:border-blue-500"
              }`}
              onClick={() => setSelectedCut(cut)}
            >
              {cut}
            </button>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition"
        >
          웹툰 생성하기 →
        </button>
      </div>
    </form>
  );
}
