"use client";

import { useEffect } from "react";
import { hydrateStorage } from "../lib/storage";
import "../lib/migrations";

export function StorageBoot() {
  useEffect(() => {
    void hydrateStorage();
  }, []);

  return null;
}
