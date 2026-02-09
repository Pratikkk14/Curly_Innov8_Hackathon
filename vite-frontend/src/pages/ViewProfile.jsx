import React, { useEffect, useState } from "react";
import { User, HeartPulse } from "lucide-react";

export default function ViewProfile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    "http://localhost:3001/api/customer/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.msg || "Failed to fetch profile");
                }

                setProfile(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProfile();
    }, []);

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    if (!profile) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
                <User className="text-emerald-600" />
                <h2 className="text-2xl font-bold">My Profile</h2>
            </div>

            <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <ProfileRow label="Name" value={profile.name} />
                <ProfileRow label="Age" value={profile.age} />
                <ProfileRow label="Gender" value={profile.gender} />
                <ProfileRow label="Email" value={profile.email} />
                <ProfileRow label="Blood Group" value={profile.bloodGroup || "-"} />
                <ProfileRow label="Height" value={profile.height ? `${profile.height} cm` : "-"} />
                <ProfileRow label="Weight" value={profile.weight ? `${profile.weight} kg` : "-"} />

                <Section title="Chronic Diseases" items={profile.chronicDiseases} />
                <Section title="Allergies" items={profile.allergies} />
                <Section title="Medications" items={profile.medications?.map(m => m.medicineName)} />
            </div>
        </div>
    );
}

/* ---------------- Helpers ---------------- */

const ProfileRow = ({ label, value }) => (
    <div className="flex justify-between border-b pb-2">
        <span className="font-medium text-slate-600">{label}</span>
        <span>{value}</span>
    </div>
);

const Section = ({ title, items }) => (
    <div>
        <h3 className="font-semibold mt-4 mb-2">{title}</h3>
        {items && items.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-slate-700">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-400">No data available</p>
        )}
    </div>
);
