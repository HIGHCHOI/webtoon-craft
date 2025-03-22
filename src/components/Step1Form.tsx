"use client";  // 이 줄을 추가하면 클라이언트 컴포넌트로 동작

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const genres = ['로맨스', '판타지', '공포', '코미디', '액션', 'SF', '일상'];

export default function Step1Form() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [characters, setCharacters] = useState([{ name: '', description: '' }]);
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGenre || characters.length === 0 || !keyword.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const formData = {
      genre: selectedGenre,
      characters: characters.filter((c) => c.name && c.description),
      keyword,
    };

    // 세션스토리지에 저장
    sessionStorage.setItem('step1Data', JSON.stringify(formData));

    // Step2 페이지로 이동
    router.push('/create/step2');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 text-gray-900">
      {/* 장르 선택 */}
      <div>
        <label className="block text-lg font-semibold mb-2">장르 선택</label>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`px-4 py-2 rounded-full border transition ${
                selectedGenre === genre
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-900 border-gray-400 hover:border-blue-500'
              }`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 등장인물 입력 */}
      <div>
        <label className="block text-lg font-semibold mb-2">등장인물 (최소 1명)</label>
        {characters.map((char, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="이름"
              className="w-1/3 px-3 py-2 border border-gray-400 rounded text-gray-900"
              value={char.name}
              onChange={(e) => {
                const updated = [...characters];
                updated[index].name = e.target.value;
                setCharacters(updated);
              }}
            />
            <input
              type="text"
              placeholder="설명 (ex: 시간여행자 여고생)"
              className="w-2/3 px-3 py-2 border border-gray-400 rounded text-gray-900"
              value={char.description}
              onChange={(e) => {
                const updated = [...characters];
                updated[index].description = e.target.value;
                setCharacters(updated);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-blue-700 text-sm mt-1 hover:underline"
          onClick={() => setCharacters([...characters, { name: '', description: '' }])}
        >
          + 인물 추가
        </button>
      </div>

      {/* 키워드/시작 문장 */}
      <div>
        <label className="block text-lg font-semibold mb-2">키워드 또는 시작 문장</label>
        <input
          type="text"
          placeholder="예: '비 오는 날, 우산을 같이 썼다.'"
          className="w-full px-3 py-2 border border-gray-400 rounded text-gray-900"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition"
        >
          다음 단계로 →
        </button>
      </div>
    </form>
  );
}
