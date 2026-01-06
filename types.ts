
export interface FlightOption {
  time: string;
  arrival: string;
  feasible: boolean;
  risk: string;
  company: string;
  notes?: string;
  recommended?: boolean;
  price: number;
}

export interface Neighborhood {
  name: string;
  safety: number;
  price: string;
  distance: string;
  features: string[];
}

export interface SafariOption {
  name: string;
  price: number;
  duration: string;
  distance: string;
  includes: string;
  recommended?: boolean;
}

export interface BudgetEntry {
  id: string;
  category: 'VOO' | 'TRANSPORTE' | 'HOSPEDAGEM' | 'LAZER' | 'ALIMENTAÇÃO' | 'OUTROS' | 'ROTEIRO' | 'SAFARI';
  description: string;
  date: string;
  total: number;
  notes: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  accommodation: string;
  totalZar: number;
  activities: {
    time: string;
    description: string;
    costZar: number;
    notes?: string;
  }[];
}

export interface BusOption {
  id: string;
  time: string;
  duration: string;
  type: string;
  price: number;
  company: string;
  color: string;
  icon: string;
  features: string[];
  notes: string;
  recommended?: boolean;
  warning?: string;
}

export interface TicketDetails {
  bookingId: string;
  checkInCode: string;
  passengers: {
    name: string;
    idDoc: string;
    eTicket: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
