import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { BOOKING_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";

const BookingPage = () => {
  return <LocalizedFoundationOverview namespace="booking" panels={BOOKING_PANEL_DEFINITIONS} />;
};

export default BookingPage;
