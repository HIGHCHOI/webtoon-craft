import Step1Form from '@/components/Step1Form';

export default function CreatePage() {
  return (
    <main className="min-h-screen p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">웹툰 만들기 - Step 1</h1>
      <Step1Form />
    </main>
  );
}
