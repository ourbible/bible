let bibleData;
let currentBook = "Genesis";
let currentChapter = 1;
let currentVerse = 1;
let searchActive = false; // flag mode pencarian aktif

// Load JSON Alkitab
fetch("kjv_nested.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data;
    initSelectors();
    showChapter();
  });

// Inisialisasi dropdown book/chapter/verse
function initSelectors() {
    const bookSelect = document.getElementById("book-select");
    const chapterSelect = document.getElementById("chapter-select");
    const verseSelect = document.getElementById("verse-select");

    // isi buku
    for (const book in bibleData) {
        const option = document.createElement("option");
        option.value = book;
        option.textContent = book;
        bookSelect.appendChild(option);
    }

    bookSelect.value = currentBook;
    updateChapters();
    updateVerses();

    bookSelect.addEventListener("change", () => {
        currentBook = bookSelect.value;
        updateChapters();
        showChapter();
    });

    chapterSelect.addEventListener("change", () => {
        currentChapter = parseInt(chapterSelect.value);
        updateVerses();
        showChapter();
    });

    verseSelect.addEventListener("change", () => {
        currentVerse = parseInt(verseSelect.value);
        showVerse();
    });
}

// Update dropdown chapter
function updateChapters() {
    const chapterSelect = document.getElementById("chapter-select");
    chapterSelect.innerHTML = "";
    const chapters = Object.keys(bibleData[currentBook]);
    chapters.forEach(c => {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = c;
        chapterSelect.appendChild(option);
    });
    currentChapter = parseInt(chapterSelect.value);
    updateVerses();
}

// Update dropdown verse
function updateVerses() {
    const verseSelect = document.getElementById("verse-select");
    verseSelect.innerHTML = "";
    const verses = bibleData[currentBook][currentChapter];
    for (let i = 1; i <= verses.length; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        verseSelect.appendChild(option);
    }
    currentVerse = parseInt(verseSelect.value);
}

// Tampilkan satu ayat
function showVerse() {
    searchActive = false; // menonaktifkan mode search
    const container = document.getElementById("verse-container");
    container.innerHTML = "";
    const verseText = bibleData[currentBook][currentChapter][currentVerse];
    container.appendChild(createVerseCard(currentVerse, verseText));
}

// Tampilkan satu chapter
function showChapter() {
    searchActive = false; // menonaktifkan mode search
    const container = document.getElementById("verse-container");
    container.innerHTML = "";
    const verses = bibleData[currentBook][currentChapter];
    for (let i = 1; i <= verses.length; i++) {
        container.appendChild(createVerseCard(i, verses[i]));
    }
}

// Pencarian di seluruh Bible
function searchBible(query) {
    searchActive = true;
    const container = document.getElementById("verse-container");
    container.innerHTML = "";

    const results = [];
    for (const book in bibleData) {
        for (const chapter in bibleData[book]) {
            const verses = bibleData[book][chapter];
            for (const verseNum in verses) {
                const text = verses[verseNum];
                if (text.toLowerCase().includes(query.toLowerCase())) {
                    results.push({book, chapter, verseNum, text});
                }
            }
        }
    }

    if (results.length === 0) {
        container.innerHTML = "<p>No results found</p>";
    } else {
        results.forEach(r => {
            const card = createVerseCard(r.verseNum, r.text, r.book, r.chapter);
            container.appendChild(card);
        });
    }
}

// Navigasi langsung ke buku/chapter/verse
function navigateTo(book, chapter, verse) {
    currentBook = book;
    currentChapter = chapter;
    currentVerse = verse;

    if (searchActive) searchActive = false; // hilangkan mode search

    // Update dropdown
    document.getElementById("book-select").value = book;
    updateChapters();
    document.getElementById("chapter-select").value = chapter;
    updateVerses();
    document.getElementById("verse-select").value = verse;

    showVerse();
}

// Membuat card ayat
function createVerseCard(verseNum, text, book=null, chapter=null) {
    const div = document.createElement("div");
    div.className = "verse-card";
    div.innerHTML = `<span class="verse-number">${verseNum}</span> ${text}`;

    // Jika berasal dari hasil pencarian, bisa klik untuk navigasi
    if (book && chapter) {
        div.addEventListener("click", () => {
            navigateTo(book, chapter, verseNum);
        });
    }

    return div;
}
