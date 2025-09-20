export interface EmergencyCall {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender?: string;
  medicalId?: string;
  phoneNumber: string;
  callerName?: string;
  location: string;
  coordinates?: string;
  nearestHospital?: string;
  callTime: string;
  duration: string;
  complaint: string;
  symptoms?: string;
  vitals?: string;
  allergies?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'active' | 'pending' | 'responding' | 'completed';
  responder?: string;
  unitId?: string;
  eta?: string;
  dispatchTime?: string;
}

export interface DashboardStats {
  activeCalls: number;
  availableUnits: number;
  averageResponseTime: string;
  staffOnDuty: number;
  criticalPatients: number;
  callsToday: number;
}