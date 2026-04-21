/**
 * Reef Fish Survey Helper — content.js
 *
 * On hover over a species row, fetches a photo from the iNaturalist
 * API and shows it in a floating tooltip alongside the names.
 * Results are cached in memory for the page session so each species
 * is only fetched once no matter how many times you hover it.
 */

(function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────────────────────

  /** @type {Map<string, {imageUrl: string, taxonUrl: string} | null>} */
  const cache = new Map();

  /** @type {HTMLElement|null} */
  let activeTooltip = null;

  /** @type {AbortController|null} */
  let activeFetch = null;

  // ─── DOM helpers ──────────────────────────────────────────────────────────

  /**
   * Extract the common name and best available scientific name from a row.
   * The HTML structure per row is:
   *   <td class="fishdisplay">0003</td>
   *   <td class="fishdisplay">French Angelfish <i>(Pomacanthus paru)</i></td>
   *
   * Some rows have complex entries like:
   *   "Bridled Goby Complex … <i>(C. glaucofraenum/C. venezuelae/…)</i>"
   * In that case we take only the first name in the slash-list.
   *
   * @param {HTMLTableRowElement} row
   * @returns {{ commonName: string, scientificName: string } | null}
   */
  function parseRow(row) {
    const cells = row.querySelectorAll('td.fishdisplay');
    if (cells.length < 2) return null;

    const nameCell = cells[1];
    const italic = nameCell.querySelector('i');
    if (!italic) return null;

    // Scientific name: strip parens, take first if slash-separated
    const rawSci = italic.textContent.replace(/[()]/g, '').trim();
    const scientificName = rawSci.split('/')[0].trim();
    if (!scientificName) return null;

    // Common name: text in the cell before the italic element, stripped
    const commonName = nameCell.childNodes[0]?.textContent?.trim()
      || nameCell.textContent.split('(')[0].trim();

    return { commonName, scientificName };
  }

  // ─── iNaturalist API ──────────────────────────────────────────────────────

  /**
   * Fetches the best matching taxon photo for a scientific name.
   * Returns null on any failure or if no photo is available.
   *
   * @param {string} scientificName
   * @param {AbortSignal} signal
   * @returns {Promise<{imageUrl: string, taxonUrl: string} | null>}
   */
  async function fetchSpeciesData(scientificName, signal) {
    if (cache.has(scientificName)) {
      return cache.get(scientificName);
    }

    const apiUrl =
      'https://api.inaturalist.org/v1/taxa?' +
      new URLSearchParams({
        q: scientificName,
        per_page: '1',
        order: 'desc',
        order_by: 'observations_count',
      });

    try {
      const res = await fetch(apiUrl, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const taxon = data.results?.[0];
      const photo = taxon?.default_photo;

      const value = photo
        ? {
            imageUrl: photo.square_url,          // 75 × 75 — fast for a tooltip
            taxonUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
          }
        : null;

      cache.set(scientificName, value);
      return value;
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Cache null so we don't keep hammering the API for the same miss
        cache.set(scientificName, null);
      }
      return null;
    }
  }

  // ─── Tooltip ──────────────────────────────────────────────────────────────

  function buildTooltip() {
    const tip = document.createElement('div');
    tip.className = 'rfsh-tooltip';
    tip.innerHTML = `
      <div class="rfsh-photo-wrap">
        <span class="rfsh-spinner" aria-hidden="true"></span>
        <img class="rfsh-photo" alt="" />
      </div>
      <div class="rfsh-meta">
        <span class="rfsh-common"></span>
        <span class="rfsh-sci"></span>
        <a class="rfsh-credit" href="#" target="_blank" rel="noopener noreferrer">
          iNaturalist ↗
        </a>
      </div>
    `;
    document.body.appendChild(tip);
    return tip;
  }

  /**
   * Position the tooltip below/right of the row, clamped inside the viewport.
   * @param {HTMLElement} tip
   * @param {HTMLTableRowElement} row
   */
  function positionTooltip(tip, row) {
    const rect = row.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const TIP_W = 260; // matches CSS width
    const GAP = 6;

    let top = rect.bottom + scrollY + GAP;
    let left = rect.left + scrollX;

    // Don't bleed off the right edge
    const maxLeft = scrollX + document.documentElement.clientWidth - TIP_W - 8;
    if (left > maxLeft) left = maxLeft;

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }

  function destroyTooltip() {
    if (activeFetch) {
      activeFetch.abort();
      activeFetch = null;
    }
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  async function onRowEnter(e) {
    const row = /** @type {HTMLTableRowElement} */ (e.currentTarget);
    const parsed = parseRow(row);
    if (!parsed) return;

    destroyTooltip();
    activeFetch = new AbortController();

    const tip = buildTooltip();
    activeTooltip = tip;

    // Populate text immediately so the tooltip appears with names right away
    tip.querySelector('.rfsh-common').textContent = parsed.commonName;
    tip.querySelector('.rfsh-sci').textContent = parsed.scientificName;

    positionTooltip(tip, row);

    // Small rAF delay keeps it feeling snappy rather than flicker-y
    requestAnimationFrame(() => tip.classList.add('rfsh-visible'));

    // Fetch the photo
    const result = await fetchSpeciesData(parsed.scientificName, activeFetch.signal);

    // Guard: tooltip may have been destroyed while we were fetching
    if (!activeTooltip || activeTooltip !== tip) return;

    const spinner = tip.querySelector('.rfsh-spinner');
    const img     = tip.querySelector('.rfsh-photo');
    const credit  = tip.querySelector('.rfsh-credit');

    spinner.style.display = 'none';

    if (result?.imageUrl) {
      img.src = result.imageUrl;
      img.style.display = 'block';
      credit.href = result.taxonUrl;

      img.onerror = () => {
        img.style.display = 'none';
        showFishFallback(spinner);
      };
    } else {
      showFishFallback(spinner);
    }
  }

  function showFishFallback(spinnerEl) {
    spinnerEl.textContent = '🐠';
    spinnerEl.classList.add('rfsh-fallback-icon');
    spinnerEl.style.display = 'block';
  }

  function onRowLeave() {
    // Snapshot which tooltip is active right now. If mouseenter on another row
    // fires before the timeout, activeTooltip will have been replaced — in that
    // case we leave the new one alone and only clean up the one we left.
    const tipAtLeave = activeTooltip;
    setTimeout(() => {
      if (activeTooltip === tipAtLeave) {
        destroyTooltip();
      }
    }, 80);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    const rows = document.querySelectorAll(
      '.fishdarkcolor, .fishlightcolor, .fishrarecolor'
    );

    if (rows.length === 0) return; // Not a survey page

    rows.forEach((row) => {
      row.addEventListener('mouseenter', onRowEnter);
      row.addEventListener('mouseleave', onRowLeave);
    });

    console.log(
      `[Reef Fish Helper] Ready — watching ${rows.length} species rows.`
    );
  }

  /**
   * Some reef.org survey pages render the species table inside an iframe, or
   * inject it after DOMContentLoaded. We try right away, and if the rows
   * aren't present yet we watch with a MutationObserver (gives up after 15 s).
   */
  function tryInit() {
    const rows = document.querySelectorAll(
      '.fishdarkcolor, .fishlightcolor, .fishrarecolor'
    );
    if (rows.length > 0) {
      init();
      return true;
    }
    return false;
  }

  if (!tryInit()) {
    const observer = new MutationObserver(() => {
      if (tryInit()) observer.disconnect();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => observer.disconnect(), 15000);
  }
})();
