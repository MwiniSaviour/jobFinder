"use client";

import { useState } from "react";
import type { RideBooking } from "../lib/bookings";

type PinCodeSheetProps = {
  open: boolean;
  onDismiss: () => void;
  booking: RideBooking;
  step: "code" | "driver";
  mode: "start" | "finish";
  attemptsLeft: number;
  onPinSuccess: () => void;
  onWrongAttempt: (attemptsSoFar: number) => void;
  onCompleteTrip: () => void;
  onFailHandoff: () => void;
};

export default function PinCodeSheet(props: PinCodeSheetProps) {
  const {
    open,
    onDismiss,
    booking,
    step,
    mode,
    attemptsLeft,
    onPinSuccess,
    onWrongAttempt,
    onCompleteTrip,
    onFailHandoff,
  } = props;
  const [pin, setPin] = useState("");

  if (!open) return null;

  const attemptsSoFar = 3 - attemptsLeft;

  const verify = (candidate: string) => {
    if (!booking.pinCode) return;
    if (candidate === booking.pinCode) {
      setPin("");
      onPinSuccess();
    } else {
      setPin("");
      onWrongAttempt(attemptsSoFar + 1);
    }
  };

  const pressDigit = (digit: string) => {
    const next = `${pin}${digit}`.slice(0, 4);
    setPin(next);
    if (next.length === 4) verify(next);
  };

  const dismiss = () => {
    setPin("");
    onDismiss();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="rounded-t-[24px] bg-[#ffffff] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        {step === "code" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Driver verification</span>
              <span className="text-[13px] text-muted">Your driver must type this code exactly.</span>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((slot) => (
                <span
                  key={slot}
                  className="flex h-12 w-10 items-center justify-center rounded-[12px] border border-border text-xl tabular-nums tracking-widest"
                >
                  {pin.length > slot ? "•" : "·"}
                </span>
              ))}
            </div>
            {attemptsLeft < 3 ? (
              <span className="text-center text-[13px] text-red-600">
                {attemptsLeft === 1 ? "1 attempt left." : `${attemptsLeft} attempts left.`}
              </span>
            ) : null}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "spacer", "0", "back"].map((key) => {
                if (key === "spacer") return <span key={key} aria-hidden="true" />;
                if (key === "back") {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPin(pin.slice(0, pin.length - 1))}
                      className="h-12 rounded-[12px] border border-border text-lg hover:bg-black/[0.04]"
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pressDigit(key)}
                    className="h-12 rounded-[12px] border border-border text-lg tabular-nums hover:bg-black/[0.04]"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
            {mode === "start" ? (
              <button
                type="button"
                onClick={dismiss}
                className="self-center text-[13px] font-medium text-muted underline underline-offset-2"
              >
                Cancel
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Driver actions</span>
              <span className="text-[13px] text-muted">
                {booking.requestType === "parcel" ? "Finish the parcel handoff." : "Finish the ride handoff."}
              </span>
            </div>
            <button
              type="button"
              onClick={onCompleteTrip}
              className="w-full rounded-[12px] bg-black px-4 py-2.5 font-medium text-white"
            >
              Finish drop-off
            </button>
            <button
              type="button"
              onClick={onFailHandoff}
              className="w-full rounded-[12px] border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
            >
              No one to receive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
