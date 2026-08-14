const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface SessionLog \{[\s\S]*?\}/, `export interface SessionLog {
  id: string;
  date?: string;
  timestamp: number;
  durationMinutes?: number;
  tasksCompleted: number;
  completedBits?: number;
  energyStart?: number;
  energyEnd: number;
  sprintsCount?: number;
  effortRating: string;
  notes: string;
}`);

code = code.replace(/export interface GroundingStep \{[\s\S]*?\}/, `export interface GroundingStep {
  id: string;
  count: number;
  sense: string;
  example: string;
  title?: string;
  instruction?: string;
  detail?: string;
}`);

fs.writeFileSync('src/types.ts', code);
