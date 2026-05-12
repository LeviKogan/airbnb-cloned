export type DateRangeIso = {
  checkIn: string;
  checkOut: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type CreateBookingInput = {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  message?: string;
};
