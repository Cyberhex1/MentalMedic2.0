const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// SessionLog
code = code.replace(/export interface SessionLog \{/, `export interface SessionLog {\n  sprintsCount?: number;`);

// GroundingStep
code = code.replace(/export interface GroundingStep \{/, `export interface GroundingStep {\n  instruction?: string;`);

// BurnoutPhaseInfo
code = code.replace(/export interface BurnoutPhaseInfo \{[\s\S]*?\}/, `export interface BurnoutPhaseInfo {
  id?: BurnoutPhase;
  phase?: number;
  title?: string;
  tagline?: string;
  label?: string;
  description?: string;
  symptoms?: string[];
  color?: string;
  daysRange?: string;
  rules?: string[];
}`);

fs.writeFileSync('src/types.ts', code);
