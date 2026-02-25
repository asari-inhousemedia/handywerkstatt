
export enum OrderStatus {
  REPAIRING = 'In Reparatur',
  READY = 'Fertig / Abholbereit',
  PICKED_UP = 'Abgeholt',
  FAILED = 'Nicht reparabel',
  ARCHIVED = 'Archiviert'
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
