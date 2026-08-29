// ============================================
// GUIDE.JS — Counselling Guide + FAQ Page
// ============================================

export async function renderGuide() {
  return `
    <div class="guide-page">
      <div class="container">
        <!-- Guide Hero -->
        <div class="guide-hero reveal">
          <h1>UPTAC Counselling Guide 2026</h1>
          <p>Everything you need to know about the UPTAC/AKTU B.Tech counselling process</p>
        </div>

        <div class="guide-content">
          <!-- Side Navigation -->
          <nav class="guide-nav reveal">
            <a href="javascript:void(0)" onclick="document.getElementById('sec-overview').scrollIntoView({behavior:'smooth'})" class="active">Overview</a>
            <a href="javascript:void(0)" onclick="document.getElementById('sec-process').scrollIntoView({behavior:'smooth'})">Process</a>
            <a href="javascript:void(0)" onclick="document.getElementById('sec-documents').scrollIntoView({behavior:'smooth'})">Documents</a>
            <a href="javascript:void(0)" onclick="document.getElementById('sec-categories').scrollIntoView({behavior:'smooth'})">Categories</a>
            <a href="javascript:void(0)" onclick="document.getElementById('sec-tips').scrollIntoView({behavior:'smooth'})">Tips & Strategy</a>
            <a href="javascript:void(0)" onclick="document.getElementById('sec-dates').scrollIntoView({behavior:'smooth'})">Important Dates</a>
            <a href="javascript:void(0)" onclick="document.getElementById('sec-faq').scrollIntoView({behavior:'smooth'})">FAQ</a>
          </nav>

          <!-- Guide Sections -->
          <div>
            <!-- Overview -->
            <div class="guide-section reveal" id="sec-overview">
              <h2>What is UPTAC Counselling?</h2>
              <p>UPTAC (Uttar Pradesh Technical Admission Counselling) is the centralized counselling process conducted by Dr. A.P.J. Abdul Kalam Technical University (AKTU) for admission to B.Tech, B.Arch, B.Pharm, and other technical programs in Uttar Pradesh.</p>
              <p>Admissions are primarily based on <strong>JEE Main</strong> ranks. The counselling is conducted online through the official NIC portal at <a href="https://uptac.admissions.nic.in" target="_blank" rel="noopener" style="color:var(--accent-primary);text-decoration:underline;">uptac.admissions.nic.in</a>.</p>
              
              <h3>Key Highlights</h3>
              <ul>
                <li>Covers 500+ engineering colleges across Uttar Pradesh</li>
                <li>Both Government and Private colleges participate</li>
                <li>Multiple rounds of seat allotment (typically 4 rounds)</li>
                <li>Separate quotas for Home State and All India candidates</li>
                <li>Category-based reservations as per government norms</li>
              </ul>
            </div>

            <!-- Process -->
            <div class="guide-section reveal" id="sec-process">
              <h2>Counselling Process</h2>
              <p>The UPTAC counselling follows a structured step-by-step process:</p>

              <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem;">
                <div class="card" style="padding:1.25rem;border-left:3px solid var(--accent-primary);">
                  <h4 style="color:var(--accent-primary);margin-bottom:0.25rem;">Step 1: Registration</h4>
                  <p>Register on the official UPTAC portal with your JEE Main roll number, personal details, and create login credentials. Pay the registration fee online.</p>
                </div>
                <div class="card" style="padding:1.25rem;border-left:3px solid var(--accent-primary);">
                  <h4 style="color:var(--accent-primary);margin-bottom:0.25rem;">Step 2: Choice Filling</h4>
                  <p>Browse available colleges and branches. Fill your preferences in order of priority. You can add up to 100+ choices. Lock your choices before the deadline.</p>
                </div>
                <div class="card" style="padding:1.25rem;border-left:3px solid var(--accent-primary);">
                  <h4 style="color:var(--accent-primary);margin-bottom:0.25rem;">Step 3: Seat Allotment</h4>
                  <p>Based on your rank, category, and preferences, the system allocates you a seat. Check your allotment result on the portal.</p>
                </div>
                <div class="card" style="padding:1.25rem;border-left:3px solid var(--accent-primary);">
                  <h4 style="color:var(--accent-primary);margin-bottom:0.25rem;">Step 4: Fee Payment & Freeze/Float</h4>
                  <p>Pay the seat acceptance fee. Choose to <strong>Freeze</strong> (keep current seat) or <strong>Float</strong> (participate in next round for upgrade). Slide-up option allows upgrade within same college.</p>
                </div>
                <div class="card" style="padding:1.25rem;border-left:3px solid var(--accent-primary);">
                  <h4 style="color:var(--accent-primary);margin-bottom:0.25rem;">Step 5: Reporting to College</h4>
                  <p>After final allotment, report to your allotted college with all original documents for physical verification and admission confirmation.</p>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div class="guide-section reveal" id="sec-documents">
              <h2>Required Documents</h2>
              <p>Keep the following documents ready for counselling and college reporting:</p>
              <div style="display:flex;flex-direction:column;gap:0.25rem;margin-top:1rem;">
                ${[
                  'JEE Main Scorecard / Rank Card',
                  'Class 10th Marksheet & Certificate',
                  'Class 12th Marksheet & Certificate',
                  'Domicile Certificate (UP domicile for Home State quota)',
                  'Category Certificate (SC/ST/OBC/EWS if applicable)',
                  'Income Certificate (for EWS candidates)',
                  'Transfer Certificate',
                  'Migration Certificate',
                  'Character Certificate',
                  'Aadhar Card',
                  'Passport-size Photographs (8-10 copies)',
                  'Medical Fitness Certificate',
                  'Anti-Ragging Affidavit (can be done online)',
                ].map(doc => `
                  <div class="checklist-item">
                    <div class="checklist-icon"><i data-lucide="check" style="width:12px;height:12px;"></i></div>
                    <span>${doc}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Categories -->
            <div class="guide-section reveal" id="sec-categories">
              <h2>Category & Reservation</h2>
              <p>Seat reservation in UPTAC follows Uttar Pradesh state reservation policy:</p>
              <div style="overflow-x:auto;margin-top:1rem;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Reservation %</th>
                      <th>Sub-categories</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>General (OPEN)</td><td>Unreserved</td><td>OPEN, OPEN(GIRL), OPEN(AF), OPEN(FF), OPEN(PH), OPEN(TF)</td></tr>
                    <tr><td>OBC (BC)</td><td>27%</td><td>BC, BC(Girl), BC(AF), BC(PH), BC(FF)</td></tr>
                    <tr><td>SC</td><td>21%</td><td>SC, SC(Girl), SC(AF), SC(PH)</td></tr>
                    <tr><td>ST</td><td>2%</td><td>ST, ST(Girl)</td></tr>
                    <tr><td>EWS</td><td>10%</td><td>EWS(OPEN), EWS(GL), EWS(AF), EWS(PH)</td></tr>
                  </tbody>
                </table>
              </div>
              <p style="margin-top:0.75rem;"><strong>Note:</strong> AF = Armed Forces, FF = Freedom Fighter, PH = Physically Handicapped, TF = Tuition Fee waiver, GL = Girl.</p>
            </div>

            <!-- Tips -->
            <div class="guide-section reveal" id="sec-tips">
              <h2>Counselling Tips & Strategy</h2>
              <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem;">
                <div class="card" style="padding:1.25rem;">
                  <h4 style="margin-bottom:0.25rem;">📊 Use Data, Not Emotions</h4>
                  <p>Look at previous year cutoffs carefully. Use our predictor tool to understand your realistic options before filling choices.</p>
                </div>
                <div class="card" style="padding:1.25rem;">
                  <h4 style="margin-bottom:0.25rem;">📋 Fill Maximum Choices</h4>
                  <p>Don't limit yourself. Fill as many choices as possible in order of your genuine preference. Having more options increases your chances.</p>
                </div>
                <div class="card" style="padding:1.25rem;">
                  <h4 style="margin-bottom:0.25rem;">🎯 Branch Over College</h4>
                  <p>For most students, getting CSE/IT at a decent college is better than a less-demanded branch at a top college. Placements are heavily branch-dependent.</p>
                </div>
                <div class="card" style="padding:1.25rem;">
                  <h4 style="margin-bottom:0.25rem;">🔄 Use Float Wisely</h4>
                  <p>If you get a decent seat but want better, choose Float to participate in the next round. You keep your current seat as backup while competing for upgrades.</p>
                </div>
                <div class="card" style="padding:1.25rem;">
                  <h4 style="margin-bottom:0.25rem;">⏰ Never Miss Deadlines</h4>
                  <p>UPTAC deadlines are strict. Missing a fee payment or reporting deadline means losing your seat with no way back. Set multiple reminders.</p>
                </div>
              </div>
            </div>

            <!-- Important Dates -->
            <div class="guide-section reveal" id="sec-dates">
              <h2>Important Dates (2026)</h2>
              <div class="card" style="padding:1.5rem;border-left:3px solid var(--chance-moderate);">
                <p style="color:var(--chance-moderate);font-weight:600;margin-bottom:0.5rem;">⚠️ Dates To Be Announced</p>
                <p>The official UPTAC 2026 counselling schedule has not been released yet. Dates are typically announced after JEE Main results. Check the official portal <a href="https://uptac.admissions.nic.in" target="_blank" rel="noopener" style="color:var(--accent-primary);text-decoration:underline;">uptac.admissions.nic.in</a> for updates.</p>
                <p style="margin-top:0.5rem;"><strong>Expected timeline (based on previous years):</strong></p>
                <ul style="list-style:disc;padding-left:1.5rem;margin-top:0.5rem;">
                  <li>Registration: July – August 2026</li>
                  <li>Choice Filling: August 2026</li>
                  <li>Round 1 Allotment: August – September 2026</li>
                  <li>Round 2-4: September – October 2026</li>
                  <li>Spot Round: October – November 2026</li>
                </ul>
              </div>
            </div>

            <!-- FAQ -->
            <div class="guide-section reveal" id="sec-faq">
              <h2>Frequently Asked Questions</h2>
              <div style="margin-top:1rem;">
                ${[
                  {
                    q: 'What is the minimum JEE Main percentile required for UPTAC counselling?',
                    a: 'There is no fixed minimum percentile for UPTAC registration. However, your rank determines which colleges you can get. Generally, even lower-ranked candidates can find seats in private colleges during later rounds.'
                  },
                  {
                    q: 'Can students from other states apply for UPTAC counselling?',
                    a: 'Yes, UPTAC has an All India quota. Students from any state can apply under this quota. However, Home State (UP domicile) candidates have access to more seats.'
                  },
                  {
                    q: 'How accurate are these predictions?',
                    a: 'Our predictions are based on actual 2025 UPTAC counselling cutoff data with a small adjustment factor for 2026. While cutoffs change slightly each year, the predictions give a reliable estimate. Always verify with the official OR-CR data.'
                  },
                  {
                    q: 'What is the difference between Freeze, Float, and Slide?',
                    a: '<strong>Freeze:</strong> Accept your current seat and exit counselling. <strong>Float:</strong> Accept current seat but participate in next round for a better option. You keep your current seat as backup. <strong>Slide:</strong> Float within the same college for a better branch.'
                  },
                  {
                    q: 'Is it better to choose a Government college or a Private college?',
                    a: 'Government colleges generally have lower fees and decent placements. However, some top private colleges (like AKGEC, KIET) have NAAC A+ accreditation and excellent placement records that rival government institutions. Consider factors like placements, fees, location, and NAAC grade.'
                  },
                  {
                    q: 'Can I participate in later rounds if I don\'t get a seat in Round 1?',
                    a: 'Yes! You can participate in all rounds. Many seats open up in Round 2-4 as students upgrade, leave, or join other colleges. Don\'t lose hope after Round 1.'
                  },
                  {
                    q: 'What is UPTAC registration fee?',
                    a: 'The registration fee varies by category. General/OBC candidates typically pay ₹1500-3000, while SC/ST candidates pay a reduced fee. Check the official portal for exact amounts.'
                  },
                ].map(item => `
                  <div class="accordion-item">
                    <button class="accordion-trigger" onclick="this.parentElement.classList.toggle('open')">
                      <span>${item.q}</span>
                      <i data-lucide="chevron-down"></i>
                    </button>
                    <div class="accordion-content">
                      <div class="accordion-body">${item.a}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initGuideEvents() {
  // No special events needed
}
