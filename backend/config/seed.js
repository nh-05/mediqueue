/**
 * config/seed.js — Seed sample data into MongoDB
 * Run: node config/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose   = require('mongoose');
const { User, Department, Doctor, Appointment, Queue } = require('../models');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediqueue';

const departments = [
  { name: 'Cardiology',       prefix: 'A', room: 'OPD-3B', description: 'Heart and cardiovascular care' },
  { name: 'Orthopedics',      prefix: 'B', room: 'OPD-1A', description: 'Bones, joints, and muscles'   },
  { name: 'Pediatrics',       prefix: 'C', room: 'OPD-5C', description: 'Children health (0–18 years)' },
  { name: 'General Medicine', prefix: 'D', room: 'OPD-2A', description: 'General consultations'        },
  { name: 'Dermatology',      prefix: 'E', room: 'OPD-4B', description: 'Skin, hair, and nails'        },
  { name: 'ENT',              prefix: 'F', room: 'OPD-6A', description: 'Ear, Nose, and Throat'        },
];

const users = [
  // Admin
  { name: 'Admin User',       email: 'admin@mediqueue.com',   password: 'admin123',  role: 'admin'   },
  // Doctors (will be upgraded after Doctor records are created)
  { name: 'Dr. Priya Nair',   email: 'priya@mediqueue.com',   password: 'doctor123', role: 'doctor', age: 42, gender: 'F' },
  { name: 'Dr. Suresh Iyer',  email: 'suresh@mediqueue.com',  password: 'doctor123', role: 'doctor', age: 48, gender: 'M' },
  { name: 'Dr. Anil Menon',   email: 'anil@mediqueue.com',    password: 'doctor123', role: 'doctor', age: 38, gender: 'M' },
  { name: 'Dr. Kavitha Rao',  email: 'kavitha@mediqueue.com', password: 'doctor123', role: 'doctor', age: 45, gender: 'F' },
  // Patients
  { name: 'Arjun Sharma',     email: 'arjun@example.com',     password: 'patient123', role: 'patient', age: 34, gender: 'M', bloodGroup: 'B+', patientId: 'MQ-200847', phone: '+91 98765 43210' },
  { name: 'Sunita Devi',      email: 'sunita@example.com',    password: 'patient123', role: 'patient', age: 67, gender: 'F', bloodGroup: 'O+', patientId: 'MQ-200848', phone: '+91 98765 43211' },
  { name: 'Rahul Verma',      email: 'rahul@example.com',     password: 'patient123', role: 'patient', age: 52, gender: 'M', bloodGroup: 'A-', patientId: 'MQ-200849', phone: '+91 98765 43212' },
  { name: 'Rajan Bose',       email: 'rajan@example.com',     password: 'patient123', role: 'patient', age: 71, gender: 'M', bloodGroup: 'AB+',patientId: 'MQ-200850', phone: '+91 98765 43213' },
  { name: 'Priya Mehta',      email: 'priyam@example.com',    password: 'patient123', role: 'patient', age: 28, gender: 'F', bloodGroup: 'B-', patientId: 'MQ-200851', phone: '+91 98765 43214' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      User.deleteMany({}), Department.deleteMany({}),
      Doctor.deleteMany({}), Appointment.deleteMany({}), Queue.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // Seed departments
    const deptDocs = await Department.insertMany(departments);
    console.log(`✓ Seeded ${deptDocs.length} departments`);

    // Seed users
    const userDocs = await Promise.all(users.map(u => User.create(u)));
    console.log(`✓ Seeded ${userDocs.length} users`);

    // Seed doctors (link user → department)
    const findUser = (name) => userDocs.find(u => u.name === name);
    const findDept = (name) => deptDocs.find(d => d.name === name);

    const doctorDefs = [
      { userName: 'Dr. Priya Nair',  deptName: 'Cardiology',       specialization: 'Interventional Cardiology', room: 'OPD-3B', avgConsultTime: 8  },
      { userName: 'Dr. Suresh Iyer', deptName: 'Orthopedics',      specialization: 'Joint Replacement',         room: 'OPD-1A', avgConsultTime: 12 },
      { userName: 'Dr. Anil Menon',  deptName: 'Pediatrics',       specialization: 'Neonatology',               room: 'OPD-5C', avgConsultTime: 6  },
      { userName: 'Dr. Kavitha Rao', deptName: 'General Medicine', specialization: 'Internal Medicine',         room: 'OPD-2A', avgConsultTime: 7  },
    ];
    const doctorDocs = await Promise.all(doctorDefs.map(d =>
      Doctor.create({ user: findUser(d.userName)._id, department: findDept(d.deptName)._id, specialization: d.specialization, room: d.room, avgConsultTime: d.avgConsultTime })
    ));
    console.log(`✓ Seeded ${doctorDocs.length} doctors`);

    // Seed sample appointments for today
    const today = new Date(); today.setHours(9, 0, 0, 0);
    const cardDept = findDept('Cardiology');
    const cardDoc  = doctorDocs[0];
    const apptDefs = [
      { patient: findUser('Rahul Verma'),  priority: 'emergency', reason: 'Chest pain',      tokenNumber: 1, status: 'in-consultation' },
      { patient: findUser('Sunita Devi'),  priority: 'elderly',   reason: 'Breathlessness',  tokenNumber: 2, status: 'waiting'         },
      { patient: findUser('Arjun Sharma'), priority: 'standard',  reason: 'Chest checkup',   tokenNumber: 3, status: 'waiting'         },
      { patient: findUser('Priya Mehta'),  priority: 'standard',  reason: 'Palpitations',    tokenNumber: 4, status: 'waiting'         },
      { patient: findUser('Rajan Bose'),   priority: 'elderly',   reason: 'Routine checkup', tokenNumber: 5, status: 'waiting'         },
    ];

    const appts = await Promise.all(apptDefs.map((a, i) => Appointment.create({
      patient:      a.patient._id,
      doctor:       cardDoc._id,
      department:   cardDept._id,
      token:        `A-${String(i+1).padStart(3,'0')}`,
      tokenNumber:  a.tokenNumber,
      date:         today,
      reason:       a.reason,
      priority:     a.priority,
      priorityScore:(a.priority === 'emergency' ? 1000 : a.priority === 'elderly' ? 350 : 100),
      estimatedWait:(a.tokenNumber - 1) * 8,
      status:       a.status,
    })));
    console.log(`✓ Seeded ${appts.length} sample appointments`);

    console.log('\n═══════════════════════════════════════');
    console.log('  SEED COMPLETE — Demo Credentials');
    console.log('═══════════════════════════════════════');
    console.log('  Admin   → admin@mediqueue.com   / admin123');
    console.log('  Doctor  → priya@mediqueue.com   / doctor123');
    console.log('  Patient → arjun@example.com     / patient123');
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed error:', err);
    process.exit(1);
  }
}

seed();
