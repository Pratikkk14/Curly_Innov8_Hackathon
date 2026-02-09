const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
    medicineName: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String }, // e.g. Once a day, Twice a day
    timings: [{ type: String }], // Morning / Afternoon / Night
    startDate: { type: Date },
    endDate: { type: Date },
    reminderEnabled: { type: Boolean, default: false }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
    reportType: { type: String }, // Blood Test, MRI, Prescription
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
    // Basic Info
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { 
        type: String, 
        enum: ["Male", "Female", "Other"], 
        required: true 
    },

    // Auth
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Platform ID
    med_id: { type: String, required: true, unique: true },

    // Medical Profile
    bloodGroup: { type: String },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    chronicDiseases: [{ type: String }],
    allergies: [{ type: String }],

    // Medications
    medications: [MedicationSchema],

    // Reports
    reports: [ReportSchema],

}, { timestamps: true });

module.exports = mongoose.model("Customer", CustomerSchema);
