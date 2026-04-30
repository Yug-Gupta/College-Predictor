#!/usr/bin/env node
// ============================================
// SCRAPE-UPTAC-ORCR.JS — Official UPTAC 2025 B.Tech OR-CR Data Scraper  
// ============================================
// Uses puppeteer-core with system Edge/Chrome to scrape the official
// UPTAC B.Tech OR-CR DataTable.
// 
// Strategy: Change the jQuery DataTable's page length to -1 (show all),
// then extract all rows in one go.

import puppeteer from 'puppeteer-core';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OR_CR_URL = 'https://admissions.nic.in/UPTAC/Applicant/report/orcrreport.aspx?enc=yVQCIiq12npg+pcvNJRdc/GVj72fs6Ji6wxGDt/K6WxOUJfHn2OTQgIkrZZ4Gmhy';
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data', 'official');
const OUTPUT_FILE = join(OUTPUT_DIR, 'uptac-2025-btech-orcr-raw.json');

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function scrape() {
  const browserPath = findBrowser();
  if (!browserPath) {
    console.error('ERROR: No Edge or Chrome browser found.');
    process.exit(1);
  }
  console.log(`Using browser: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  
  // Increase timeouts for the large page
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(120000);
  
  // Set a reasonable viewport
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to OR-CR page...');
  await page.goto(OR_CR_URL, { waitUntil: 'networkidle2', timeout: 120000 });
  
  // Wait for the DataTable to be initialized
  console.log('Waiting for DataTable to initialize...');
  await page.waitForFunction(() => {
    return document.querySelector('table') && 
           document.querySelectorAll('table tbody tr td').length > 0;
  }, { timeout: 60000 });

  // Wait a bit more for JS to fully load
  await new Promise(r => setTimeout(r, 5000));

  const totalText = await page.evaluate(() => {
    const el = document.querySelector('.red, [style*="color:red"], [style*="Red"]');
    return el ? el.textContent : document.body.textContent.substring(0, 500);
  });
  console.log('Page status:', totalText.substring(0, 100));

  // Try to change DataTable page length to show ALL records  
  console.log('Attempting to show all records...');

  // Method 1: Use jQuery DataTable API if available
  const dtApiResult = await page.evaluate(() => {
    // Try jQuery DataTable API
    if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
      const tables = jQuery('table').DataTable();
      if (tables) {
        // Get table info
        const info = tables.page.info();
        return { method: 'jQuery DataTable API', totalRecords: info.recordsTotal, pageLength: info.length };
      }
    }
    // Fallback: check for select element
    const selects = document.querySelectorAll('select[name*="length"], select[aria-controls]');
    const selectInfo = [];
    for (const s of selects) {
      selectInfo.push({
        name: s.name,
        id: s.id,
        options: Array.from(s.options).map(o => ({ value: o.value, text: o.text })),
      });
    }
    return { method: 'fallback', selects: selectInfo };
  });
  console.log('DataTable info:', JSON.stringify(dtApiResult));

  // Try to set page length to -1 (all) using different methods
  const setResult = await page.evaluate(() => {
    try {
      // Method 1: DataTable API
      if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
        const dt = jQuery('table').DataTable();
        dt.page.len(-1).draw();
        return { success: true, method: 'DataTable API', msg: 'Set page length to -1 (all)' };
      }
    } catch (e) { /* continue */ }
    
    try {
      // Method 2: Change the select dropdown
      const selects = document.querySelectorAll('select[name*="length"], select[aria-controls]');
      for (const s of selects) {
        // Add -1 option if not exists
        let allOption = Array.from(s.options).find(o => o.value === '-1');
        if (!allOption) {
          allOption = document.createElement('option');
          allOption.value = '-1';
          allOption.text = 'All';
          s.appendChild(allOption);
        }
        s.value = '-1';
        s.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, method: 'select change', msg: 'Set dropdown to All' };
      }
    } catch (e) { /* continue */ }
    
    return { success: false, msg: 'No method worked' };
  });
  console.log('Set page length result:', JSON.stringify(setResult));

  // Wait for DataTable to re-render with all records
  console.log('Waiting for all records to render (this may take 30-60 seconds)...');
  await new Promise(r => setTimeout(r, 30000));

  // Check how many rows are now visible
  const rowCount = await page.evaluate(() => {
    return document.querySelectorAll('table tbody tr').length;
  });
  console.log(`Visible rows after "show all": ${rowCount}`);

  // If show-all didn't work, try pagination approach
  let allRecords = [];
  
  if (rowCount > 500) {
    // Show all worked! Extract all data at once
    console.log('Extracting all records from DOM...');
    allRecords = await page.evaluate(() => {
      const rows = [];
      const trs = document.querySelectorAll('table tbody tr');
      for (const tr of trs) {
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 10) {
          const openingRank = tds[8]?.textContent?.trim();
          if (openingRank && !isNaN(parseFloat(openingRank))) {
            rows.push({
              round: tds[1]?.textContent?.trim(),
              institute: tds[2]?.textContent?.trim(),
              program: tds[3]?.textContent?.trim(),
              stream: tds[4]?.textContent?.trim(),
              quota: tds[5]?.textContent?.trim(),
              category: tds[6]?.textContent?.trim(),
              seatGender: tds[7]?.textContent?.trim(),
              openingRank: parseFloat(openingRank),
              closingRank: parseFloat(tds[9]?.textContent?.trim()),
              remark: tds[10]?.textContent?.trim() || '',
            });
          }
        }
      }
      return rows;
    });
    console.log(`Extracted ${allRecords.length} records in one shot!`);
  } else {
    // Pagination approach: extract page by page
    console.log('Show-all did not work. Using pagination approach...');
    
    // First, try to set page length to maximum available (100 or 50)
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select[name*="length"], select[aria-controls]');
      for (const s of selects) {
        // Find the largest value
        const maxOption = Array.from(s.options).reduce((max, o) => {
          const v = parseInt(o.value);
          return (!isNaN(v) && v > 0 && v > parseInt(max.value || '0')) ? o : max;
        }, s.options[0]);
        if (maxOption) {
          s.value = maxOption.value;
          s.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
    await new Promise(r => setTimeout(r, 3000));

    const newRowCount = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
    console.log(`Rows per page after max-size: ${newRowCount}`);

    // Get total page count
    const pageInfo = await page.evaluate(() => {
      const info = document.querySelector('.dataTables_info, [id*="info"]');
      return info ? info.textContent : '';
    });
    console.log(`Page info: ${pageInfo}`);

    // Extract current page
    let pageNum = 1;
    let hasNext = true;

    while (hasNext) {
      const pageRecords = await page.evaluate(() => {
        const rows = [];
        const trs = document.querySelectorAll('table tbody tr');
        for (const tr of trs) {
          // Skip hidden rows (DataTable hides non-current-page rows)
          if (tr.style.display === 'none') continue;
          const tds = tr.querySelectorAll('td');
          if (tds.length >= 10) {
            const openingRank = tds[8]?.textContent?.trim();
            if (openingRank && !isNaN(parseFloat(openingRank))) {
              rows.push({
                round: tds[1]?.textContent?.trim(),
                institute: tds[2]?.textContent?.trim(),
                program: tds[3]?.textContent?.trim(),
                stream: tds[4]?.textContent?.trim(),
                quota: tds[5]?.textContent?.trim(),
                category: tds[6]?.textContent?.trim(),
                seatGender: tds[7]?.textContent?.trim(),
                openingRank: parseFloat(openingRank),
                closingRank: parseFloat(tds[9]?.textContent?.trim()),
                remark: tds[10]?.textContent?.trim() || '',
              });
            }
          }
        }
        return rows;
      });

      allRecords.push(...pageRecords);

      if (pageNum % 10 === 0) {
        console.log(`Page ${pageNum}: +${pageRecords.length} records (total: ${allRecords.length})`);
      }

      // Click Next button
      hasNext = await page.evaluate(() => {
        const nextBtn = document.querySelector('a.paginate_button.next:not(.disabled), [id*="next"]:not(.disabled)');
        if (nextBtn && !nextBtn.classList.contains('disabled')) {
          nextBtn.click();
          return true;
        }
        return false;
      });

      if (hasNext) {
        await new Promise(r => setTimeout(r, 500)); // Small delay between pages
      }

      pageNum++;

      // Safety limit
      if (pageNum > 2000) {
        console.log('Hit safety limit of 2000 pages. Stopping.');
        break;
      }
    }
    console.log(`Pagination complete. Total pages: ${pageNum - 1}`);
  }

  // Deduplicate records (same institute+program+round+category+quota+gender)
  const seen = new Set();
  const dedupedRecords = [];
  for (const r of allRecords) {
    const key = `${r.round}|${r.institute}|${r.program}|${r.category}|${r.quota}|${r.seatGender}`;
    if (!seen.has(key)) {
      seen.add(key);
      dedupedRecords.push(r);
    }
  }
  console.log(`After dedup: ${dedupedRecords.length} records (removed ${allRecords.length - dedupedRecords.length} duplicates)`);

  // Add metadata
  const enrichedRecords = dedupedRecords.map(r => ({
    ...r,
    year: '2025',
    sourceRef: 'Official UPTAC 2025 B.Tech Counselling OR-CR (admissions.nic.in)',
  }));

  // Save output
  const output = {
    metadata: {
      source: 'https://uptac.admissions.nic.in/or-cr/',
      sourceUrl: OR_CR_URL,
      dataYear: '2025',
      counselling: 'UPTAC B.Tech. Counselling 2025',
      scrapedAt: new Date().toISOString(),
      totalRecords: enrichedRecords.length,
      uniqueInstitutes: [...new Set(enrichedRecords.map(r => r.institute))].length,
      uniquePrograms: [...new Set(enrichedRecords.map(r => r.program))].length,
      rounds: [...new Set(enrichedRecords.map(r => r.round))].sort(),
    },
    records: enrichedRecords,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Scraping complete!`);
  console.log(`   Records: ${enrichedRecords.length}`);
  console.log(`   Institutes: ${output.metadata.uniqueInstitutes}`);
  console.log(`   Programs: ${output.metadata.uniquePrograms}`);
  console.log(`   Rounds: ${output.metadata.rounds.join(', ')}`);
  console.log(`   Output: ${OUTPUT_FILE}`);

  await browser.close();
}

scrape().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
