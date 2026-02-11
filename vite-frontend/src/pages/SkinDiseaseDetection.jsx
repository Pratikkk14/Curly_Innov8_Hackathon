import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, Scan, FileImage } from "lucide-react";
import DoctorDashboard from "../components/DoctorDashboardLayout.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";

export default function SkinDiseaseDetection() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Image preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:4000/predict/skin", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Prediction failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Server not reachable or invalid response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-8 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Skin Disease Detection</h1>
            </div>
            <p className="text-teal-50 text-lg">Upload a skin image for AI-powered diagnosis</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-teal-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Upload Skin Image</h2>
              </div>

              <label className="block">
                <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-all">
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
                        <p className="text-gray-700 font-medium">Click to upload skin photo</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              {loading && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-blue-700 font-medium">Analyzing image...</p>
                  </div>
                </div>
              )}

              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-teal-800 text-sm">
                  <span className="font-semibold">💡 Tip:</span> For best results, ensure good lighting and capture a clear, close-up image of the affected area.
                </p>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Diagnosis Results</h2>
              </div>

              {!result && !error && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Scan className="w-16 h-16 mb-3 opacity-30" />
                  <p className="text-center">Upload a skin image to see results</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-semibold">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-6 text-white">
                    <p className="text-sm font-medium text-teal-50 mb-2">Detected Condition</p>
                    <h3 className="text-2xl font-bold mb-3">{result.label}</h3>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-lg font-bold">{result.confidence}%</span>
                      </div>
                      <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-1000"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-900 font-semibold text-sm mb-2">Next Steps</p>
                    <ul className="text-blue-800 text-sm space-y-1 ml-4 list-disc">
                      <li>Schedule an appointment with a dermatologist</li>
                      <li>Monitor any changes in the affected area</li>
                      <li>Avoid self-medication without professional advice</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-amber-900 font-semibold text-sm">Medical Disclaimer</p>
                        <p className="text-amber-800 text-sm mt-1">
                          This is an AI-assisted diagnostic tool. Always consult with a qualified dermatologist for accurate diagnosis and treatment.
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
    </DashboardLayout>
  );
}