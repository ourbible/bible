// script.js (full, patched for SEO-friendly path routing)
// Base path to handle GitHub Pages folder
const BASE_PATH = "/bible";

let bibleData = {};
let currentBook = "Genesis";
let currentChapter = 1;
let currentVerse = 1;
let _searchResultsListenerAttached = false;

// === Helper: escape HTML ===
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// === Meta helpers ===
function updateMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content || "");
}

function updatePageMeta(title, description, keywords) {
  if (title) document.title = title;
  updateMeta("description", description || "");
  updateMeta("keywords", keywords || "");
}

// === Load Bible JSON ===
fetch("kjv_nested.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load kjv_nested.json");
    return res.json();
  })
  .then(data => {
    bibleData = data;
    initSelectors();
    loadFromURL();
  })
  .catch(err => {
    console.error("Error loading Bible JSON:", err);
    document.getElementById("output").innerHTML = "<p class='text-red-600'>Failed to load Bible data.</p>";
  });

// === Initialize dropdowns ===
function initSelectors() {
  const bookSelect = document.getElementById("book");
  const chapterSelect = document.getElementById("chapter");
  const verseSelect = document.getElementById("verse");
  const searchBook = document.getElementById("searchBook");
  const searchBox = document.getElementById("searchBox");
  const searchBtn = document.querySelector("button[onclick='searchBible()'], button#searchBtn");

  if (!bookSelect || !chapterSelect || !verseSelect || !searchBook || !searchBox) {
    console.error("Missing expected DOM elements");
    return;
  }

  Object.keys(bibleData).forEach(book => {
    bookSelect.add(new Option(book, book));
    searchBook.add(new Option(book, book));
  });

  bookSelect.value = currentBook;
  updateChapters();
  updateVerses();

  bookSelect.addEventListener("change", () => {
    currentBook = bookSelect.value;
    currentChapter = 1;
    currentVerse = 1;
    updateChapters();
    updateVerses();
    showChapter();
  });

  chapterSelect.addEventListener("change", () => {
    currentChapter = parseInt(chapterSelect.value, 10) || 1;
    currentVerse = 1;
    updateVerses();
    showChapter();
  });

  verseSelect.addEventListener("change", () => {
    currentVerse = parseInt(verseSelect.value, 10) || 1;
    showVerse();
  });

  searchBox.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBible();
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", e => {
      e.preventDefault();
      searchBible();
    });
  }

  attachSearchResultsListener();
}

// === Update chapters/verses ===
function updateChapters() {
  const chapterSelect = document.getElementById("chapter");
  if (!chapterSelect) return;
  chapterSelect.innerHTML = "";
  const totalChapters = Object.keys(bibleData[currentBook] || {}).length || 0;
  for (let i = 1; i <= totalChapters; i++) chapterSelect.add(new Option(i, i));
  if (!currentChapter || currentChapter < 1) currentChapter = 1;
  if (currentChapter > totalChapters) currentChapter = totalChapters || 1;
  chapterSelect.value = currentChapter;
}

function updateVerses() {
  const verseSelect = document.getElementById("verse");
  if (!verseSelect) return;
  verseSelect.innerHTML = "";
  const chapterObj = bibleData[currentBook] && bibleData[currentBook][currentChapter];
  const totalVerses = chapterObj ? Object.keys(chapterObj).length : 0;
  for (let i = 1; i <= totalVerses; i++) verseSelect.add(new Option(i, i));
  if (!currentVerse || currentVerse < 1) currentVerse = 1;
  if (currentVerse > totalVerses) currentVerse = totalVerses || 1;
  verseSelect.value = currentVerse;
}

// === Show verse ===
function showVerse(push = true) {
  if (!bibleData || !bibleData[currentBook] || !bibleData[currentBook][currentChapter]) {
    document.getElementById("output").innerHTML = "<p class='text-red-600'>Verse not found.</p>";
    return;
  }

  const verseTextRaw = bibleData[currentBook][currentChapter][currentVerse];
  const verseText = escapeHtml(verseTextRaw);

  const searchResultsEl = document.getElementById("searchResults");
  const outputEl = document.getElementById("output");
  if (searchResultsEl) searchResultsEl.innerHTML = "";
  if (outputEl) outputEl.innerHTML = "";

  if (outputEl) {
    outputEl.innerHTML = `
      <div class="chapter-title">${escapeHtml(currentBook)} ${currentChapter}:${currentVerse}</div>
      <p class="verse-card"><span class="verse-number">${currentVerse}</span> ${verseText}</p>
    `;
  }

  const bookSelect = document.getElementById("book");
  if (bookSelect) bookSelect.value = currentBook;
  updateChapters();
  const chapterSelect = document.getElementById("chapter");
  if (chapterSelect) chapterSelect.value = currentChapter;
  updateVerses();
  const verseSelect = document.getElementById("verse");
  if (verseSelect) verseSelect.value = currentVerse;

  updatePageMeta(
    `${currentBook} ${currentChapter}:${currentVerse} (KJV) | OurBible`,
    `${currentBook} ${currentChapter}:${currentVerse} - ${verseTextRaw}`,
    `${currentBook}, ${currentBook} ${currentChapter}, ${currentBook} ${currentChapter}:${currentVerse}, Bible, KJV`
  );

  if (push) {
    const path = `${BASE_PATH}/${encodeURIComponent(currentBook)}/${currentChapter}/${currentVerse}`;
    history.pushState({ book: currentBook, chapter: currentChapter, verse: currentVerse }, "", path);
  }
}

