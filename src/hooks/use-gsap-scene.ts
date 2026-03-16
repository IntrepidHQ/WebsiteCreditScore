"use client";

import { useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useGsapScene(
  setup: () => gsap.Context | (() => void) | void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const result = setup();

    return () => {
      if (
        typeof result === "object" &&
        result !== null &&
        "revert" in result &&
        typeof result.revert === "function"
      ) {
        result.revert();
      } else if (typeof result === "function") {
        result();
      } else {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, [enabled, setup]);
}
