let bibleData = {};
let currentBook = null;
let currentChapter = null;
let currentVerse = null;

// === Load Bible JSON ===
fetch("kjv_nested.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data;
    console.log("Bible data loaded");
  });

// === Update <title> & <meta> dynamically ===
function updatePageMeta(title, description, keywords) {
  document.title = title;

  let descTag = document.querySelector("meta[name='description']");
  if (!descTag) {
    descTag = document.createElement("meta");
    descTag.name = "description";
    document.head.appendChild(descTag);
  }
  descTag.content = description;

  let keyTag = document.querySelector("meta[name='keywords']");
  if (!keyTag) {
    keyTag = document.createElement("meta");
    keyTag.name = "keywords";
    document.head.appendChild(keyTag);
  }
  keyTag.content = keywords;
}

// === Navigate to verse ===
function gotoVerse(book, chapter, verse = null, push = true) {
  currentBook = book;
  currentChapter = chapter;
  currentVerse = verse;

  if (verse) {
    showVerse(push);
  } else {
    showChapter(push);
  }
}

// === Show single verse ===
function showVerse(push = true) {
  const verseText = bibleData[currentBook][currentChapter][currentVerse];

  // Clear search results
  document.getElementById("searchResults").innerHTML = "";

  document.getElementById("output").innerHTML = `
    <div class="chapter-title">${currentBook} ${currentChapter}:${currentVerse}</div>
    <p class="verse-card"><span class="verse-number">${currentVerse}</span> ${verseText}</p>
  `;

  updatePageMeta(
    `${currentBook} ${currentChapter}:${currentVerse} (KJV) | OurBible`,
    `${currentBook} ${currentChapter}:${currentVerse} - ${verseText}`,
    `${currentBook}, ${currentBook} ${currentChapter}, ${currentBook} ${currentChapter}:${currentVerse}, Bible, KJV`
  );

  if (push) {
    history.pushState(
      { book: currentBook, chapter: currentChapter, verse: currentVerse },
      "",
      `#${currentBook}/${currentChapter}/${currentVerse}`
    );
  }
}

// === Show full chapter ===
function showChapter(push = true) {
  const verses = bibleData[currentBook][currentChapter];

  // Clear search results
  document.getElementById("searchResults").innerHTML = "";

  let html = `<div class="chapter-title">${currentBook} ${currentChapter}</div>`;
  Object.keys(verses).forEach(v => {
    html += `<p class="verse-card"><span class="verse-number">${v}</span> ${verses[v]}</p>`;
  });
  document.getElementById("output").innerHTML = html;

  updatePageMeta(
    `${currentBook} ${currentChapter} (KJV) | OurBible`,
    `Read ${currentBook} chapter ${currentChapter} (KJV Bible).`,
    `${currentBook}, ${currentBook} ${currentChapter}, Bible, KJV`
  );

  if (push) {
    history.pushState(
      { book: currentBook, chapter: currentChapter, verse: null },
      "",
      `#${currentBook}/${currentChapter}`
    );
  }
}

// === Search Bible ===
function searchBible(push = true) {
  const keyword = document.getElementById("searchBox").value.toLowerCase();
  const bookFilter = document.getElementById("searchBook").value;
  const resultsDiv = document.getElementById("searchResults");

  // Clear output
  document.getElementById("output").innerHTML = "";

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
                 class="font-bold text-blue-700 hover:underline"
                 title="Go to ${book} ${chap}:${verse}">
                ${book} ${chap}:${verse}
              </a> ${highlighted}
            </p>`;
        }
      });
    });
  });

  resultsDiv.innerHTML = results || "<p class='text-gray-600'>No results found.</p>";

  updatePageMeta(
    `Search results for "${keyword}" | OurBible`,
    `Search results in KJV Bible for "${keyword}".`,
    `${keyword}, Bible search, KJV, Scripture`
  );

  if (push) {
    history.pushState({ search: keyword }, "", `#search=${encodeURIComponent(keyword)}`);
  }
}

// === Listen for Enter on search box ===
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchBible();
      }
    });
  }
});

// === Handle back/forward ===
window.onpopstate = function (event) {
  if (event.state) {
    if (event.state.search) {
      document.getElementById("searchBox").value = event.state.search;
      searchBible(false);
    } else if (event.state.book) {
      gotoVerse(event.state.book, event.state.chapter, event.state.verse, false);
    }
  } else {
    // Reset to homepage
    document.getElementById("output").innerHTML = "";
    document.getElementById("searchResults").innerHTML = "";
    updatePageMeta(
      "KJV Bible Online | OurBible",
      "Read the King James Version Bible online. Search, browse, and study scripture.",
      "Bible, KJV, Scripture, Online Bible, OurBible"
    );
  }
};
