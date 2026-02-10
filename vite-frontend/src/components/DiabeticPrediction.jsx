import React, { useEffect, useRef, useState } from 'react';

const initialFormData = {
  age: '',
  bmi: '',
  blood_pressure: '',
  insulin_level: '',
  cholesterol_level: '',
  triglycerides_level: '',
  daily_calorie_intake: '',
  sugar_intake_grams_per_day: '',
  sleep_hours: '',
  stress_level: '',
  waist_circumference_cm: '',
  gender: '',
  physical_activity_level: '',
  family_history_diabetes: ''
};

const DEBOUNCE_MS = 400;

const DiabeticPredictionForm = () => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const formDataRef = useRef({ ...initialFormData });
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current = {
      ...formDataRef.current,
      [name]: value
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Debounced checkpoint for any expensive work tied to form updates.
      formDataRef.current = { ...formDataRef.current };
    }, DEBOUNCE_MS);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setLoading(true);
    try {
      const response = await fetch('/predict/diabetes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataRef.current)
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
      }

      await response.json();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    formDataRef.current = { ...initialFormData };
    formRef.current?.reset();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-emerald-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Diabetic Risk Assessment
          </h1>
          <p className="text-slate-600">
            Complete the form below to assess your diabetic risk profile
          </p>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="p-8">
            {/* Personal Information */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-200">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    min={0}
                    max={100}
                    defaultValue={initialFormData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 42"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    defaultValue={initialFormData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-200">
                Physical Measurements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    BMI (Body Mass Index)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="bmi"
                    min={0}
                    max={50}
                    defaultValue={initialFormData.bmi}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 29.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Waist Circumference (cm)
                  </label>
                  <input
                    type="number"
                    name="waist_circumference_cm"
                    min={0}
                    max={200}
                    defaultValue={initialFormData.waist_circumference_cm}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 102"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    name="blood_pressure"
                    min={0}
                    max={300}
                    defaultValue={initialFormData.blood_pressure}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 135"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Clinical Measurements */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-200">
                Clinical Measurements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Insulin Level (μU/mL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="insulin_level"
                    min={0}
                    max={100}
                    defaultValue={initialFormData.insulin_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 18"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cholesterol Level (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="cholesterol_level"
                    min={0}
                    max={300}
                    defaultValue={initialFormData.cholesterol_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Triglycerides Level (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="triglycerides_level"
                    min={0}
                    max={300}
                    defaultValue={initialFormData.triglycerides_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 190"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Lifestyle Factors */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-200">
                Lifestyle Factors
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Daily Calorie Intake
                  </label>
                  <input
                    type="number"
                    name="daily_calorie_intake"
                    min={0}
                    max={10000}
                    defaultValue={initialFormData.daily_calorie_intake}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 2600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sugar Intake (grams/day)
                  </label>
                  <input
                    type="number"
                    name="sugar_intake_grams_per_day"
                    min={0}
                    max={500}
                    defaultValue={initialFormData.sugar_intake_grams_per_day}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 85"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sleep Hours (per day)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="sleep_hours"
                    min={0}
                    max={24}
                    defaultValue={initialFormData.sleep_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 5.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stress Level (1-10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    name="stress_level"
                    defaultValue={initialFormData.stress_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 7"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Physical Activity Level
                  </label>
                  <select
                    name="physical_activity_level"
                    defaultValue={initialFormData.physical_activity_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    required
                  >
                    <option value="">Select activity level</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-200">
                Medical History
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Family History of Diabetes
                  </label>
                  <select
                    name="family_history_diabetes"
                    defaultValue={initialFormData.family_history_diabetes}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    required
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-slate-50 px-8 py-6 rounded-b-xl border-t border-slate-200 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Predict Risk"
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          This assessment is for informational purposes only and does not
          replace professional medical advice.
        </div>
      </div>
    </div>
  );
};

export default DiabeticPredictionForm;