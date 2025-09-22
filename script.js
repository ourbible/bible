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
    showVerse();
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
function showVerse() {
  const verseText = bibleData[currentBook][currentChapter][currentVerse];
  document.getElementById("output").innerHTML = `
    <div class="chapter-title">${currentBook} ${currentChapter}:${currentVerse}</div>
    <p class="verse-card"><span class="verse-number">${currentVerse}</span> ${verseText}</p>
  `;
}

// Show full chapter
function showChapter() {
  const verses = bibleData[currentBook][currentChapter];
  let html = `<div class="chapter-title">${currentBook} ${currentChapter}</div>`;
  Object.keys(verses).forEach(v => {
    html += `<p class="verse-card"><span class="verse-number">${v}</span> ${verses[v]}</p>`;
  });
  document.getElementById("output").innerHTML = html;
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
              <span class="verse-number">${book} ${chap}:${verse}</span> ${highlighted}
            </p>`;
        }
      });
    });
  });

  resultsDiv.innerHTML = results || "<p class='text-gray-600'>No results found.</p>";
}
