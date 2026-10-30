# Loaded directly with Python; sibling raw files are the immutable input evidence.
import json
import random
import statistics
from pathlib import Path


def percentile(values, probability):
    position = (len(values) - 1) * probability
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    return values[lower] + (values[upper] - values[lower]) * (position - lower)


root = Path(__file__).parent
result = {"method": "paired per-page E5/E4; percentile bootstrap of median paired ratio", "confidence": 0.95, "resamples": 20000, "seed": 460502, "windows": {}}
for label, folder in [("final", root), ("superseded-window-1", root / "superseded-window-1")]:
    report = json.loads((folder / "round2-complete.json").read_text())
    selected = [row for row in report["samples"] if row["id"] == "mount-flat-500-on"]
    ratios = []
    for index in range(10):
        pair = {row["lane"]: row["eagerPaintedMs"] for row in selected if row["index"] == index}
        ratios.append(pair["E5"] / pair["E4"])
    generator = random.Random(result["seed"])
    distribution = sorted(statistics.median(generator.choices(ratios, k=10)) for _ in range(result["resamples"]))
    interval = [percentile(distribution, 0.025), percentile(distribution, 0.975)]
    rule_row = next(row for row in report["rows"] if row["id"] == "mount-flat-500-on")
    result["windows"][label] = {"pairedRatios": ratios, "medianPairedRatio": statistics.median(ratios), "bootstrap95": interval, "excludes102": not interval[0] <= 1.02 <= interval[1], "ruleRatioOfMedians": rule_row["ratio"], "rulePass": rule_row["pass"]}
(root / "paired-bootstrap.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result))
