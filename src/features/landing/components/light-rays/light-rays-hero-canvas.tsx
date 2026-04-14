"use client";

/**
 * WebGPU hero beams — original WGSL for this codebase (commercial-safe).
 * Do not replace with verbatim third-party NC-licensed shader sources.
 */
import { useEffect, useMemo, useRef } from "react";
import { defineMaterial, FragCanvas } from "@motion-core/motion-gpu/react";

import { hexToRgbUnit } from "@/lib/color/hex-to-unit-rgb";
import type { ThemeMode } from "@/lib/types/audit";

const BEAM_FRAGMENT = `
fn wcsHash21(p: vec2f) -> f32 {
	return fract(sin(dot(p, vec2f(419.2, 178.23))) * 98251.742);
}

fn beamCone(coord: vec2f, apex: vec2f, axis: vec2f, tightness: f32) -> f32 {
	let v = coord - apex;
	let dist = max(length(v), 1e-4);
	let dir = normalize(v);
	let axisN = normalize(axis);
	let cosang = max(dot(dir, axisN), 0.0);
	let spread = pow(cosang, tightness);
	let edge = smoothstep(1.35, 0.08, dist / 900.0);
	return spread * edge;
}

fn frag(uv: vec2f) -> vec4f {
	let res = motiongpuFrame.resolution;
	let t = motiongpuFrame.time;
	let p = uv * res;

	let apex = vec2f(res.x * 0.5, res.y * 1.22);
	let axis = normalize(vec2f(0.04, -1.0));
	let b0 = beamCone(p, apex, axis, 2.85);
	let b1 = beamCone(p, apex + vec2f(40.0 * sin(t * 0.2), 0.0), axis, 3.4) * 0.55;

	let n = wcsHash21(floor(p * 0.04) + floor(t * 3.0));
	let grain = 0.04 * (n - 0.5);

	let strength = clamp(b0 + b1 + grain, 0.0, 1.35);
	let tint = motiongpuUniforms.beamTint;
	let lift = motiongpuUniforms.bgLift;

	let rgb = tint * strength + vec3f(lift);
	return vec4f(rgb, 1.0);
}
`;

type Props = {
  accentHex: string;
  mode: ThemeMode;
  className?: string;
  onGpuCanvas?: (canvas: HTMLCanvasElement | null) => void;
};

export const LightRaysHeroCanvas = ({ accentHex, mode, className, onGpuCanvas }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const material = useMemo(() => {
    const [r, g, b] = hexToRgbUnit(accentHex);
    const tintScale = mode === "light" ? 0.42 : 0.55;
    const lift = mode === "light" ? 0.14 : 0.045;
    return defineMaterial({
      uniforms: {
        beamTint: { type: "vec3f", value: [r * tintScale, g * tintScale, b * tintScale] },
        bgLift: { type: "f32", value: lift },
      },
      fragment: BEAM_FRAGMENT,
    });
  }, [accentHex, mode]);

  useEffect(() => {
    if (!onGpuCanvas) return;
    const root = wrapRef.current;
    if (!root) return;
    const sync = () => {
      const c = root.querySelector("canvas");
      onGpuCanvas(c as HTMLCanvasElement | null);
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      onGpuCanvas(null);
    };
  }, [material, onGpuCanvas]);

  return (
    <div className={className} ref={wrapRef} style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <FragCanvas
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio ?? 1, 2) : 1}
        material={material}
        onError={() => onGpuCanvas?.(null)}
        outputColorSpace="linear"
        renderMode="always"
        showErrorOverlay={false}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};
