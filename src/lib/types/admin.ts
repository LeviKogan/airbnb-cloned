export type AdminBooking = {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  status: string;
  message: string | null;
  createdAt: string;
};

export type AdminBlockedRange = {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  note: string | null;
  createdAt: string;
};
