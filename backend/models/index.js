/**
 * models/index.js — MediQueue Mongoose Models
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── USER ───────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  phone:      { type: String, trim: true },
  role:       { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  age:        { type: Number },
  gender:     { type: String, enum: ['M', 'F', 'Other'] },
  bloodGroup: { type: String },
  address:    { type: String },
  patientId:  { type: String }, // e.g. MQ-200847
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ── DEPARTMENT ────────────────────────────────────────────────
const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  prefix:      { type: String, required: true, maxlength: 1 }, // token prefix
  room:        { type: String },
  description: { type: String },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── DOCTOR ────────────────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  specialization: { type: String },
  room:           { type: String },
  status:         { type: String, enum: ['active', 'break', 'off'], default: 'active' },
  avgConsultTime: { type: Number, default: 10 }, // minutes
}, { timestamps: true });

// ── APPOINTMENT / TOKEN ───────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor'                     },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  token:      { type: String, required: true, unique: true },
  tokenNumber:{ type: Number, required: true },
  date:       { type: Date,   required: true },
  timeSlot:   { type: String },
  reason:     { type: String },
  priority:   { type: String, enum: ['standard', 'elderly', 'emergency', 'vip'], default: 'standard' },
  status:     { type: String, enum: ['waiting', 'in-consultation', 'completed', 'cancelled', 'no-show'], default: 'waiting' },
  priorityScore:  { type: Number, default: 0 }, // AI-calculated
  estimatedWait:  { type: Number, default: 0 }, // minutes
  actualWait:     { type: Number },
  calledAt:       { type: Date },
  completedAt:    { type: Date },
  notes:          { type: String },
  isWalkIn:       { type: Boolean, default: false },
}, { timestamps: true });

// ── QUEUE ─────────────────────────────────────────────────────
const queueSchema = new mongoose.Schema({
  department:      { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  doctor:          { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date:            { type: Date, required: true },
  currentToken:    { type: String },
  currentTokenNum: { type: Number, default: 0 },
  tokenCounter:    { type: Number, default: 0 },
  status:          { type: String, enum: ['open', 'paused', 'closed'], default: 'open' },
  avgWaitTime:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = {
  User:        mongoose.model('User',        userSchema),
  Department:  mongoose.model('Department',  departmentSchema),
  Doctor:      mongoose.model('Doctor',      doctorSchema),
  Appointment: mongoose.model('Appointment', appointmentSchema),
  Queue:       mongoose.model('Queue',       queueSchema),
};
