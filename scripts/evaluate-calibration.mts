import { readFile } from "node:fs/promises";
import { CALIBRATION_CASES, evaluateCalibrationCase, evaluateCalibrationRuns, evaluateSourceQuality } from "@/lib/scanner-evals";
import type { WCSReport } from "@/lib/schema";

type Input = Record<string, WCSReport[]> | Array<{
  domain: string;
  reports: WCSReport[];
}>;

function usage(): never {
  console.error("Usage: npm run eval:calibration -- path/to/calibration-results.json");
  process.exit(2);
}

const inputPath = process.argv[2];
if (!inputPath) usage();

const raw = JSON.parse(await readFile(inputPath, "utf8")) as Input;
const reportsByDomain: Record<string, WCSReport[]> = Array.isArray(raw)
  ? Object.fromEntries(raw.map((item) => [item.domain, item.reports]))
  : raw;

const results = CALIBRATION_CASES.map((calibration) => {
  const reports = reportsByDomain[calibration.domain] ?? [];
  const result = evaluateCalibrationRuns(reports, calibration);
  const reportChecks = reports.map((report) => ({
    calibration: evaluateCalibrationCase(report, calibration),
    sources: evaluateSourceQuality(report),
  }));
  return {
    domain: calibration.domain,
    category: calibration.category,
    expectedOverall: calibration.expectedOverall,
    runs: result.scores.length,
    scores: result.scores,
    mean: result.mean,
    spread: result.spread,
    passed: result.passed && reportChecks.every((check) => check.calibration.passed && check.sources.passed),
    consistent: result.consistent,
    reportChecks,
  };
});

const missing = results.filter((result) => result.runs === 0).map((result) => result.domain);
const failed = results.filter((result) => !result.passed || !result.consistent).map((result) => result.domain);

console.log(JSON.stringify({
  total: results.length,
  passed: results.filter((result) => result.passed && result.consistent).length,
  missing,
  failed,
  results,
}, null, 2));

if (missing.length || failed.length) process.exitCode = 1;
