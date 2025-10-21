export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-bold text-cyan-300 mb-4">
        Hello WeatherFlow
      </h1>
      <p className="text-slate-300 text-center max-w-md">
        Minimal, elegant, city-first weather app with optional map browse mode.
      </p>
    </main>
  );
}
