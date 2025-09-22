let bibleData = {};
let bookList = [];

async function loadBible() {
  const response = await fetch("kjv_nested.json");
  bibleData = await response.json();
  
  bookList = Object.keys(bibleData);

  // Dropdown utama
  const bookSelect = document.getElementById("book");
  bookList.forEach(book => {
    let opt = document.createElement("option");
    opt.value = book;
    opt.textContent = book;
    bookSelect.appendChild(opt);
  });

  // Dropdown filter pencarian
  const searchBookSelect = document.getElementById("searchBook");
  bookList.forEach(book => {
    let opt = document.createElement("option");
    opt.value = book;
    opt.textContent = book;
    searchBookSelect.appendChild(opt);
  });

  bookSelect.addEventListener("change", updateChapters);
  document.getElementById("chapter").addEventListener("change", updateVerses);

  updateChapters();
  showVerse();
}

function updateChapters() {
  const book = document.getElementById("book").value;
  const chapters = Object.keys(bibleData[book]);
  const chapterSelect = document.getElementById("chapter");
  chapterSelect.innerHTML = "";
  chapters.forEach(ch => {
    let opt = document.createElement("option");
    opt.value = ch;
    opt.textContent = ch;
    chapterSelect.appendChild(opt);
  });
  updateVerses();
}

function updateVerses() {
  const book = document.getElementById("book").value;
  const chapter = document.getElementById("chapter").value;
  const verses = Object.keys(bibleData[book][chapter]);
  const verseSelect = document.getElementById("verse");
  verseSelect.innerHTML = "";
  verses.forEach(v => {
    let opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    verseSelect.appendChild(opt);
  });
}

function showVerse() {
  const book = document.getElementById("book").value;
  const chapter = document.getElementById("chapter").value;
  const verse = document.getElementById("verse").value;
  const text = bibleData[book][chapter][verse];
  document.getElementById("output").innerHTML = `
    <div class="verse-card">
      <strong>${book} ${chapter}:${verse}</strong><br>${text}
    </div>`;
}

function showChapter() {
  const book = document.getElementById("book").value;
  const chapter = document.getElementById("chapter").value;
  const verses = bibleData[book][chapter];
  let html = `<h2 class="text-xl font-bold mb-4">${book} ${chapter}</h2>`;
  Object.keys(verses).forEach(v => {
    html += `<div class="verse-card"><sup>${v}</sup> ${verses[v]}</div>`;
  });
  document.getElementById("output").innerHTML = html;
}

function nextVerse() {
  const verseSelect = document.getElementById("verse");
  let currentIndex = verseSelect.selectedIndex;
  if (currentIndex < verseSelect.options.length - 1) {
    verseSelect.selectedIndex = currentIndex + 1;
    showVerse();
  } else {
    nextChapter();
  }
}

function prevVerse() {
  const verseSelect = document.getElementById("verse");
  let currentIndex = verseSelect.selectedIndex;
  if (currentIndex > 0) {
    verseSelect.selectedIndex = currentIndex - 1;
    showVerse();
  } else {
    prevChapter();
  }
}

function nextChapter() {
  const chapterSelect = document.getElementById("chapter");
  let currentIndex = chapterSelect.selectedIndex;
  if (currentIndex < chapterSelect.options.length - 1) {
    chapterSelect.selectedIndex = currentIndex + 1;
    updateVerses();
    document.getElementById("verse").selectedIndex = 0;
    showVerse();
  } else {
    const bookSelect = document.getElementById("book");
    let bookIndex = bookSelect.selectedIndex;
    if (bookIndex < bookSelect.options.length - 1) {
      bookSelect.selectedIndex = bookIndex + 1;
      updateChapters();
      document.getElementById("chapter").selectedIndex = 0;
      updateVerses();
      document.getElementById("verse").selectedIndex = 0;
      showVerse();
    }
  }
}

function prevChapter() {
  const chapterSelect = document.getElementById("chapter");
  let currentIndex = chapterSelect.selectedIndex;
  if (currentIndex > 0) {
    chapterSelect.selectedIndex = currentIndex - 1;
    updateVerses();
    const verseSelect = document.getElementById("verse");
    verseSelect.selectedIndex = verseSelect.options.length - 1;
    showVerse();
  } else {
    const bookSelect = document.getElementById("book");
    let bookIndex = bookSelect.selectedIndex;
    if (bookIndex > 0) {
      bookSelect.selectedIndex = bookIndex - 1;
      updateChapters();
      const chapterSel = document.getElementById("chapter");
      chapterSel.selectedIndex = chapterSel.options.length - 1;
      updateVerses();
      const verseSelect = document.getElementById("verse");
      verseSelect.selectedIndex = verseSelect.options.length - 1;
      showVerse();
    }
  }
}

function searchBible() {
  const keyword = document.getElementById("searchBox").value.trim().toLowerCase();
  const filterBook = document.getElementById("searchBook").value;
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = "";

  if (!keyword) {
    resultsDiv.innerHTML = "<p class='text-red-600'>Please enter a keyword.</p>";
    return;
  }

  let results = [];
  let searchBooks = filterBook === "all" ? bookList : [filterBook];

  for (let book of searchBooks) {
    for (let ch in bibleData[book]) {
      for (let v in bibleData[book][ch]) {
        let text = bibleData[book][ch][v];
        if (text.toLowerCase().includes(keyword)) {
          let highlighted = text.replace(new RegExp(keyword, "gi"), match => `<mark>${match}</mark>`);
          results.push(`<div class="verse-card"><strong>${book} ${ch}:${v}</strong> - ${highlighted}</div>`);
        }
      }
    }
  }

  if (results.length === 0) {
    resultsDiv.innerHTML = `<p>No verses found for "<strong>${keyword}</strong>".</p>`;
  } else {
    resultsDiv.innerHTML = `<h3 class="font-bold mb-2">Results for "<em>${keyword}</em>" (${results.length} verses)</h3>` + results.join("");
  }
}

loadBible();