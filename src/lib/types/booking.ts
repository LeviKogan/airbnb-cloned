export type DateRangeIso = {
  checkIn: string;
  checkOut: string;
};

export type BookingStatus = "pending" | "awaiting_payment" | "confirmed" | "cancelled";

export type PaymentStatus = "not_requested" | "pending" | "paid" | "failed";

export type CreateBookingInput = {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  message?: string;
};
