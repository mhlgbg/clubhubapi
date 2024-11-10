const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    personalInfo: {
        fullName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        idNumber: { type: String, required: true },
        nationality: { type: String, required: true },
        address: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String },
    },
    jobInfo: {
        employeeCode: { type: String},
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        position: { type: String },
        startDate: { type: Date },
        employmentStatus: { type: String, enum: ['Active', 'On Leave', 'Resigned'] },
        contractType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
        contractEndDate: { type: Date },
    },
    payrollInfo: {
        taxCode: { type: String },
        socialInsuranceNumber: { type: String },
        bankName: { type: String },
        bankAccountNumber: { type: String },
        baseSalary: { type: Number },
        allowances: { type: Number, default: 0 },
    },
    educationAndCertification: {
        highestDegree: { type: String },
        institution: { type: String },
        major: { type: String },
        certifications: [
            {
                name: { type: String },
                issuedBy: { type: String },
                issueDate: { type: Date },
            },
        ],
    },
    workExperience: [
        {
            companyName: { type: String },
            position: { type: String },
            duration: { type: String }, // Example format: "Jan 2018 - Dec 2020"
            achievements: { type: String },
        },
    ],
    emergencyContact: {
        contactName: { type: String },
        relationship: { type: String },
        contactPhone: { type: String },
    },
    notes: { type: String },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (admin or teacher who created the record)
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
