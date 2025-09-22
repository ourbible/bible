let bibleData;
let currentBook = "Genesis";
let currentChapter = 1;
let currentVerse = 1;

// Load Bible JSON
fetch("kjv_nested.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data;
    initSelectors();
    loadFromHash(); // kalau ada hash di URL, langsung buka
  });

// Initialize dropdowns
function initSelectors() {
  const bookSelect = document.getElementById("book");
  const chapterSelect = document.getElementById("chapter");
  const verseSelect = document.getElementById("verse");
  const searchBook = document.getElementById("searchBook");

  Object.keys(bibleData).forEach(book => {
    bookSelect.add(new Option(book, book));
    searchBook.add(new Option(book, book));
  });

  bookSelect.value = currentBook;
  updateChapters();
  updateVerses();

  bookSelect.addEventListener("change", () => {
    currentBook = bookSelect.value;
    updateChapters();
    updateVerses();
  });

  chapterSelect.addEventListener("change", () => {
    currentChapter = parseInt(chapterSelect.value);
    updateVerses();
  });

  verseSelect.addEventListener("change", () => {
    currentVerse = parseInt(verseSelect.value);
  });

  // Enter untuk search
  document.getElementById("searchBox").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchBible();
    }
  });
}

function updateChapters() {
  const chapterSelect = document.getElementById("chapter");
  chapterSelect.innerHTML = "";
  const totalChapters = Object.keys(bibleData[currentBook]).length;
  for (let i = 1; i <= totalChapters; i++) {
    chapterSelect.add(new Option(i, i));
  }
  chapterSelect.value = currentChapter;
}

function updateVerses() {
  const verseSelect = document.getElementById("verse");
  verseSelect.innerHTML = "";
  const totalVerses = Object.keys(bibleData[currentBook][currentChapter]).length;
  for (let i = 1; i <= totalVerses; i++) {
    verseSelect.add(new Option(i, i));
  }
  verseSelect.value = currentVerse;
}

// -------------------- DISPLAY FUNCTIONS --------------------

// Show single verse
function showVerse(updateHash = true) {
  const verseText = bibleData[currentBook][currentChapter][currentVerse];
  document.getElementById("output").innerHTML = `
    <div class="chapter-title">${currentBook} ${currentChapter}:${currentVerse}</div>
    <p class="verse-card"><span class="verse-number">${currentVerse}</span> ${verseText}</p>
  `;
  document.getElementById("searchResults").innerHTML = "";

  if (updateHash) {
    location.hash = `#${currentBook}/${currentChapter}/${currentVerse}`;
  }
  updateMeta(`${currentBook} ${currentChapter}:${currentVerse} (KJV) | OurBible`, verseText, `${currentBook} ${currentChapter}:${currentVerse}, Bible, KJV, ${getKeywords(verseText)}`);
}

// Show full chapter
function showChapter(updateHash = true) {
  const verses = bibleData[currentBook][currentChapter];
  let html = `<div class="chapter-title">${currentBook} ${currentChapter}</div>`;
  Object.keys(verses).forEach(v => {
    html += `<p class="verse-card"><span class="verse-number">${v}</span> ${verses[v]}</p>`;
  });
  document.getElementById("output").innerHTML = html;
  document.getElementById("searchResults").innerHTML = "";

  if (updateHash) {
    location.hash = `#${currentBook}/${currentChapter}`;
  }
  updateMeta(`${currentBook} ${currentChapter} (KJV) | OurBible`, verses[1], `${currentBook} ${currentChapter}, Bible, KJV, ${getKeywords(verses[1])}`);
}

// Navigation
function nextVerse() {
  const totalVerses = Object.keys(bibleData[currentBook][currentChapter]).length;
  if (currentVerse < totalVerses) {
    currentVerse++;
  } else {
    nextChapter();
    return;
  }
  updateVerses();
  showVerse();
}

function prevVerse() {
  if (currentVerse > 1) {
    currentVerse--;
    updateVerses();
    showVerse();
  } else {
    prevChapter();
  }
}

function nextChapter() {
  const totalChapters = Object.keys(bibleData[currentBook]).length;
  if (currentChapter < totalChapters) {
    currentChapter++;
    currentVerse = 1;
    updateChapters();
    updateVerses();
    showVerse();
  }
}

function prevChapter() {
  if (currentChapter > 1) {
    currentChapter--;
    currentVerse = 1;
    updateChapters();
    updateVerses();
    showVerse();
  }
}

// -------------------- SEARCH --------------------
function searchBible() {
  const keyword = document.getElementById("searchBox").value.toLowerCase();
  const bookFilter = document.getElementById("searchBook").value;
  const resultsDiv = document.getElementById("searchResults");
  let results = "";

  if (!keyword) {
    resultsDiv.innerHTML = "<p class='text-gray-600'>Please enter a keyword.</p>";
    return;
  }

  Object.keys(bibleData).forEach(book => {
    if (bookFilter !== "all" && book !== bookFilter) return;
    Object.keys(bibleData[book]).forEach(chap => {
      Object.keys(bibleData[book][chap]).forEach(verse => {
        const text = bibleData[book][chap][verse];
        if (text.toLowerCase().includes(keyword)) {
          const highlighted = text.replace(
            new RegExp(keyword, "gi"),
            match => `<mark>${match}</mark>`
          );
          results += `
            <p class="verse-card">
              <a href="javascript:void(0)" 
                 onclick="gotoVerse('${book}', ${chap}, ${verse})" 
                 title="Open ${book} ${chap}:${verse}" 
                 class="font-bold text-blue-700 hover:underline">
                ${book} ${chap}:${verse}
              </a> ${highlighted}
            </p>`;
        }
      });
    });
  });

  document.getElementById("output").innerHTML = "";
  resultsDiv.innerHTML = results || "<p class='text-gray-600'>No results found.</p>";

  updateMeta(`Search: ${keyword} (KJV) | OurBible`, `Search results for '${keyword}' in KJV Bible`, `${keyword}, Bible, KJV`);
}

// -------------------- HELPERS --------------------

// Go to specific verse from search result
function gotoVerse(book, chap, verse) {
  currentBook = book;
  currentChapter = parseInt(chap);
  currentVerse = parseInt(verse);
  updateChapters();
  updateVerses();
  showVerse();
}

// Load verse/chapter from URL hash
function loadFromHash() {
  if (location.hash) {
    const parts = location.hash.substring(1).split("/");
    if (parts.length >= 2) {
      currentBook = parts[0];
      currentChapter = parseInt(parts[1]);
      currentVerse = parts[2] ? parseInt(parts[2]) : 1;
      updateChapters();
      updateVerses();
      if (parts.length === 3) {
        showVerse(false);
      } else {
        showChapter(false);
      }
    }
  } else {
    showVerse(false);
  }
}

// Update meta tags
function updateMeta(title, desc, keywords) {
  document.title = title;

  setMeta("description", desc.length > 150 ? desc.substring(0, 147) + "..." : desc);
  setMeta("keywords", keywords);
}

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name='${name}']`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function getKeywords(text) {
  return text.split(/\s+/).slice(0, 6).join(", ");
}

// Go Home (reset)
function goHome() {
  location.hash = "";
  currentBook = "Genesis";
  currentChapter = 1;
  currentVerse = 1;
  updateChapters();
  updateVerses();
  showVerse();
}
