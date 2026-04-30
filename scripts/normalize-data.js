#!/usr/bin/env node
// ============================================
// NORMALIZE-DATA.JS — Transform raw UPTAC OR-CR data into app-ready format
// ============================================
// Reads: src/data/official/uptac-2025-btech-orcr-raw.json
// Writes: src/data/official/cutoffs-2025.json
//         src/data/official/colleges-2025.json
//         src/data/official/branches-2025.json
//         src/data/official/metadata.json

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'src', 'data', 'official');

// ---- Slug generation ----
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ---- Branch code mapping ----
const BRANCH_CODE_MAP = {
  'computer science and engineering': 'CSE',
  'computer science & engineering': 'CSE',
  'computer science and engineering (artificial intelligence)': 'CSE-AI',
  'computer science and engineering (artificial intelligence and machine learning)': 'CSE-AIML',
  'computer science and engineering (data science)': 'CSE-DS',
  'computer science and engineering (cyber security)': 'CSE-CS',
  'computer science and engineering (internet of things)': 'CSE-IOT',
  'computer science and engineering (iot)': 'CSE-IOT',
  'computer science and engineering (ai & ml)': 'CSE-AIML',
  'computer science': 'CS',
  'computer science & information technology': 'CSIT',
  'computer science and business system': 'CSBS',
  'computer science and design': 'CSD',
  'information technology': 'IT',
  'electronics and communication engineering': 'ECE',
  'electronics & communication engineering': 'ECE',
  'electrical engineering': 'EE',
  'electrical & electronics engineering': 'EEE',
  'mechanical engineering': 'ME',
  'civil engineering': 'CE',
  'chemical engineering': 'CHE',
  'biotechnology': 'BIOTECH',
  'biotechnology engineering': 'BIOTECH',
  'bio-medical engineering': 'BME',
  'biomedical engineering': 'BME',
  'food technology': 'FT',
  'textile engineering': 'TE',
  'mining engineering': 'MN',
  'electronics and instrumentation engineering': 'EI',
  'electronics & instrumentation engineering': 'EI',
  'instrumentation and control engineering': 'ICE',
  'aeronautical engineering': 'AE',
  'automobile engineering': 'AUTO',
  'plastic engineering': 'PE',
  'artificial intelligence and data science': 'AI-DS',
  'artificial intelligence (ai) and data science': 'AI-DS',
  'artificial intelligence and machine learning': 'AIML',
  'artificial intelligence (ai) and machine learning': 'AIML',
  'electronics and telecommunication engineering': 'ETE',
  'printing technology': 'PT',
  'leather technology': 'LT',
  'agricultural engineering': 'AG',
  'production engineering': 'PROD',
  'manufacturing technology': 'MT',
  'petroleum engineering': 'PETRO',
  'pharmaceutical engineering': 'PHARME',
  'fashion technology': 'FASH',
  'fire technology and safety engineering': 'FTSE',
  'robotics and automation': 'RA',
};

function getBranchCode(programName) {
  const lower = programName.toLowerCase().trim();
  // Exact match first
  if (BRANCH_CODE_MAP[lower]) return BRANCH_CODE_MAP[lower];
  // Partial match
  for (const [key, code] of Object.entries(BRANCH_CODE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return code;
  }
  // Generate code from name
  return programName
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase())
    .join('')
    .slice(0, 6) || 'OTHER';
}

// ---- City extraction from institute name ----
function extractCity(instituteName) {
  // Many UPTAC institute names end with city: "INSTITUTE OF TECHNOLOGY,LUCKNOW"
  const parts = instituteName.split(',');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].trim();
    // If it looks like a city name (short uppercase string)
    if (lastPart.length < 40) {
      return lastPart.split(' ').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');
    }
  }
  return '';
}

// ---- Region mapping from city ----
function getRegion(city) {
  const c = city.toLowerCase();
  const NCR = ['noida', 'greater noida', 'ghaziabad', 'meerut', 'gautam buddh nagar', 'bulandshahr', 'hapur', 'baghpat', 'muzaffarnagar'];
  const WESTERN = ['agra', 'mathura', 'aligarh', 'bareilly', 'moradabad', 'saharanpur', 'firozabad', 'mainpuri', 'etah', 'hathras', 'shahjahanpur', 'rampur', 'pilibhit', 'budaun', 'bijnor', 'amroha'];
  const CENTRAL = ['lucknow', 'kanpur', 'unnao', 'hardoi', 'sitapur', 'lakhimpur', 'rae bareli', 'raebareli', 'fatehpur', 'allahabad', 'prayagraj', 'etawah'];
  const EASTERN = ['varanasi', 'gorakhpur', 'sultanpur', 'ayodhya', 'faizabad', 'jaunpur', 'azamgarh', 'basti', 'deoria', 'ballia', 'ghazipur', 'mirzapur', 'sonbhadra', 'ambedkar nagar', 'barabanki', 'pratapgarh', 'mau'];
  const BUNDEL = ['jhansi', 'banda', 'chitrakoot', 'hamirpur', 'mahoba', 'jalaun', 'lalitpur'];

  if (NCR.some(x => c.includes(x))) return 'NCR';
  if (BUNDEL.some(x => c.includes(x))) return 'Bundelkhand';
  if (EASTERN.some(x => c.includes(x))) return 'Eastern UP';
  if (CENTRAL.some(x => c.includes(x))) return 'Central UP';
  if (WESTERN.some(x => c.includes(x))) return 'Western UP';
  return 'Other';
}

