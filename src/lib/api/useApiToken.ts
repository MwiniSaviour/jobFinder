"use client";

import { createContext, useContext } from "react";

export type ApiTokenGetter = () => Promise<string | null>;

const noToken: ApiTokenGetter = async () => null;

export const ApiTokenContext = createContext<ApiTokenGetter>(noToken);

export function useApiToken(): ApiTokenGetter {
  return useContext(ApiTokenContext);
}
