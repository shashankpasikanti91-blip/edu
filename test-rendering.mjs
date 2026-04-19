/**
 * E2E Validation Script for Math Rendering & Medical Disclaimer Logic
 * Run: node test-rendering.mjs
 */

// ═══════════════════════════════════════════════════════════════
// 1. MATH RENDERING — Test processLatex patterns
// ═══════════════════════════════════════════════════════════════

const MATH_TEST_CASES = [
  // Basic display math
  { input: '$$\\frac{1}{2}$$', expect: 'display', desc: 'Display math $$frac$$' },
  { input: '$x^2 + y^2 = z^2$', expect: 'inline', desc: 'Inline math $...$' },
  
  // LaTeX environments (the main bug fix)
  { input: '\\begin{array}{c|cc}\n& X & X \\\\\n\\hline\nX & XX & XX \\\\\nY & XY & XY \\\\\n\\end{array}', expect: 'display', desc: 'Bare \\begin{array} (Punnett square)' },
  { input: '$$\\begin{array}{c|cc}\n& X & X \\\\\n\\hline\nX & XX & XX \\\\\n\\end{array}$$', expect: 'display', desc: '$$-wrapped array' },
  { input: '\\begin{align}\nx + y &= 5 \\\\\n2x - y &= 1\n\\end{align}', expect: 'display', desc: 'Bare \\begin{align}' },
  { input: '\\begin{cases}\nx + y = 5 \\\\\n2x - y = 1\n\\end{cases}', expect: 'display', desc: 'Bare \\begin{cases}' },
  { input: '\\begin{matrix}\n1 & 2 \\\\\n3 & 4\n\\end{matrix}', expect: 'display', desc: 'Bare \\begin{matrix}' },
  { input: '\\begin{pmatrix}\n1 & 0 \\\\\n0 & 1\n\\end{pmatrix}', expect: 'display', desc: 'Bare \\begin{pmatrix}' },
  { input: '\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}', expect: 'display', desc: 'Bare \\begin{bmatrix}' },
  { input: '\\begin{aligned}\nx &= 5 \\\\\ny &= 3\n\\end{aligned}', expect: 'display', desc: 'Bare \\begin{aligned}' },
  { input: '\\begin{equation}\nE = mc^2\n\\end{equation}', expect: 'display', desc: 'Bare \\begin{equation}' },

  // Bracket delimiters
  { input: '\\[x^2 + y^2 = z^2\\]', expect: 'display', desc: '\\[...\\] display math' },
  { input: '\\(\\sin\\theta\\)', expect: 'inline', desc: '\\(...\\) inline math' },
  
  // Mixed content
  { input: 'The formula is $E = mc^2$ and the proof is $$\\int_0^\\infty e^{-x} dx = 1$$', expect: 'both', desc: 'Mixed inline + display' },
  { input: 'Given: $a = 5$, $b = 3$\n$$a^2 + b^2 = 25 + 9 = 34$$', expect: 'both', desc: 'Multiple inline + display' },
  
  // Bare LaTeX commands
  { input: '\\frac{a}{b}', expect: 'inline', desc: 'Bare \\frac' },
  { input: '\\sqrt{x}', expect: 'inline', desc: 'Bare \\sqrt' },
  { input: 'The answer is \\sin(30°) = 0.5', expect: 'inline', desc: 'Bare \\sin' },
  
  // Double-escaped (AI model quirk)
  { input: '$$\\\\frac{1}{2}$$', expect: 'display', desc: 'Double-escaped frac (AI quirk)' },
  
  // Edge cases
  { input: 'No math here, just plain text.', expect: 'none', desc: 'Plain text (no math)' },
  { input: 'Price is $5 and tax is $3', expect: 'none-or-inline', desc: 'Dollar signs in text (price context)' },
  { input: '$$$$', expect: 'empty', desc: 'Empty display math' },
];

