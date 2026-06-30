export interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface BillItem {
  service: Service;
  quantity: number;
}

export interface SalesEntry {
  id: string;
  name: string;
  amount: number;
  time: string; // HH:MM AM/PM
  items?: string[]; // list of item strings like "Eyebrow x2"
  clientName?: string;
  discount?: number;
}
