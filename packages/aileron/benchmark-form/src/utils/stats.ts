/**
 * Statistical primitives for benchmark regression detection.
 *
 * Pure functions, no I/O. Welch's t-test (unequal variance) with an
 * accurate Student-t two-tailed p-value via the regularized incomplete
 * beta function — appropriate for the small sweep counts (N=3..15) the
 * bench harness produces, where a normal approximation would understate
 * tail probability.
 */

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** Unbiased sample variance (divides by n-1). */
export function sampleVariance(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

export function std(xs: number[]): number {
  return Math.sqrt(sampleVariance(xs));
}

/** z-score of `x` against a reference mean/std. 0 std → 0. */
export function zScore(x: number, refMean: number, refStd: number): number {
  if (refStd === 0) return 0;
  return (x - refMean) / refStd;
}

export interface WelchResult {
  t: number;
  df: number;
  pValue: number; // two-tailed
  meanA: number;
  meanB: number;
}

/**
 * Welch's two-sample t-test (does NOT assume equal variance).
 * `a` = baseline samples, `b` = current samples. Returns the t-statistic,
 * Welch–Satterthwaite degrees of freedom, and two-tailed p-value.
 */
export function welchTTest(a: number[], b: number[]): WelchResult {
  const ma = mean(a);
  const mb = mean(b);
  const va = sampleVariance(a);
  const vb = sampleVariance(b);
  const na = a.length;
  const nb = b.length;

  const seSq = va / na + vb / nb;
  if (seSq === 0) {
    return { t: 0, df: 1, pValue: 1, meanA: ma, meanB: mb };
  }
  const t = (ma - mb) / Math.sqrt(seSq);
  const df =
    seSq ** 2 /
    ((va / na) ** 2 / Math.max(1, na - 1) +
      (vb / nb) ** 2 / Math.max(1, nb - 1));
  const pValue = studentTTwoTailedP(t, df);
  return { t, df, pValue, meanA: ma, meanB: mb };
}

/**
 * Two-tailed p-value for Student's t with `df` degrees of freedom.
 * P(|T| > |t|) = I_{df/(df+t^2)}(df/2, 1/2)  (regularized incomplete beta).
 */
export function studentTTwoTailedP(t: number, df: number): number {
  if (!isFinite(t)) return 0;
  if (df <= 0) return 1;
  const x = df / (df + t * t);
  return regularizedIncompleteBeta(x, df / 2, 0.5);
}

/** Regularized incomplete beta I_x(a,b) via Lentz's continued fraction. */
export function regularizedIncompleteBeta(
  x: number,
  a: number,
  b: number,
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  // Use the symmetry relation for faster CF convergence.
  if (x < (a + 1) / (a + b + 2)) {
    return front * betacf(x, a, b);
  }
  return (
    1 -
    (Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / b) *
      betacf(1 - x, b, a)
  );
}

/** Continued fraction for the incomplete beta (Numerical Recipes betacf). */
function betacf(x: number, a: number, b: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Lanczos approximation of ln(Γ(z)). */
export function logGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const tt = z + g + 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(tt) - tt + Math.log(x)
  );
}