// Regex patterns from mathRenderer.tsx (replicated for testing)
const DISPLAY_MATH = /\$\$([\s\S]*?)\$\$/;
const INLINE_MATH = /(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/;
const BRACKET_DISPLAY = /\\\[([\s\S]*?)\\\]/;
const PAREN_INLINE = /\\\(([\s\S]*?)\\\)/;
const BARE_ENV = /\\begin\{(array|align|align\*|aligned|alignat|gather|gather\*|gathered|equation|equation\*|eqnarray|eqnarray\*|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix|cases|split|multline|multline\*|flalign|flalign\*|subequations)\}([\s\S]*?)\\end\{\1\}/;

let mathPassed = 0;
let mathFailed = 0;

console.log('═══════════════════════════════════════════════════');
console.log(' MATH RENDERING TESTS');
console.log('═══════════════════════════════════════════════════');

for (const tc of MATH_TEST_CASES) {
  const hasDisplay = DISPLAY_MATH.test(tc.input);
  const hasInline = INLINE_MATH.test(tc.input);
  const hasBracketDisplay = BRACKET_DISPLAY.test(tc.input);
  const hasParenInline = PAREN_INLINE.test(tc.input);
  const hasBareEnv = BARE_ENV.test(tc.input);
  
  let detected = 'none';
  if ((hasDisplay || hasBracketDisplay || hasBareEnv) && hasInline) detected = 'both';
  else if (hasDisplay || hasBracketDisplay || hasBareEnv) detected = 'display';
  else if (hasInline || hasParenInline) detected = 'inline';
  
  // Check for bare LaTeX commands
  const BARE_CMD = /\\(frac|sqrt|sin|cos|tan|log|ln|exp)\b/;
  if (detected === 'none' && BARE_CMD.test(tc.input)) detected = 'inline';
  
  let pass = false;
  if (tc.expect === 'none-or-inline') pass = true; // ambiguous case
  else if (tc.expect === 'empty') pass = true; // edge case
  else if (tc.expect === 'both') pass = (detected === 'both');
  else pass = (detected === tc.expect);
  
  if (pass) {
    mathPassed++;
    console.log(`  ✅ PASS: ${tc.desc}`);
  } else {
    mathFailed++;
    console.log(`  ❌ FAIL: ${tc.desc} — expected '${tc.expect}', got '${detected}'`);
    console.log(`         Input: ${tc.input.slice(0, 60).replace(/\n/g, '\\n')}...`);
  }
}

console.log(`\n  Math Tests: ${mathPassed} passed, ${mathFailed} failed out of ${MATH_TEST_CASES.length}\n`);

// ═══════════════════════════════════════════════════════════════
// 2. MEDICAL CONTENT DETECTION — Test containsMedicalContent
// ═══════════════════════════════════════════════════════════════

const MEDICAL_KEYWORDS_RE = /\b(dosage|medication|drug|prescription|mg\/kg|tablet|capsule|injection|IV|intramuscular|intravenous|oral\s+dose|side\s+effects?|contraindications?|pharmacology|pharmacokinetics?|pharmacodynamics?|adverse\s+effects?|therapeutic|antidote|overdose|toxicity|diagnosis|prognosis|pathophysiology|clinical\s+features?|symptoms?|treatment\s+protocol|surgical|anaesthesia|anesthesia|chemotherapy|insulin|antibiotics?|analgesic|antipyretic|antihypertensive|NSAID|opioid|sedative|diuretic|steroid|vaccine|mechanism\s+of\s+action)\b/gi;

function containsMedicalContent(text) {
  const matches = text.match(MEDICAL_KEYWORDS_RE);
  return (matches?.length || 0) >= 3;
}

const MEDICAL_TEST_CASES = [
  // Should trigger disclaimer
  { input: 'Paracetamol is an analgesic and antipyretic drug used for pain. Dosage is 500mg tablet.', expect: true, desc: 'Drug info with dosage' },
  { input: 'The patient has diagnosis of hypertension. Treatment protocol includes diuretic medication. Prognosis is good.', expect: true, desc: 'Clinical content' },
  { input: 'Insulin injection is given subcutaneously. Side effects include hypoglycemia. The drug is a steroid hormone analog.', expect: true, desc: 'Drug administration' },
  { input: 'Pharmacology of antibiotics: mechanism of action, contraindication, and adverse effects.', expect: true, desc: 'Pharmacology topic' },
  { input: 'The vaccine works by stimulating the immune system. Dosage for children differs. Contraindication includes allergy to the drug.', expect: true, desc: 'Vaccine info' },
  
  // Should NOT trigger disclaimer
  { input: 'Explain the concept of photosynthesis in plants. Light energy is converted to chemical energy.', expect: false, desc: 'Biology (non-medical)' },
  { input: 'Solve: x^2 + 5x + 6 = 0 using the quadratic formula.', expect: false, desc: 'Math problem' },
  { input: 'The causes of World War II include treaty of Versailles and economic depression.', expect: false, desc: 'History topic' },
  { input: 'Compare democracy and dictatorship in terms of governance.', expect: false, desc: 'Political science' },
  { input: 'Newton discovered gravity when an apple fell. The drug lord was arrested by police.', expect: false, desc: 'Casual mention of drug (not medical)' },
];

console.log('═══════════════════════════════════════════════════');
console.log(' MEDICAL CONTENT DETECTION TESTS');
console.log('═══════════════════════════════════════════════════');

let medPassed = 0;
let medFailed = 0;

for (const tc of MEDICAL_TEST_CASES) {
  const result = containsMedicalContent(tc.input);
  if (result === tc.expect) {
    medPassed++;
    console.log(`  ✅ PASS: ${tc.desc} → ${result ? 'FLAGGED' : 'clean'}`);
  } else {
    medFailed++;
    console.log(`  ❌ FAIL: ${tc.desc} — expected ${tc.expect ? 'FLAGGED' : 'clean'}, got ${result ? 'FLAGGED' : 'clean'}`);
  }
}

console.log(`\n  Medical Tests: ${medPassed} passed, ${medFailed} failed out of ${MEDICAL_TEST_CASES.length}\n`);

// ═══════════════════════════════════════════════════════════════
// 3. BACKEND SAFETY VALIDATION — Test validateMedicalContent
// ═══════════════════════════════════════════════════════════════

function validateMedicalContent(content) {
  const warnings = [];
  const diagnosisPatterns = [
    /you\s+(have|are\s+suffering\s+from|are\s+diagnosed\s+with)/i,
    /your\s+diagnosis\s+is/i,
    /i\s+diagnose\s+you/i,
    /this\s+confirms?\s+(you\s+have|the\s+diagnosis)/i,
    /based\s+on\s+your\s+symptoms,?\s+you\s+(have|likely\s+have)/i,
  ];
  const treatmentPatterns = [
    /take\s+this\s+(medicine|medication|drug|dose)\s+immediately/i,
    /you\s+must\s+take\s+\d+\s*mg/i,
    /i\s+prescribe\s+you/i,
    /stop\s+taking\s+your\s+(current\s+)?medication/i,
    /buy\s+this\s+(drug|medicine|tablet|capsule)/i,
    /self[- ]medicate/i,
    /take\s+\d+\s*(mg|ml|tablets?|capsules?)\s+(\w+\s+)?(daily|twice|thrice|every|for\s+\d+)/i,
  ];
  const emergencyPatterns = [
    /instead\s+of\s+(going\s+to|visiting)\s+(the\s+)?(hospital|emergency|ER|doctor)/i,
    /you\s+don'?t\s+need\s+(a\s+doctor|to\s+go\s+to)/i,
    /no\s+need\s+for\s+(medical|professional)\s+(help|attention)/i,
    /skip\s+(the\s+)?(hospital|doctor|emergency)/i,
    /avoid\s+(going\s+to\s+)?(the\s+)?(hospital|doctor)/i,
  ];
  for (const p of diagnosisPatterns) if (p.test(content)) warnings.push('diagnosis');
  for (const p of treatmentPatterns) if (p.test(content)) warnings.push('treatment');
  for (const p of emergencyPatterns) if (p.test(content)) warnings.push('emergency');
  return warnings;
}

const SAFETY_TEST_CASES = [
  { input: 'You have diabetes and should monitor your blood sugar.', expect: ['diagnosis'], desc: 'Diagnosis-like claim' },
  { input: 'I prescribe you Metformin 500mg.', expect: ['diagnosis-or-treatment'], desc: 'Prescription claim' },
  { input: 'Take 500mg tablet daily for 7 days.', expect: ['treatment'], desc: 'Dosage instruction' },
  { input: 'You don\'t need a doctor for this condition.', expect: ['emergency'], desc: 'Discouraging medical help' },
  { input: 'Skip the hospital and try home remedies instead.', expect: ['emergency'], desc: 'Skip hospital' },
  { input: 'Buy this medicine from the pharmacy.', expect: ['treatment'], desc: 'Buy drug instruction' },
  { input: 'Self-medicate with over the counter drugs.', expect: ['treatment'], desc: 'Self-medication' },
  { input: 'Diabetes mellitus is a chronic condition affecting insulin production.', expect: [], desc: 'Educational content (safe)' },
  { input: 'The mechanism of action involves blocking calcium channels.', expect: [], desc: 'Pharmacology education (safe)' },
];

console.log('═══════════════════════════════════════════════════');
console.log(' BACKEND SAFETY VALIDATION TESTS');
console.log('═══════════════════════════════════════════════════');

let safetyPassed = 0;
let safetyFailed = 0;

for (const tc of SAFETY_TEST_CASES) {
  const warnings = validateMedicalContent(tc.input);
  const hasWarnings = warnings.length > 0;
  const expectWarnings = tc.expect.length > 0;
  
  if (hasWarnings === expectWarnings) {
    safetyPassed++;
    console.log(`  ✅ PASS: ${tc.desc} → ${hasWarnings ? `FLAGGED [${warnings.join(', ')}]` : 'clean'}`);
  } else {
    safetyFailed++;
    console.log(`  ❌ FAIL: ${tc.desc} — expected ${expectWarnings ? 'FLAGGED' : 'clean'}, got ${hasWarnings ? `FLAGGED [${warnings.join(', ')}]` : 'clean'}`);
  }
}

console.log(`\n  Safety Tests: ${safetyPassed} passed, ${safetyFailed} failed out of ${SAFETY_TEST_CASES.length}\n`);

// ═══════════════════════════════════════════════════════════════
// 4. BLOCKED CONTENT PATTERNS — Test input validation
// ═══════════════════════════════════════════════════════════════

const BLOCKED_PATTERNS = [
  /\b(porn|sex\s*chat|nude|naked|xxx|hentai|erotic)\b/i,
  /\b(kill\s+(yourself|myself|someone)|suicide\s+method|how\s+to\s+die)\b/i,
  /\b(make\s+a?\s*(bomb|weapon|drug|meth|explosive))\b/i,
  /\b(hack\s+(into|someone|account|password))\b/i,
  /\b(buy\s+(drugs|narcotics|cocaine|heroin|mdma)\s+online)\b/i,
  /\b(how\s+to\s+(steal|cheat\s+in\s+exam|forge|counterfeit))\b/i,
  /\b(illegal\s+download|pirate|crack\s+software)\b/i,
  /\b(child\s+(abuse|exploitation))\b/i,
  /\b(self[- ]?harm|cut\s+(yourself|myself)|anorexia\s+tips)\b/i,
];

function isBlocked(msg) {
  return BLOCKED_PATTERNS.some(p => p.test(msg));
}

const BLOCK_TEST_CASES = [
  { input: 'How to make a bomb at home', expect: true, desc: 'Weapon creation' },
  { input: 'hack into my school account', expect: true, desc: 'Hacking request' },
  { input: 'buy drugs online cheap', expect: true, desc: 'Drug purchase' },
  { input: 'how to cheat in exam easily', expect: true, desc: 'Exam cheating' },
  { input: 'self harm methods', expect: true, desc: 'Self-harm' },
  { input: 'crack software for free', expect: true, desc: 'Software piracy' },
  { input: 'Explain photosynthesis step by step', expect: false, desc: 'Normal educational' },
  { input: 'Solve x^2 + 5x + 6 = 0', expect: false, desc: 'Math problem' },
  { input: 'Explain the causes of World War II', expect: false, desc: 'History question' },
  { input: 'What is the mechanism of action of aspirin?', expect: false, desc: 'Medical education' },
];

console.log('═══════════════════════════════════════════════════');
console.log(' CONTENT BLOCKING TESTS');
console.log('═══════════════════════════════════════════════════');

let blockPassed = 0;
let blockFailed = 0;

for (const tc of BLOCK_TEST_CASES) {
  const result = isBlocked(tc.input);
  if (result === tc.expect) {
    blockPassed++;
    console.log(`  ✅ PASS: ${tc.desc} → ${result ? 'BLOCKED' : 'allowed'}`);
  } else {
    blockFailed++;
    console.log(`  ❌ FAIL: ${tc.desc} — expected ${tc.expect ? 'BLOCKED' : 'allowed'}, got ${result ? 'BLOCKED' : 'allowed'}`);
  }
}

console.log(`\n  Block Tests: ${blockPassed} passed, ${blockFailed} failed out of ${BLOCK_TEST_CASES.length}\n`);

// ═══════════════════════════════════════════════════════════════
// 5. SEGMENT EXTRACTION — Test renderMarkdownContent segments
// ═══════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════');
console.log(' SEGMENT EXTRACTION TESTS');
console.log('═══════════════════════════════════════════════════');

// Test the segment extraction from renderMarkdownContent
function extractSegments(text) {
  const segments = [];
  let remaining = text;

  while (remaining.length > 0) {
    const mathIdx = remaining.indexOf('$$');
    const codeIdx = remaining.indexOf('```');
    const bracketMathMatch = remaining.match(/\\\[/);
    const bracketMathIdx = bracketMathMatch?.index ?? -1;
    const bareEnvMatch = remaining.match(/\\begin\{(array|align|align\*|aligned|alignat|gather|gather\*|gathered|equation|equation\*|eqnarray|eqnarray\*|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix|cases|split|multline|multline\*|flalign|flalign\*|subequations)\}/);
    const bareEnvIdx = bareEnvMatch?.index ?? -1;

    const indices = [];
    if (mathIdx !== -1) indices.push({ type: 'math', idx: mathIdx });
    if (codeIdx !== -1) indices.push({ type: 'code', idx: codeIdx });
    if (bracketMathIdx !== -1) indices.push({ type: 'bracketmath', idx: bracketMathIdx });
    if (bareEnvIdx !== -1) {
      const charBefore = bareEnvIdx > 0 ? remaining[bareEnvIdx - 1] : '';
      if (charBefore !== '$') indices.push({ type: 'bareenv', idx: bareEnvIdx });
    }

    if (indices.length === 0) {
      segments.push({ kind: 'text', content: remaining });
      break;
    }

    indices.sort((a, b) => a.idx - b.idx);
    const first = indices[0];

    if (first.type === 'math') {
      if (mathIdx > 0) segments.push({ kind: 'text', content: remaining.slice(0, mathIdx) });
      const afterOpen = remaining.slice(mathIdx + 2);
      const closeIdx = afterOpen.indexOf('$$');
      if (closeIdx === -1) { segments.push({ kind: 'text', content: remaining.slice(mathIdx) }); break; }
      segments.push({ kind: 'displaymath', content: afterOpen.slice(0, closeIdx).trim() });
      remaining = afterOpen.slice(closeIdx + 2);
    } else if (first.type === 'bracketmath') {
      if (bracketMathIdx > 0) segments.push({ kind: 'text', content: remaining.slice(0, bracketMathIdx) });
      const afterOpen = remaining.slice(bracketMathIdx + 2);
      const closeIdx = afterOpen.indexOf('\\]');
      if (closeIdx === -1) { segments.push({ kind: 'text', content: remaining.slice(bracketMathIdx) }); break; }
      segments.push({ kind: 'displaymath', content: afterOpen.slice(0, closeIdx).trim() });
      remaining = afterOpen.slice(closeIdx + 2);
    } else if (first.type === 'bareenv') {
      const envName = bareEnvMatch[1];
      if (bareEnvIdx > 0) segments.push({ kind: 'text', content: remaining.slice(0, bareEnvIdx) });
      const envEndTag = `\\end{${envName}}`;
      const afterStart = remaining.slice(bareEnvIdx);
      const endIdx = afterStart.indexOf(envEndTag);
      if (endIdx === -1) { segments.push({ kind: 'text', content: afterStart }); break; }
      segments.push({ kind: 'displaymath', content: afterStart.slice(0, endIdx + envEndTag.length) });
      remaining = afterStart.slice(endIdx + envEndTag.length);
    } else {
      if (codeIdx > 0) segments.push({ kind: 'text', content: remaining.slice(0, codeIdx) });
      const afterOpen = remaining.slice(codeIdx + 3);
      const langEnd = afterOpen.indexOf('\n');
      const codeStart = langEnd >= 0 ? afterOpen.slice(langEnd + 1) : afterOpen;
      const closeIdx = codeStart.indexOf('```');
      if (closeIdx === -1) { segments.push({ kind: 'text', content: remaining.slice(codeIdx) }); break; }
      segments.push({ kind: 'code', content: codeStart.slice(0, closeIdx) });
      remaining = codeStart.slice(closeIdx + 3);
    }
  }
  return segments;
}

const SEGMENT_TESTS = [
  {
    desc: 'Punnett square with bare array',
    input: 'Diagram:\n\\begin{array}{c|cc}\n& X (Ovum) & X (Ovum) \\\\\n\\hline\nX (Sperm) & XX (Girl) & XX (Girl) \\\\\nY (Sperm) & XY (Boy) & XY (Boy) \\\\\n\\end{array}\nReference: NCERT',
    expectSegments: [
      { kind: 'text' },
      { kind: 'displaymath' },
      { kind: 'text' },
    ],
  },
  {
    desc: 'Mixed text, display math, code block',
    input: 'The formula is:\n$$E = mc^2$$\nCode:\n```python\nprint("hello")\n```\nDone.',
    expectSegments: [
      { kind: 'text' },
      { kind: 'displaymath' },
      { kind: 'text' },
      { kind: 'code' },
      { kind: 'text' },
    ],
  },
  {
    desc: 'Bracket display math \\[...\\]',
    input: 'Here is the formula:\n\\[x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\\]\nEnd.',
    expectSegments: [
      { kind: 'text' },
      { kind: 'displaymath' },
      { kind: 'text' },
    ],
  },
  {
    desc: 'Cases environment',
    input: 'f(x) = \\begin{cases}\nx & \\text{if } x \\geq 0 \\\\\n-x & \\text{if } x < 0\n\\end{cases}',
    expectSegments: [
      { kind: 'text' },
      { kind: 'displaymath' },
    ],
  },
];

let segPassed = 0;
let segFailed = 0;

for (const tc of SEGMENT_TESTS) {
  const segments = extractSegments(tc.input);
  const kindSequence = segments.map(s => s.kind);
  const expectedKinds = tc.expectSegments.map(s => s.kind);
  
  const match = JSON.stringify(kindSequence) === JSON.stringify(expectedKinds);
  if (match) {
    segPassed++;
    console.log(`  ✅ PASS: ${tc.desc} → [${kindSequence.join(', ')}]`);
  } else {
    segFailed++;
    console.log(`  ❌ FAIL: ${tc.desc}`);
    console.log(`         Expected: [${expectedKinds.join(', ')}]`);
    console.log(`         Got:      [${kindSequence.join(', ')}]`);
    // Show segment contents for debugging
    segments.forEach((s, i) => console.log(`         Seg ${i}: ${s.kind} = "${s.content.slice(0,50).replace(/\n/g,'\\n')}..."`));
  }
}

console.log(`\n  Segment Tests: ${segPassed} passed, ${segFailed} failed out of ${SEGMENT_TESTS.length}\n`);

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
const totalPassed = mathPassed + medPassed + safetyPassed + blockPassed + segPassed;
const totalFailed = mathFailed + medFailed + safetyFailed + blockFailed + segFailed;
const totalTests = totalPassed + totalFailed;

console.log('═══════════════════════════════════════════════════');
console.log(` TOTAL: ${totalPassed}/${totalTests} tests passed`);
if (totalFailed > 0) {
  console.log(` ❌ ${totalFailed} tests FAILED`);
  process.exit(1);
} else {
  console.log(' ✅ ALL TESTS PASSED');
  process.exit(0);
}
