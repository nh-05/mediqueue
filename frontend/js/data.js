/**
 * data.js — MediQueue Sample Data Store
 * Central data source; in production replace with API calls.
 */

const DATA = {

  departments: [
    { id:'card',  name:'Cardiology',       doctors:['Dr. Priya Nair','Dr. Ramesh Kumar'],  current:'A-044', next:['A-045','A-046','A-047'], queue:7,  avg:18, room:'OPD-3B' },
    { id:'ortho', name:'Orthopedics',      doctors:['Dr. Suresh Iyer','Dr. Meena Pillai'], current:'B-022', next:['B-023','B-024'],          queue:4,  avg:22, room:'OPD-1A' },
    { id:'peds',  name:'Pediatrics',       doctors:['Dr. Anil Menon'],                     current:'C-015', next:['C-016','C-017'],          queue:5,  avg:12, room:'OPD-5C' },
    { id:'gm',    name:'General Medicine', doctors:['Dr. Kavitha Rao','Dr. Vijay Singh'],   current:'D-038', next:['D-039','D-040','D-041'],  queue:11, avg:10, room:'OPD-2A' },
    { id:'derm',  name:'Dermatology',      doctors:['Dr. Deepa Nambiar'],                  current:'E-009', next:['E-010','E-011'],          queue:3,  avg:15, room:'OPD-4B' },
    { id:'ent',   name:'ENT',              doctors:['Dr. Mohan Babu'],                     current:'F-031', next:['F-032'],                  queue:2,  avg:20, room:'OPD-6A' },
  ],

  doctors: [
    { name:'Dr. Priya Nair',    dept:'Cardiology',       room:'OPD-3B', status:'active', queue:7,  avg:'18 min', served:11 },
    { name:'Dr. Suresh Iyer',   dept:'Orthopedics',      room:'OPD-1A', status:'active', queue:4,  avg:'22 min', served:8  },
    { name:'Dr. Ramesh Kumar',  dept:'Cardiology',       room:'OPD-3C', status:'break',  queue:0,  avg:'16 min', served:9  },
    { name:'Dr. Meena Pillai',  dept:'Orthopedics',      room:'OPD-1B', status:'active', queue:3,  avg:'25 min', served:6  },
    { name:'Dr. Anil Menon',    dept:'Pediatrics',       room:'OPD-5C', status:'active', queue:5,  avg:'12 min', served:14 },
    { name:'Dr. Kavitha Rao',   dept:'General Medicine', room:'OPD-2A', status:'active', queue:6,  avg:'10 min', served:16 },
    { name:'Dr. Vijay Singh',   dept:'General Medicine', room:'OPD-2B', status:'active', queue:5,  avg:'11 min', served:12 },
    { name:'Dr. Deepa Nambiar', dept:'Dermatology',      room:'OPD-4B', status:'active', queue:3,  avg:'15 min', served:7  },
  ],

  /** Active doctor's patient queue */
  docQueue: [
    { token:'A-044', name:'Rahul Verma',      age:52, gender:'M', priority:'emergency', reason:'Chest pain',     wait:0,  history:'Hypertension' },
    { token:'A-045', name:'Sunita Devi',       age:67, gender:'F', priority:'elderly',   reason:'Breathlessness', wait:8,  history:'Diabetes'     },
    { token:'A-046', name:'Vikram Malhotra',   age:34, gender:'M', priority:'standard',  reason:'Follow-up ECG',  wait:14, history:'—'            },
    { token:'A-047', name:'Arjun Sharma',      age:34, gender:'M', priority:'standard',  reason:'Chest checkup',  wait:18, history:'—'            },
    { token:'A-048', name:'Priya Mehta',       age:28, gender:'F', priority:'standard',  reason:'Palpitations',   wait:24, history:'—'            },
    { token:'A-049', name:'Rajan Bose',        age:71, gender:'M', priority:'elderly',   reason:'Routine checkup',wait:30, history:'Arrhythmia'   },
    { token:'A-050', name:'Anita Sharma',      age:45, gender:'F', priority:'standard',  reason:'Test review',    wait:36, history:'—'            },
  ],

  patientHistory: [
    { date:'Apr 8',  dept:'Cardiology',       doctor:'Dr. Priya Nair',    token:'A-021', wait:'12 min', status:'completed' },
    { date:'Mar 22', dept:'General Medicine', doctor:'Dr. Kavitha Rao',   token:'D-015', wait:'8 min',  status:'completed' },
    { date:'Mar 10', dept:'Orthopedics',      doctor:'Dr. Suresh Iyer',   token:'B-009', wait:'24 min', status:'completed' },
    { date:'Feb 28', dept:'Dermatology',      doctor:'Dr. Deepa Nambiar', token:'E-003', wait:'18 min', status:'completed' },
  ],

  notifications: [
    { icon:'⏰', bg:'var(--blue-50)',   type:'Queue Alert',       msg:'Your token A-047 is 3 patients away. Please proceed to OPD-3B.', time:'10:42 AM', unread:true  },
    { icon:'✅', bg:'var(--green-50)',  type:'Booking Confirmed', msg:'Appointment with Dr. Priya Nair confirmed for today.',           time:'9:15 AM',  unread:true  },
    { icon:'📱', bg:'var(--amber-50)', type:'SMS Sent',           msg:'Reminder sent to +91 98765 43210 for your appointment.',         time:'9:00 AM',  unread:true  },
    { icon:'🔔', bg:'var(--purple-50)',type:'Reminder',           msg:'Upcoming appointment tomorrow at 11:00 AM — Orthopedics.',       time:'Yesterday',unread:false },
  ],

  walkIns: [
    { token:'D-042', name:'Mohan Das',   age:72, dept:'General Medicine', priority:'elderly',   time:'11:02 AM' },
    { token:'A-051', name:'Sneha Patil', age:8,  dept:'Cardiology',       priority:'standard',  time:'10:55 AM' },
    { token:'C-018', name:'Ritu Joshi',  age:5,  dept:'Pediatrics',       priority:'emergency', time:'10:40 AM' },
  ],

  hourlyFlow: [
    { h:'8AM', v:12 }, { h:'9AM',  v:28 }, { h:'10AM', v:45 }, { h:'11AM', v:38 }, { h:'12PM', v:25 },
    { h:'1PM', v:18 }, { h:'2PM',  v:30 }, { h:'3PM',  v:42 }, { h:'4PM',  v:35 }, { h:'5PM',  v:22 },
  ],

  /** Priority → estimated wait override (minutes) */
  priorityWait: { emergency: 0, elderly: 12, vip: 5, standard: 22 },

  /** Department prefix for token generation */
  deptPrefix: {
    'Cardiology': 'A', 'Orthopedics': 'B', 'Pediatrics': 'C',
    'General Medicine': 'D', 'Dermatology': 'E', 'ENT': 'F',
  },

  /** State */
  currentDocIndex: 0,
  walkInCounter:   52,
};
