import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 font-marathi">पान सापडले नाही</h2>
        <Link href="/" className="px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-black inline-block mt-4">
          मुख्यपृष्ठावर जा
        </Link>
      </div>
    </div>
  );
}
