import type { Metadata } from "next";
import { ServicesResults } from "../../components/ServicesResults";
import { SERVICE_LISTINGS } from "../../lib/services";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return <ServicesResults services={SERVICE_LISTINGS} />;
}
