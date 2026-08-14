const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface GroundingStep \{[\s\S]*?\}/, `export interface GroundingStep {
  id: string;
  count?: number;
  sense?: string;
  example?: string;
  title?: string;
  instruction?: string;
  detail?: string;
  completed?: boolean;
}`);

fs.writeFileSync('src/types.ts', code);
