# Analysis API contract

The frontend service is in `analysisService.js`. The mock implementation reads only from `data/analysisMockData.js`. Set `VITE_DATA_MODE=php` to use the following JSON API routes. PHP/MySQL implementation is outside the frontend scope.

All collection endpoints return `{ "data": [...] }`. Object endpoints return `{ "data": { ... } }`. Dates are ISO 8601 calendar dates (`YYYY-MM-DD`). Mine and project identifiers are stable strings. Measurements are numeric; field names or accompanying `unit` fields define units.

## Read endpoints

| Method and route | Query / response |
| --- | --- |
| `GET /analysis/overview` | `{ data: { miningOutputTonnes, co2Tonnes, activeMines, reportCount } }` |
| `GET /analysis/production` | Query: repeated `mineIds[]`, optional `dateFrom`, `dateTo`. Returns records with `id`, `mineId`, `mine`, `date`, `month`, `quarter`, `year`, `commodity`, `targetTonnes`, `actualTonnes`, `coalTonnes`, `overburdenTonnes`, `othersTonnes`, `strippingRatio`, `productivity`, and `achievement`. |
| `GET /analysis/mines` | Returns mine records with `id`, `name`, `commodity`, `status`, `target`, `base`, `growth`, `productivity`, `reserve`, and `grade`. |
| `GET /analysis/geology` | Query: repeated `mineIds[]`. Returns mine geology records with resource/reserve estimates, borehole metrics, seam thickness, grade, coal quality, strata, and exploration trend. |
| `GET /analysis/environment` | Query: repeated `mineIds[]`, optional `dateFrom`, `dateTo`. Returns `{ data: EnvironmentalRecord[], thresholds: ThresholdMap }`. Each environmental record has `id`, `mineId`, `mine`, `date`, `month`, `pm25`, `pm10`, `ph`, `turbidity`, `dissolvedOxygen`, `co2Tonnes`, and `vegetationPercent`. |
| `GET /analysis/insights` | Returns `{ data: { status: 'ready'|'unavailable', insights: [{ id, title, summary, recommendation, source }] } }`. Only provider generated insight records should use `status: 'ready'`. |
| `GET /analysis/details/{kind}/{id}` | Returns `{ data: AnalysisDetail }` for a mine, production record, geology record, environment record, or analysis report. |

## Write and comparison endpoints

`POST /analysis/compare` and `POST /analysis/custom` accept JSON bodies. A comparison request is:

```json
{
  "mineIds": ["jharia", "bokaro"],
  "projectIds": [],
  "metrics": ["actualTonnes", "targetTonnes", "co2Tonnes", "reserveMt"],
  "dateFrom": "2026-01-01",
  "dateTo": "2026-09-30"
}
```

`POST /analysis/compare` returns `{ data: [{ mineId, mine, actualTonnes, targetTonnes, achievement, co2Tonnes, reserveMt, productivity }] }`.

A custom analysis request is:

```json
{
  "mineIds": ["jharia"],
  "category": "Production",
  "metrics": ["actualTonnes", "targetTonnes"],
  "dateFrom": "2026-01-01",
  "dateTo": "2026-09-30",
  "chartType": "bar"
}
```

`POST /analysis/custom` returns `{ data: { id, configuration, rows, generatedAt } }`.
`POST /analysis/export` accepts `{ format, title, columns, rows }` and returns a file response or `{ data: { downloadUrl } }`.

## Frontend behavior

Mock data is clearly labeled in the Analysis UI and service results. The AI insights mock returns `status: 'unavailable'` with no generated findings. Environmental thresholds and rule-based anomaly checks are transparent browser-side demonstrations; they do not represent validated AI predictions.
