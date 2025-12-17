export default function Splash({ onContinue }) {
  setTimeout(() => {
    onContinue();
  }, 1500);

  return (
    <div className="w-full h-screen flex items-center justify-center relative bg-[#021816]">
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-b from-[#063c38] via-[#042825] to-[#021816] opacity-60"></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#0fe9d2]/10 flex items-center justify-center shadow-[0_0_20px_#0fe9d280]">
          <span className="text-[#0fe9d2] text-4xl">💡</span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-[#e6fffa] tracking-wide">
          LumosPath
        </h1>
      </div>
    </div>
  );
}
