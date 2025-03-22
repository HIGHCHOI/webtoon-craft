// src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
        WebtoonCraft.ai
      </h1>
      <p className="text-lg text-center text-gray-600 max-w-xl">
        당신의 아이디어로 웹툰을 만들어보세요. 장르, 인물, 상황만 입력하면 AI가 자동으로 웹툰을 만들어드립니다.
      </p>
    </main>
  );
}
