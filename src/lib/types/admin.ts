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
  userId: string | null;
  totalAmountCents: number | null;
  currency: string;
  paymentStatus: string;
  paymentUrl: string | null;
  acceptedAt: string | null;
  paymentEmailSentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminBlockedRange = {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  note: string | null;
  createdAt: string;
};
