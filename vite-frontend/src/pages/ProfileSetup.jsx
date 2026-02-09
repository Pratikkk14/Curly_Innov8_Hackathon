import React, { useState } from "react";
import { HeartPulse, Plus, X } from "lucide-react";

export default function ProfileSetup() {
    const [bloodGroup, setBloodGroup] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [chronicDiseases, setChronicDiseases] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [inputDisease, setInputDisease] = useState("");
    const [inputAllergy, setInputAllergy] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const addItem = (value, listSetter, list) => {
        if (value.trim()) {
            listSetter([...list, value.trim()]);
        }
    };

    const removeItem = (index, list, listSetter) => {
        listSetter(list.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(
                "http://localhost:3001/api/customer/profile",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        bloodGroup,
                        height: Number(height),
                        weight: Number(weight),
                        chronicDiseases,
                        allergies
                    })
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Update failed");

            setMessage("Profile updated successfully");

        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
                <HeartPulse className="text-emerald-600" />
                <h2 className="text-2xl font-bold">Medical Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                <input
                    type="text"
                    placeholder="Blood Group (e.g. B+)"
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="input"
                />

                <div className="flex gap-4">
                    <input
                        type="number"
                        placeholder="Height (cm)"
                        value={height}
                        onChange={e => setHeight(e.target.value)}
                        className="input"
                    />
                    <input
                        type="number"
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className="input"
                    />
                </div>

                {/* Chronic Diseases */}
                <TagInput
                    label="Chronic Diseases"
                    value={inputDisease}
                    setValue={setInputDisease}
                    items={chronicDiseases}
                    addItem={() => {
                        addItem(inputDisease, setChronicDiseases, chronicDiseases);
                        setInputDisease("");
                    }}
                    removeItem={removeItem}
                />

                {/* Allergies */}
                <TagInput
                    label="Allergies"
                    value={inputAllergy}
                    setValue={setInputAllergy}
                    items={allergies}
                    addItem={() => {
                        addItem(inputAllergy, setAllergies, allergies);
                        setInputAllergy("");
                    }}
                    removeItem={removeItem}
                />

                {message && <p className="text-sm text-emerald-600">{message}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg"
                >
                    {loading ? "Saving..." : "Save Profile"}
                </button>

            </form>
        </div>
    );
}

/* ---------------- Reusable Tag Input ---------------- */

const TagInput = ({ label, value, setValue, items, addItem, removeItem }) => (
    <div>
        <label className="block font-medium mb-2">{label}</label>

        <div className="flex gap-2">
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                className="input flex-1"
                placeholder={`Add ${label.toLowerCase()}`}
            />
            <button type="button" onClick={addItem}>
                <Plus />
            </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
            {items.map((item, index) => (
                <span
                    key={index}
                    className="flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full text-sm"
                >
                    {item}
                    <X
                        size={14}
                        className="cursor-pointer"
                        onClick={() => removeItem(index, items, label === "Chronic Diseases" ? setChronicDiseases : setAllergies)}
                    />
                </span>
            ))}
        </div>
    </div>
);
