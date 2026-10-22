import type { Metadata } from "next";
import { RidesClient } from "../../components/RidesClient";

export const metadata: Metadata = {
  title: "Rides",
};

export default function RidesPage() {
  return <RidesClient />;
}
