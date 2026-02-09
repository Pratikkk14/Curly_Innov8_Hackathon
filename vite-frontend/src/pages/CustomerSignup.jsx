import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, HeartPulse, ChevronDown, Calendar, Users } from 'lucide-react';

export default function CustomerSignup() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [consent, setConsent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!consent) {
            setError("You must agree to the terms and conditions.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(
                "http://localhost:5000/api/auth/customer/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        age: Number(age), // ✅ convert to number
                        gender,
                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || "Signup failed");
            }

            navigate("/login");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto">

                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                            <HeartPulse size={28} />
                        </div>
                        <span className="font-bold text-2xl">Curely</span>
                    </a>
                    <h2 className="mt-6 text-2xl font-bold">Create Your Patient Account</h2>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <InputField icon={<User />} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                        <InputField icon={<Calendar />} type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} required />

                        <SelectField icon={<Users />} value={gender} onChange={e => setGender(e.target.value)} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </SelectField>

                        <InputField icon={<Mail />} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                        <InputField icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <InputField icon={<Lock />} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={consent}
                                onChange={e => setConsent(e.target.checked)}
                                className="h-4 w-4 mt-1"
                            />
                            <label className="ml-3 text-sm">
                                I agree to the Privacy Policy
                            </label>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

const InputField = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
        </div>
        <input {...props} className="w-full pl-10 pr-4 py-3 border rounded-lg" />
    </div>
);

const SelectField = ({ icon, children, ...props }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
        </div>
        <select {...props} className="w-full pl-10 pr-10 py-3 border rounded-lg">
            {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
);
