
export type AuthView = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  ecoPoints?: number;
  discountAvailable?: boolean;
}

export interface WastePickup {
  id: string;
  date: string;
  type: string;
  size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  address: string;
  latitude?: number;
  longitude?: number;
  weightEstimate?: string;
  discountApplied?: boolean;
}

export interface Complaint {
  id?: string;
  pickupId: string;
  location: string;
  complaintDate: string;
  reportedBy: string;
  status: 'pending' | 'resolved';
}