// === Show chapter ===
function showChapter(push = true) {
  if (!bibleData || !bibleData[currentBook] || !bibleData[currentBook][currentChapter]) {
    document.getElementById("output").innerHTML = "<p class='text-red-600'>Chapter not found.</p>";
    return;
  }

  const verses = bibleData[currentBook][currentChapter];
  const searchResultsEl = document.getElementById("searchResults");
  const outputEl = document.getElementById("output");
  if (searchResultsEl) searchResultsEl.innerHTML = "";
  if (outputEl) outputEl.innerHTML = "";

  let html = `<div class="chapter-title">${escapeHtml(currentBook)} ${currentChapter}</div>`;
  Object.keys(verses).forEach(v => {
    html += `<p class="verse-card"><span class="verse-number">${v}</span> ${escapeHtml(verses[v])}</p>`;
  });
  if (outputEl) outputEl.innerHTML = html;

  const bookSelect = document.getElementById("book");
  if (bookSelect) bookSelect.value = currentBook;
  updateChapters();
  const chapterSelect = document.getElementById("chapter");
  if (chapterSelect) chapterSelect.value = currentChapter;
  updateVerses();

  updatePageMeta(
    `${currentBook} ${currentChapter} (KJV) | OurBible`,
    `Read ${currentBook} chapter ${currentChapter} (KJV Bible).`,
    `${currentBook}, ${currentBook} ${currentChapter}, Bible, KJV`
  );

  if (push) {
    const path = `${BASE_PATH}/${encodeURIComponent(currentBook)}/${currentChapter}`;
    history.pushState({ book: currentBook, chapter: currentChapter, verse: null }, "", path);
  }
}

// === Navigation ===
function nextVerse() {
  const chapterObj = bibleData[currentBook] && bibleData[currentBook][currentChapter];
  const totalVerses = chapterObj ? Object.keys(chapterObj).length : 0;
  if (currentVerse < totalVerses) {
    currentVerse++;
    updateVerses();
    showVerse();
  } else nextChapter();
}

function prevVerse() {
  if (currentVerse > 1) {
    currentVerse--;
    updateVerses();
    showVerse();
  } else prevChapter();
}

function nextChapter() {
  const totalChapters = Object.keys(bibleData[currentBook] || {}).length;
  if (currentChapter < totalChapters) {
    currentChapter++;
    currentVerse = 1;
    updateChapters();
    updateVerses();
    showChapter();
  }
}

function prevChapter() {
  if (currentChapter > 1) {
    currentChapter--;
    currentVerse = 1;
    updateChapters();
    updateVerses();
    showChapter();
  }
}

// === Search ===
function searchBible(push = true) {
  const rawKeyword = (document.getElementById("searchBox") && document.getElementById("searchBox").value) || "";
  const keyword = rawKeyword.trim().toLowerCase();
  const bookFilter = (document.getElementById("searchBook") && document.getElementById("searchBook").value) || "all";
  const resultsDiv = document.getElementById("searchResults");
  const outputDiv = document.getElementById("output");

  if (!resultsDiv) return;
  if (outputDiv) outputDiv.innerHTML = "";

  if (!keyword) {
    resultsDiv.innerHTML = "<p class='text-gray-600'>Please enter a keyword.</p>";
    return;
  }

  let resultsHtml = "";
  Object.keys(bibleData).forEach(book => {
    if (bookFilter !== "all" && book !== bookFilter) return;
    Object.keys(bibleData[book]).forEach(chap => {
      Object.keys(bibleData[book][chap]).forEach(verse => {
        const textRaw = bibleData[book][chap][verse];
        if (!textRaw) return;
        if (textRaw.toLowerCase().includes(keyword)) {
          const escapedText = escapeHtml(textRaw);
          const highlighted = escapedText.replace(new RegExp(keyword, "gi"), m => `<mark>${m}</mark>`);
          resultsHtml += `
            <p class="verse-card">
              <a href="#" class="search-link font-bold text-blue-700 hover:underline"
                 data-book="${escapeHtml(book)}" data-chap="${chap}" data-verse="${verse}"
                 title="Go to ${escapeHtml(book)} ${chap}:${verse}">
                ${escapeHtml(book)} ${chap}:${verse}
              </a>
              ${highlighted}
            </p>`;
        }
      });
    });
  });

  resultsDiv.innerHTML = resultsHtml || "<p class='text-gray-600'>No results found.</p>";

  updatePageMeta(
    `Search results for "${escapeHtml(rawKeyword)}" | OurBible`,
    `Search results in KJV Bible for "${escapeHtml(rawKeyword)}".`,
    `${escapeHtml(rawKeyword)}, Bible search, KJV, Scripture`
  );

  if (push) {
    history.pushState({ search: rawKeyword }, "", `${BASE_PATH}/search/${encodeURIComponent(rawKeyword)}`);
  }
}

