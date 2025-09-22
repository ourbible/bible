let bibleData;
let currentBook = "John";
let currentChapter = 1;
let currentVerse = 1;

// Load Bible JSON
fetch("kjv_nested.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data;
    initSelectors();
    loadFromURL(); // cek hash url saat pertama kali buka
  });

// Initialize dropdowns
function initSelectors() {
  const bookSelect = document.getElementById("book");
  const chapterSelect = document.getElementById("chapter");
  const verseSelect = document.getElementById("verse");
  const searchBook = document.getElementById("searchBook");

  // Fill books
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

// Show single verse
function showVerse(updateURL = true) {
  const verseText = bibleData[currentBook][currentChapter][currentVerse];
  document.getElementById("output").innerHTML = `
    <div class="chapter-title">${currentBook} ${currentChapter}:${currentVerse}</div>
    <p class="verse-card"><span class="verse-number">${currentVerse}</span> ${verseText}</p>
  `;

  if (updateURL) {
    window.location.hash = `${currentBook}/${currentChapter}/${currentVerse}`;
    document.title = `${currentBook} ${currentChapter}:${currentVerse} (KJV) | OurBible`;
  }
}

// Show full chapter
function showChapter(updateURL = true) {
  const verses = bibleData[currentBook][currentChapter];
  let html = `<div class="chapter-title">${currentBook} ${currentChapter}</div>`;
  Object.keys(verses).forEach(v => {
    html += `<p class="verse-card"><span class="verse-number">${v}</span> ${verses[v]}</p>`;
  });
  document.getElementById("output").innerHTML = html;

  if (updateURL) {
    window.location.hash = `${currentBook}/${currentChapter}`;
    document.title = `${currentBook} ${currentChapter} (KJV) | OurBible`;
  }
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

// Search
function searchBible(updateURL = true) {
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
              <a href="javascript:void(0)" onclick="gotoVerse('${book}', ${chap}, ${verse})" 
                 class="font-bold text-blue-700 hover:underline">
                ${book} ${chap}:${verse}
              </a> ${highlighted}
            </p>`;
        }
      });
    });
  });

  resultsDiv.innerHTML = results || "<p class='text-gray-600'>No results found.</p>";

  if (updateURL) {
    window.location.hash = `search=${encodeURIComponent(keyword)}`;
    document.title = `Search: ${keyword} | OurBible`;
  }
}

// Jump directly from search result
function gotoVerse(book, chap, verse) {
  currentBook = book;
  currentChapter = parseInt(chap);
  currentVerse = parseInt(verse);
  updateChapters();
  updateVerses();
  showVerse();
}

// Load state from URL hash
function loadFromURL() {
  const hash = window.location.hash.substring(1);
  if (!hash) {
    showVerse(false);
    return;
  }

  if (hash.startsWith("search=")) {
    const keyword = decodeURIComponent(hash.split("=")[1]);
    document.getElementById("searchBox").value = keyword;
    searchBible(false);
    return;
  }

  const parts = hash.split("/");
  if (parts.length >= 2) {
    currentBook = parts[0];
    currentChapter = parseInt(parts[1]);
    currentVerse = parts[2] ? parseInt(parts[2]) : 1;

    updateChapters();
    updateVerses();
    showVerse(false);
  } else {
    showVerse(false);
  }
}

// Handle enter key for search
document.getElementById("searchBox").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    searchBible();
  }
});
