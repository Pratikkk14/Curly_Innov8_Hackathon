import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  X,
  Bot,
  Loader2,
  HeartPulse,
  AlertTriangle,
} from "lucide-react";

import DashboardLayout from "/src/components/DashboardLayout.jsx";
import { getCustomerProfile, getAllDoctors } from "/src/services/api.js";

const URGENCY_THRESHOLD = 0.5;

const FLOW_STEPS = {
  SELECT: "select",
  RESULTS: "results",
  URGENT: "urgent",
};

const formatLabel = (text) =>
  text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const DoctorCard = ({ doctor }) => (
  <div className="bg-slate-50 p-4 rounded-lg border flex items-center justify-between">
    <div>
      <h4 className="font-bold text-slate-800">Dr. {doctor.name}</h4>
      <p className="text-xs text-emerald-700 font-medium">
        {doctor.specialization}
      </p>
    </div>
    <Link
      to="/customer/appointments"
      className="text-sm font-semibold text-emerald-600 hover:underline"
    >
      Book Now
    </Link>
  </div>
);

export default function SymptomChecker() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [allSymptoms, setAllSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const [flow, setFlow] = useState(FLOW_STEPS.SELECT);
  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [apiError, setApiError] = useState(null);

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [profileRes, doctorsRes, symptomsRes] = await Promise.all([
          getCustomerProfile(),
          getAllDoctors(),
          fetch("/bbn-api/symptoms"),
        ]);

        setUserProfile(profileRes.data);
        setDoctors(doctorsRes.data);

        const symptomData = await symptomsRes.json();
        setAllSymptoms(symptomData.symptoms || []);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  /* -------------------- AUTOCOMPLETE -------------------- */
  const filteredSymptoms = useMemo(() => {
    if (!searchTerm) return [];

    const normalized = searchTerm
      .toLowerCase()
      .replace(/\s+/g, "_");

    return allSymptoms
      .filter(
        (s) =>
          s.includes(normalized) &&
          !selectedSymptoms.includes(s)
      )
      .slice(0, 6);
  }, [searchTerm, selectedSymptoms, allSymptoms]);

  const addSymptom = (symptom) => {
    setSelectedSymptoms((prev) => [...prev, symptom]);
    setSearchTerm("");
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.filter((s) => s !== symptom)
    );
    setFlow(FLOW_STEPS.SELECT);
  };

  /* -------------------- PREDICTION -------------------- */
  const runPrediction = async () => {
    setIsPredicting(true);
    setApiError(null);

    try {
      const res = await fetch("/bbn-api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
        }),
      });

      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();
      const top = data.top_predictions?.[0];

      if (!top) throw new Error("Empty prediction");

      setPrediction(data.top_predictions);

      if (top.probability >= URGENCY_THRESHOLD) {
        setFlow(FLOW_STEPS.URGENT);
      } else {
        setFlow(FLOW_STEPS.RESULTS);
      }
    } catch (err) {
      console.error(err);
      setApiError("Unable to reach ML service.");
    } finally {
      setIsPredicting(false);
    }
  };

  /* -------------------- RENDER RIGHT PANEL -------------------- */
  const renderResultPanel = () => {
    if (apiError) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-red-600">
          <AlertTriangle size={48} />
          <p className="mt-3 text-sm">{apiError}</p>
        </div>
      );
    }

    if (flow === FLOW_STEPS.URGENT) {
      const top = prediction[0];
      return (
        <div className="bg-red-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle /> Urgent Attention Required
          </h3>
          <p className="mt-2">
            <strong>{top.disease}</strong> —{" "}
            {(top.probability * 100).toFixed(1)}%
          </p>
          <p className="text-sm mt-1">
            Recommended specialist: {top.specialization}
          </p>
        </div>
      );
    }

    if (flow === FLOW_STEPS.RESULTS) {
      const top = prediction[0];
      const recommendedDocs = doctors.filter(
        (d) => d.specialization === top.specialization
      );

      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-emerald-700">
              {top.disease}
            </h3>
            <p className="text-sm text-slate-500">
              Probability: {(top.probability * 100).toFixed(1)}%
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">
              Recommended Specialists
            </h4>
            <div className="grid gap-3">
              {recommendedDocs.length > 0 ? (
                recommendedDocs.map((doc) => (
                  <DoctorCard key={doc._id} doctor={doc} />
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No matching doctors found.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <HeartPulse size={48} />
        <p className="mt-2 text-sm">
          Select symptoms to begin assessment
        </p>
      </div>
    );
  };

  /* -------------------- MAIN UI -------------------- */
  return (
    <DashboardLayout activeItem="symptom-checker" userProfile={userProfile}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT PANEL */}
        <div className="bg-white p-6 rounded-2xl border space-y-6">
          <div>
            <label className="text-sm font-medium">
              Search Symptoms
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                placeholder="e.g. Joint Pain"
                disabled={flow !== FLOW_STEPS.SELECT}
              />
            </div>

            {filteredSymptoms.length > 0 && (
              <div className="border rounded-lg mt-2 bg-slate-50">
                {filteredSymptoms.map((s) => (
                  <div
                    key={s}
                    onClick={() => addSymptom(s)}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-emerald-100"
                  >
                    {formatLabel(s)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              Selected Symptoms
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((s) => (
                <span
                  key={s}
                  className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {formatLabel(s)}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => removeSymptom(s)}
                  />
                </span>
              ))}
              {selectedSymptoms.length === 0 && (
                <p className="text-sm text-slate-400">
                  No symptoms selected
                </p>
              )}
            </div>
          </div>

          <button
            onClick={runPrediction}
            disabled={
              selectedSymptoms.length === 0 || isPredicting
            }
            className="w-full py-3 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:bg-emerald-400"
          >
            {isPredicting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Bot />
            )}
            Start Assessment
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border min-h-[420px]">
          {renderResultPanel()}
        </div>
      </div>

      <p className="text-xs text-red-500 text-center mt-4 italic">
        Disclaimer: This tool provides preliminary insights only and
        does not replace professional medical advice.
      </p>
    </DashboardLayout>
  );
}
