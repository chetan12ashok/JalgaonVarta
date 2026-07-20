"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">काहीतरी चुकले!</h2>
        <p className="text-gray-500 text-sm mb-4">{error.message}</p>
        <button onClick={reset} className="px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-black">
          पुन्हा प्रयत्न करा
        </button>
      </div>
    </div>
  );
}
