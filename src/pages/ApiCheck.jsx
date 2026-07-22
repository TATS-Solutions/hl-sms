import { useState } from "react";
import { fetchServices } from "../api/services";

export default function ApiCheck() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runCheck = async () => {
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const response = await fetchServices();
      setResult(response.data);
      setStatus("success");
    } catch (err) {
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        API Connection Check
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Calls GET {import.meta.env.VITE_API_URL}/services and shows the raw result. Temporary debug tool — remove before production.
      </p>

      <button
        onClick={runCheck}
        className="bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors mb-6"
      >
        {status === "loading" ? "Checking..." : "Run Check"}
      </button>

      {status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-semibold text-sm mb-2">✓ Connected successfully</p>
          <pre className="text-xs bg-white border border-green-200 rounded-lg p-3 overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold text-sm mb-2">✗ Connection failed</p>
          <pre className="text-xs bg-white border border-red-200 rounded-lg p-3 overflow-auto max-h-96">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}