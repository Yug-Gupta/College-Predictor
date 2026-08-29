// ============================================
// HOME.JS — Landing Page (Official Data)
// ============================================

import { colleges } from '../data/colleges.js';
import { cutoffs, DATA_YEAR, DATA_SOURCE, TOTAL_RECORDS } from '../data/cutoffs.js';
import { branches } from '../data/branches.js';

export async function renderHome() {
  const totalColleges = colleges.length;
  const totalBranches = branches.length;
  const totalDataPoints = cutoffs.length;

  return `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content reveal">
          <div class="hero-badge">
            <span class="dot"></span>
            Based on Official UPTAC ${DATA_YEAR} Data · Estimated for 2026
          </div>
          <h1>Find Your Best <span class="highlight">Engineering College</span></h1>
          <p>Predict your admission chances at ${totalColleges}+ AKTU colleges using ${totalDataPoints.toLocaleString()} official data points from UPTAC ${DATA_YEAR} counselling. Free and transparent.</p>
          <div class="hero-actions">
            <a href="#/predict" data-link class="btn btn-primary btn-lg btn-ripple">
              <i data-lucide="search" style="width:20px;height:20px;"></i>
              Predict My College
            </a>
            <a href="#/guide" data-link class="btn btn-outline btn-lg">
              <i data-lucide="book-open" style="width:20px;height:20px;"></i>
              Counselling Guide
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <div class="container">
      <div class="stats-bar stagger-in reveal">
        <div class="stat-item">
          <div class="stat-number count-up">${totalColleges}+</div>
          <div class="stat-text">AKTU Colleges</div>
        </div>
        <div class="stat-item">
          <div class="stat-number count-up">${totalBranches}+</div>
          <div class="stat-text">B.Tech Branches</div>
        </div>
        <div class="stat-item">
          <div class="stat-number count-up">${totalDataPoints.toLocaleString()}</div>
          <div class="stat-text">Official Records</div>
        </div>
        <div class="stat-item">
          <div class="stat-number count-up">${DATA_YEAR}→26</div>
          <div class="stat-text">Counselling Ready</div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="overline">Why Choose Us</span>
          <h2>Everything You Need for UPTAC Counselling</h2>
          <p>Built by students, for students. Get accurate predictions and make informed decisions about your engineering career.</p>
        </div>
        <div class="grid grid-3 gap-lg stagger-in reveal">
          <div class="card feature-card hover-lift">
            <div class="feature-icon">
              <i data-lucide="target"></i>
            </div>
            <div class="feature-text">
              <h3>Official Data-Driven</h3>
              <p>Based on ${TOTAL_RECORDS.toLocaleString()} official UPTAC ${DATA_YEAR} OR-CR records from admissions.nic.in. Every prediction is backed by real cutoff data.</p>
            </div>
          </div>
          <div class="card feature-card hover-lift">
            <div class="feature-icon">
              <i data-lucide="columns-2"></i>
            </div>
            <div class="feature-text">
              <h3>Compare Colleges</h3>
              <p>Side-by-side comparison of up to 3 colleges. Compare cutoffs, packages, NAAC grades, and more.</p>
            </div>
          </div>
          <div class="card feature-card hover-lift">
            <div class="feature-icon">
              <i data-lucide="download"></i>
            </div>
            <div class="feature-text">
              <h3>Save & Export</h3>
              <p>Bookmark your top choices, export results as CSV, and access your saved list anytime.</p>
            </div>
          </div>
          <div class="card feature-card hover-lift">
            <div class="feature-icon">
              <i data-lucide="filter"></i>
            </div>
            <div class="feature-text">
              <h3>Smart Filters</h3>
              <p>Filter by chance level, college type, region, branch, and sort by multiple criteria for precise results.</p>
            </div>
          </div>
          <div class="card feature-card hover-lift">
            <div class="feature-icon">
              <i data-lucide="palette"></i>
            </div>
            <div class="feature-text">
              <h3>5 Beautiful Themes</h3>
              <p>Switch between Indigo Pro, Midnight Dark, Ocean Breeze, Sunset Warm, and Forest Green themes.</p>
            </div>
          </div>
          <div class="card feature-card hover-lift">
            <div class="feature-icon">
              <i data-lucide="smartphone"></i>
            </div>
            <div class="feature-text">
              <h3>Mobile Friendly</h3>
              <p>Fully responsive design that works flawlessly on phone, tablet, and desktop screens.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="section">
      <div class="container">
        <div class="how-it-works-section">
          <div class="container-sm">
            <div class="section-header reveal">
              <span class="overline">Simple Process</span>
              <h2>How It Works</h2>
              <p>Get your college predictions in 3 easy steps</p>
            </div>
            <div class="steps-grid stagger-in reveal">
              <div class="step-card">
                <div class="step-number">1</div>
                <h3>Enter Your Details</h3>
                <p>Fill in your JEE Main rank, category, quota, and branch preferences.</p>
              </div>
              <div class="step-card">
                <div class="step-number">2</div>
                <h3>Get Predictions</h3>
                <p>Our engine matches your rank against 2025 cutoff data to predict 2026 chances.</p>
              </div>
              <div class="step-card">
                <div class="step-number">3</div>
                <h3>Make Decisions</h3>
                <p>Compare, save, and export your top college picks. Make informed choices for counselling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section-sm">
      <div class="container-sm">
        <div class="card surface-elevated reveal" style="text-align:center; padding:3rem 2rem;">
          <h2 style="margin-bottom:0.75rem;">Ready to Find Your College?</h2>
          <p style="margin-bottom:1.5rem; max-width:480px; margin-left:auto; margin-right:auto; color:var(--text-secondary);">Enter your rank and get instant predictions for 2026 UPTAC counselling. It's free, fast, and accurate.</p>
          <a href="#/predict" data-link class="btn btn-primary btn-lg btn-ripple">
            <i data-lucide="arrow-right" style="width:20px;height:20px;"></i>
            Start Predicting Now
          </a>
        </div>
      </div>
    </section>
  `;
}
