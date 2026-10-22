"use client";

import { formatCedis } from "../lib/geo";
import { rideReceiptFor, type RideBooking } from "../lib/bookings";

type RideReceiptCardProps = {
  booking: RideBooking;
  className?: string;
  onRetry?: () => void;
};

export default function RideReceiptCard({ booking, className, onRetry }: RideReceiptCardProps) {
  const receipt = rideReceiptFor(booking);
  const failed = receipt.outcome === "failed";

  return (
    <div
      className={
        ["rounded-[16px] border border-border bg-surface shadow-card", className ?? ""].join(" ").trim()
      }
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2 pt-1">
          <span className="text-[15px] font-semibold">
            {booking.requestType === "parcel" ? "Parcel receipt" : "Ride receipt"}
          </span>
          <span className="text-[12px] text-muted">{new Date(receipt.issuedAt).toLocaleString()}</span>
        </div>
        {receipt.lines.map((line, index) => (
          <div
            key={`${line.label}-${index}`}
            className="flex items-baseline justify-between gap-3 text-[14px]"
          >
            <span className="text-muted">{line.label}</span>
            <span>{formatCedis(line.amount)}</span>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2 text-[14px] font-semibold">
          <span>Total</span>
          <span>{formatCedis(receipt.total)}</span>
        </div>
        <p className={failed ? "text-[13px] text-red-600" : "text-[13px] text-emerald-700"}>
          {failed ? `❌ ${receipt.note}` : "✅ Pickup verified. Trip completed."}
        </p>
        {failed && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-[12px] border border-border bg-transparent px-4 py-2 text-[14px] font-medium hover:bg-black/[0.04]"
          >
            Request another ride
          </button>
        ) : null}
      </div>
    </div>
  );
}