// === Attach delegated click handler ===
function attachSearchResultsListener() {
  if (_searchResultsListenerAttached) return;
  const resultsDiv = document.getElementById("searchResults");
  if (!resultsDiv) return;

  resultsDiv.addEventListener("click", function (e) {
    const a = e.target.closest && e.target.closest(".search-link");
    if (!a) return;
    e.preventDefault();
    const book = a.getAttribute("data-book");
    const chap = parseInt(a.getAttribute("data-chap"), 10);
    const verse = parseInt(a.getAttribute("data-verse"), 10);

    currentBook = book;
    currentChapter = chap;
    currentVerse = verse;

    const bookSelect = document.getElementById("book");
    if (bookSelect) bookSelect.value = currentBook;
    updateChapters();
    const chapterSelect = document.getElementById("chapter");
    if (chapterSelect) chapterSelect.value = currentChapter;
    updateVerses();
    const verseSelect = document.getElementById("verse");
    if (verseSelect) verseSelect.value = currentVerse;

    showVerse();
  });

  _searchResultsListenerAttached = true;
}

// === Goto helper ===
function gotoVerse(book, chap, verse = null, push = true) {
  currentBook = book;
  currentChapter = parseInt(chap, 10) || 1;
  currentVerse = verse ? parseInt(verse, 10) : 1;

  const bookSelect = document.getElementById("book");
  if (bookSelect) bookSelect.value = currentBook;
  updateChapters();
  const chapterSelect = document.getElementById("chapter");
  if (chapterSelect) chapterSelect.value = currentChapter;
  updateVerses();
  const verseSelect = document.getElementById("verse");
  if (verseSelect) verseSelect.value = currentVerse;

  if (verse !== null && verse !== undefined) showVerse(push);
  else showChapter(push);
}

// === Load from URL ===
function loadFromURL() {
  let path = window.location.pathname;

  if (path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length).replace(/^\/+/, "");
  } else path = path.replace(/^\/+/, "");

  if (!path) {
    gotoVerse(currentBook, currentChapter, currentVerse, false);
    return;
  }

  if (path.startsWith("search/")) {
    const keyword = decodeURIComponent(path.split("/").slice(1).join("/"));
    const sb = document.getElementById("searchBox");
    if (sb) sb.value = keyword;
    searchBible(false);
    return;
  }

  const parts = path.split("/");
  if (parts.length >= 2) {
    const book = decodeURIComponent(parts[0]);
    const chap = parseInt(parts[1], 10) || 1;
    const verse = parts[2] ? parseInt(parts[2], 10) : null;

    if (bibleData[book]) {
      gotoVerse(book, chap, verse, false);
    } else {
      gotoVerse(currentBook, currentChapter, currentVerse, false);
    }
  } else {
    gotoVerse(currentBook, currentChapter, currentVerse, false);
  }
}

// === popstate handling ===
window.addEventListener("popstate", function (event) {
  const state = event.state;
  if (!state) {
    const outputEl = document.getElementById("output");
    const resultsEl = document.getElementById("searchResults");
    if (outputEl) outputEl.innerHTML = "";
    if (resultsEl) resultsEl.innerHTML = "";
    updatePageMeta(
      "KJV Bible Online | OurBible",
      "Read the King James Version Bible online. Search, browse, and study scripture.",
      "Bible, KJV, Scripture, Online Bible, OurBible"
    );
    return;
  }

  if (state.search) {
    const sb = document.getElementById("searchBox");
    if (sb) sb.value = state.search;
    searchBible(false);
  } else if (state.book) {
    gotoVerse(state.book, state.chapter, state.verse, false);
  }
});
