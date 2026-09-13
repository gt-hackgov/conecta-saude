"use client";

import { useEffect } from "react";
import { applyAccessibilityPreferences } from "@/lib/accessibility";

export function AccessibilityInit() {
  useEffect(() => {
    applyAccessibilityPreferences();
  }, []);

  return null;
}
