import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, Brain, FileImage } from "lucide-react";
import DoctorDashboard from "../components/DoctorDashboardLayout.jsx";

export default function BrainTumorDetection() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Use Vite env variable if provided, otherwise default to localhost:4000
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const PREDICT_URL = `${API_BASE.replace(/\/$/, "")}/predict`;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG/JPG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum allowed is 10MB.");
      return;
    }

    // Image preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("file", file);

    // AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s

    try {
      const res = await fetch(PREDICT_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        // IMPORTANT: do not set Content-Type for FormData (browser sets multipart automatically)
      });

      clearTimeout(timeout);

      // Try to extract useful error details
      if (!res.ok) {
        let text;
        try {
          const json = await res.json();
          text = json.error || JSON.stringify(json);
        } catch {
          text = await res.text();
        }
        throw new Error(`Server error ${res.status}: ${text || res.statusText}`);
      }

      // parse JSON response
      const data = await res.json();

      // Expect { label: "...", confidence: 92.3 } — validate shape
      if (!data || typeof data.label !== "string") {
        throw new Error("Unexpected response from server");
      }

      setPrediction({
        label: data.label,
        confidence: typeof data.confidence === "number" ? data.confidence : Number(data.confidence) || 0,
      });
    } catch (err) {
      // Distinguish abort (timeout) vs network vs server errors
      if (err.name === "AbortError") {
        setError("Request timed out. The server may be busy; try again.");
      } else if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        setError("Unable to reach the server. Ensure the backend is running and CORS allows this origin.");
      } else {
        setError(err.message || "Prediction failed");
      }
      console.error("Prediction error:", err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <DoctorDashboard>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-8 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Brain Tumor Detection</h1>
            </div>
            <p className="text-teal-50 text-lg">Upload an MRI scan for AI-powered analysis</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-teal-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Upload MRI Scan</h2>
              </div>

              <label className="block cursor-pointer" htmlFor="file-input">
                <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/50 transition-all">
                  {preview ? (
                    <div className="space-y-3">
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                      <p className="text-sm text-teal-600 font-medium">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <FileImage className="w-8 h-8 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Click to upload MRI image</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />

              {loading && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-blue-700 font-medium">Analyzing scan...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
              </div>

              {!prediction && !error && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Brain className="w-16 h-16 mb-3 opacity-30" />
                  <p className="text-center">Upload an MRI scan to see results</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-semibold">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                      <p className="text-xs text-gray-500 mt-1">Backend: {PREDICT_URL}</p>
                    </div>
                  </div>
                </div>
              )}

              {prediction && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-6 text-white">
                    <p className="text-sm font-medium text-teal-50 mb-2">Diagnosis</p>
                    <h3 className="text-2xl font-bold mb-3">{prediction.label}</h3>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-lg font-bold">{prediction.confidence}%</span>
                      </div>
                      <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-1000"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-amber-900 font-semibold text-sm">Medical Disclaimer</p>
                        <p className="text-amber-800 text-sm mt-1">
                          This is an AI-assisted tool. Always consult with qualified medical professionals for diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorDashboard>
  );
}