// ---- College type detection ----
function getCollegeType(name) {
  const lower = name.toLowerCase();
  const govtKeywords = ['government', 'rajkiya', 'harcourt butler', 'madan mohan malaviya university', 'kamla nehru institute of technology', 'bundelkhand institute of engineering', 'university', 'dr.', 'ch. charan singh'];
  if (govtKeywords.some(k => lower.includes(k))) return 'Government';
  return 'Private';
}

// ---- Round extraction ----
// The raw data may not have round info if scraped from "All Round" view
// We'll check if the data has round info, otherwise mark as "All"
function extractRound(record) {
  if (record.round) return String(record.round);
  // Try to extract from remark or other fields
  return '1'; // Default to round 1 if not specified
}

// ---- Main normalization ----
function normalize() {
  console.log('Reading raw data...');
  const rawPath = join(DATA_DIR, 'uptac-2025-btech-orcr-raw.json');
  let rawData;
  try {
    rawData = JSON.parse(readFileSync(rawPath, 'utf-8'));
  } catch (e) {
    console.error(`ERROR: Cannot read ${rawPath}. Run scraper first.`);
    process.exit(1);
  }

  const records = rawData.records || [];
  console.log(`Raw records: ${records.length}`);

  // ---- Validate ----
  let valid = 0, invalid = 0;
  const validRecords = [];
  for (const r of records) {
    if (!r.institute || !r.program || isNaN(r.openingRank) || isNaN(r.closingRank)) {
      invalid++;
      continue;
    }
    if (r.openingRank <= 0 || r.closingRank <= 0) {
      invalid++;
      continue;
    }
    valid++;
    validRecords.push(r);
  }
  console.log(`Valid: ${valid}, Invalid: ${invalid}`);

  // ---- Normalize cutoffs ----
  const cutoffs = validRecords.map(r => {
    const collegeId = slugify(r.institute);
    const branchCode = getBranchCode(r.program);
    return {
      collegeId,
      collegeName: r.institute,
      branchCode,
      branchName: r.program,
      stream: r.stream || 'B.Tech',
      round: extractRound(r),
      quota: r.quota || 'Home State',
      category: r.category || 'OPEN',
      seatGender: r.seatGender || 'Both Male and Female Seats',
      openingRank: Math.round(r.openingRank),
      closingRank: Math.round(r.closingRank),
      remark: r.remark || '',
      year: '2025',
      sourceRef: 'Official UPTAC 2025 B.Tech Counselling OR-CR (admissions.nic.in)',
    };
  });

  // ---- Extract unique colleges ----
  const collegeMap = new Map();
  for (const c of cutoffs) {
    if (!collegeMap.has(c.collegeId)) {
      const city = extractCity(c.collegeName);
      collegeMap.set(c.collegeId, {
        id: c.collegeId,
        name: c.collegeName,
        shortName: c.collegeName.length > 40 
          ? c.collegeName.split(',')[0].slice(0, 40) 
          : c.collegeName,
        city,
        region: getRegion(city),
        type: getCollegeType(c.collegeName),
        branches: [],
        year: '2025',
        sourceRef: 'Official UPTAC 2025',
      });
    }
    const college = collegeMap.get(c.collegeId);
    if (!college.branches.includes(c.branchCode)) {
      college.branches.push(c.branchCode);
    }
  }
  const colleges = Array.from(collegeMap.values());
  console.log(`Unique colleges: ${colleges.length}`);

  // ---- Extract unique branches ----
  const branchMap = new Map();
  for (const c of cutoffs) {
    if (!branchMap.has(c.branchCode)) {
      branchMap.set(c.branchCode, {
        code: c.branchCode,
        name: c.branchName,
        shortName: c.branchCode,
        popular: ['CSE', 'IT', 'ECE', 'CSE-AI', 'CSE-DS', 'AIML', 'AI-DS', 'CSE-AIML'].includes(c.branchCode),
      });
    }
  }
  const branches = Array.from(branchMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  console.log(`Unique branches: ${branches.length}`);

  // ---- Extract unique categories ----
  const categories = [...new Set(cutoffs.map(c => c.category))].sort();
  console.log(`Unique categories: ${categories.length}`);

  // ---- Save normalized data ----
  writeFileSync(join(DATA_DIR, 'cutoffs-2025.json'), JSON.stringify(cutoffs, null, 2), 'utf-8');
  writeFileSync(join(DATA_DIR, 'colleges-2025.json'), JSON.stringify(colleges, null, 2), 'utf-8');
  writeFileSync(join(DATA_DIR, 'branches-2025.json'), JSON.stringify(branches, null, 2), 'utf-8');

  const metadata = {
    dataYear: '2025',
    counselling: 'UPTAC B.Tech. Counselling 2025',
    source: 'https://uptac.admissions.nic.in/or-cr/',
    normalizedAt: new Date().toISOString(),
    totalCutoffRecords: cutoffs.length,
    totalColleges: colleges.length,
    totalBranches: branches.length,
    categories,
    rounds: [...new Set(cutoffs.map(c => c.round))].sort(),
    quotas: [...new Set(cutoffs.map(c => c.quota))],
    seatGenders: [...new Set(cutoffs.map(c => c.seatGender))],
  };
  writeFileSync(join(DATA_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');

  console.log(`\n✅ Normalization complete!`);
  console.log(`   Cutoffs: ${cutoffs.length} records → cutoffs-2025.json`);
  console.log(`   Colleges: ${colleges.length} → colleges-2025.json`);
  console.log(`   Branches: ${branches.length} → branches-2025.json`);
  console.log(`   Metadata: → metadata.json`);
}

normalize();
