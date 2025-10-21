export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-300 mb-4">404</h1>
        <p className="text-slate-400 mb-6">This page could not be found.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
