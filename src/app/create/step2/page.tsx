"use client";

import Step2Form from "@/components/Step2Form";

export default function Step2Page() {
  return (
    <main className="min-h-screen p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">웹툰 만들기 - Step 2</h1>
      <Step2Form />
    </main>
  );
}

