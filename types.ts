
export enum OrderStatus {
  REPAIRING = 'In Reparatur',
  READY = 'Fertig / Abholbereit',
  FAILED = 'Nicht reparabel',
  ARCHIVED = 'Abgeholt / Erledigt'
}

export interface Order {
  id: string;
  pickupNumber: string;
  status: OrderStatus;
  updatedAt: number;
  createdAt: number;
}

export type AuthState = {
  isAuthenticated: boolean;
};
