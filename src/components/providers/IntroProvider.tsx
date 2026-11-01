"use client";

import { createContext, useCallback, useContext, useState } from "react";

const IntroCtx = createContext<{ done: boolean; finish: () => void }>({
  done: true,
  finish: () => {},
});

export const useIntro = () => useContext(IntroCtx);

export default function IntroProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);
  return <IntroCtx.Provider value={{ done, finish }}>{children}</IntroCtx.Provider>;
}
