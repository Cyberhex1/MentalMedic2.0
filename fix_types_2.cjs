const fs = require('fs');

let typesCode = fs.readFileSync('src/types.ts', 'utf8');

// Add missing SessionLog properties
typesCode = typesCode.replace(/export interface SessionLog \{/, `export interface SessionLog {\n  date?: string;`);

// Add BurnoutPhaseInfo properties
typesCode = typesCode.replace(/export interface BurnoutPhaseInfo \{[\s\S]*?\}/, `export interface BurnoutPhaseInfo {
  id: BurnoutPhase;
  phase: number;
  title: string;
  tagline: string;
  label: string;
  description: string;
  symptoms: string[];
  color: string;
  daysRange: string;
  rules: string[];
}`);

// Add GroundingStep.title
typesCode = typesCode.replace(/export interface GroundingStep \{/, `export interface GroundingStep {\n  title?: string;`);

fs.writeFileSync('src/types.ts', typesCode);

// Fix firebase.ts imports
let firebaseCode = fs.readFileSync('src/lib/firebase.ts', 'utf8');
firebaseCode = firebaseCode.replace(/StickyNote, FocusSession/, 'NoteItem, SessionLog');
firebaseCode = firebaseCode.replace(/notes: StickyNote\[\];/, 'notes: NoteItem[];');
firebaseCode = firebaseCode.replace(/sessionLogs: FocusSession\[\];/, 'sessionLogs: SessionLog[];');
fs.writeFileSync('src/lib/firebase.ts', firebaseCode);

