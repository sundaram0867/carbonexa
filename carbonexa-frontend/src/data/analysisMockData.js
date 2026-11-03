const months = [
  ['Jan', '2026-01-01'], ['Feb', '2026-02-01'], ['Mar', '2026-03-01'],
  ['Apr', '2026-04-01'], ['May', '2026-05-01'], ['Jun', '2026-06-01'],
  ['Jul', '2026-07-01'], ['Aug', '2026-08-01'], ['Sep', '2026-09-01'],
  ['Oct', '2026-10-01'], ['Nov', '2026-11-01'], ['Dec', '2026-12-01'],
];

export const ANALYSIS_MINES = [
  { id: 'jharia', name: 'Jharia Block', commodity: 'Coal', status: 'Active', target: 30000, base: 28560, growth: 12, productivity: 142, reserve: 128.4, grade: 6.8 },
  { id: 'bokaro', name: 'Bokaro Project', commodity: 'Coal', status: 'Active', target: 26000, base: 24320, growth: 8, productivity: 136, reserve: 96.2, grade: 6.2 },
  { id: 'north-karanpura', name: 'North Karanpura', commodity: 'Coal', status: 'Maintenance', target: 22000, base: 18450, growth: -5, productivity: 118, reserve: 82.7, grade: 5.9 },
  { id: 'talcher', name: 'Talcher Coalfield', commodity: 'Coal', status: 'Active', target: 19000, base: 16780, growth: 15, productivity: 154, reserve: 110.8, grade: 6.5 },
  { id: 'ib-valley', name: 'Ib Valley', commodity: 'Coal', status: 'Active', target: 15000, base: 12960, growth: -10, productivity: 109, reserve: 74.1, grade: 5.7 },
];

const seasonal = [0.72, 0.83, 0.98, 0.9, 0.86, 0.8, 0.94, 1.14, 1, 0.96, 0.91, 1.07];

export const ANALYSIS_PRODUCTION = ANALYSIS_MINES.flatMap((mine, mineIndex) => months.map(([month, date], index) => {
  const actualTonnes = Math.round(mine.base * seasonal[index] * (0.97 + mineIndex * 0.012));
  const targetTonnes = Math.round(mine.target * (0.94 + (index % 4) * 0.02));
  const coalTonnes = Math.round(actualTonnes * 0.66);
  const overburdenTonnes = Math.round(actualTonnes * (0.25 + (mineIndex % 2) * 0.015));
  const othersTonnes = actualTonnes - coalTonnes - overburdenTonnes;
  return {
    id: `${mine.id}-${date}`,
    mineId: mine.id,
    mine: mine.name,
    commodity: mine.commodity,
    date,
    month,
    quarter: `Q${Math.floor(index / 3) + 1}`,
    year: '2026',
    targetTonnes,
    actualTonnes,
    coalTonnes,
    overburdenTonnes,
    othersTonnes,
    strippingRatio: Number((overburdenTonnes / Math.max(coalTonnes, 1)).toFixed(2)),
    productivity: Math.round(mine.productivity * seasonal[index]),
    achievement: Number(((actualTonnes / targetTonnes) * 100).toFixed(1)),
  };
}));

export const ANALYSIS_GEOLOGY = ANALYSIS_MINES.map((mine, index) => ({
  mineId: mine.id,
  mine: mine.name,
  commodity: mine.commodity,
  resourceMt: Number((mine.reserve * 1.34).toFixed(1)),
  reserveMt: mine.reserve,
  boreholeCount: 18 + index * 7,
  averageDepthM: 186 + index * 24,
  seamThicknessM: Number((2.4 + index * 0.31).toFixed(1)),
  gradePercent: mine.grade,
  ashPercent: Number((14.2 + index * 1.1).toFixed(1)),
  moisturePercent: Number((7.4 + index * 0.3).toFixed(1)),
  strata: ['Topsoil', 'Sandstone', 'Coal seam', 'Shale'],
  explorationTrend: [12, 16, 19, 22, 27, 31].map((count, monthIndex) => ({ period: `Q${monthIndex + 1}`, boreholes: count + index * 2 })),
}));

export const ANALYSIS_ENVIRONMENT = ANALYSIS_MINES.slice(0, 3).flatMap((mine, mineIndex) => months.slice(0, 9).map(([month, date], index) => ({
  id: `${mine.id}-env-${date}`,
  mineId: mine.id,
  mine: mine.name,
  date,
  month,
  pm25: 31 + mineIndex * 5 + ((index * 7) % 18),
  pm10: 68 + mineIndex * 9 + ((index * 11) % 35),
  ph: Number((7.1 + ((index + mineIndex) % 5) * 0.18).toFixed(1)),
  turbidity: Number((2.2 + mineIndex * 0.4 + ((index * 3) % 9) * 0.3).toFixed(1)),
  dissolvedOxygen: Number((6.2 - mineIndex * 0.3 + ((index * 2) % 5) * 0.2).toFixed(1)),
  co2Tonnes: 810 + mineIndex * 95 + index * 19 - (index % 3) * 36,
  vegetationPercent: 68 + mineIndex * 3 + Math.floor(index / 2),
})));

export const ANALYSIS_ENVIRONMENT_THRESHOLDS = {
  pm25: { label: 'PM2.5', unit: 'μg/m³', warning: 40, critical: 60, direction: 'above' },
  pm10: { label: 'PM10', unit: 'μg/m³', warning: 100, critical: 150, direction: 'above' },
  ph: { label: 'pH', unit: '', warningLow: 6.5, warningHigh: 8.5, criticalLow: 5.5, criticalHigh: 9.5, direction: 'range' },
  turbidity: { label: 'Turbidity', unit: 'NTU', warning: 5, critical: 10, direction: 'above' },
  dissolvedOxygen: { label: 'Dissolved oxygen', unit: 'mg/L', warning: 5, critical: 3, direction: 'below' },
  co2Tonnes: { label: 'CO₂ emissions', unit: 'tCO₂e', warning: 1000, critical: 1200, direction: 'above' },
};

export const ANALYSIS_REPORTS = [
  { id: 1, name: 'Monthly Production Analysis', desc: 'Output trend and performance', type: 'Production', project: 'Bokaro Project', generated: '28 Sep 2026', status: 'Completed' },
  { id: 2, name: 'Environmental Impact Analysis', desc: 'Air, water and soil assessment', type: 'Environmental', project: 'North Karanpura', generated: '25 Sep 2026', status: 'Completed' },
  { id: 3, name: 'Geological Survey Insights', desc: 'Resource estimation and mapping', type: 'Geological', project: 'Jharia Block', generated: '22 Sep 2026', status: 'In Review' },
];

export const ANALYSIS_MONTHS = months.map(([month]) => month);
