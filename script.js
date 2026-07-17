// Database Link Dokumen & Video dengan Link Asli Anda yang Sudah Dikonversi
const bookDatabase = {
    1: {
        title: "Hadits Berpikir Positif & Sabar",
        author: "Wildan Arsyad (STAI Al-Falah)",
        word: "https://drive.google.com/file/d/1VN3rQAwAzkI36__n--M3rG3p0OYodDXo/preview", 
        ppt: "https://drive.google.com/file/d/1P-FdSFr6OshiCgXaEMW78D6BCr750uWF/preview",
        video: "https://drive.google.com/file/d/16v8u3Qr42kwoDbv5c5rbiTXbWQRb6b9G/preview"
    },
    2: {
        title: "Cosmos",
        author: "Carl Sagan",
        word: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        ppt: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        video: ""
    },
    3: {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        word: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        ppt: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        video: ""
    },
    4: {
        title: "Bumi Manusia",
        author: "Pramoedya Ananta Toer",
        word: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        ppt: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        video: ""
    }
};

// Fungsi Membuka Modal Buku
function openBookModal(bookId, title, author) {
    const modal = document.getElementById('multimedia-modal');
    const book = bookDatabase[bookId];

    if (!book) return;

    // Set Teks Judul & Penulis di Modal
    document.getElementById('modal-book-title').innerText = book.title;
    document.getElementById('modal-book-author').innerText = book.author;

    // Masukkan link langsung ke src iframe masing-masing viewer
    document.getElementById('pdf-viewer-word').src = book.word;
    document.getElementById('pdf-viewer-ppt').src = book.ppt;
    document.getElementById('video-viewer').src = book.video;

    // Tampilkan Modal
    modal.style.display = "flex";
    
    // Aktifkan tab pertama (Jurnal Word/PDF) secara default
    switchModalTab('word');
}

// Fungsi Menutup Modal
function closeBookModal() {
    const modal = document.getElementById('multimedia-modal');
    modal.style.display = "none";

    // Kosongkan src agar dokumen/video berhenti memuat saat ditutup
    document.getElementById('pdf-viewer-word').src = "";
    document.getElementById('pdf-viewer-ppt').src = "";
    document.getElementById('video-viewer').src = "";
}

// Fungsi Pindah-Pindah Tab (Jurnal / PPT / Video)
function switchModalTab(tabType) {
    // Sembunyikan semua konten viewer dulu
    document.getElementById('pdf-viewer-word').style.display = "none";
    document.getElementById('pdf-viewer-ppt').style.display = "none";
    document.getElementById('video-viewer').style.display = "none";

    // Hapus status aktif dari semua tombol tab
    document.getElementById('tab-word').classList.remove('active');
    document.getElementById('tab-ppt').classList.remove('active');
    document.getElementById('tab-video').classList.remove('active');

    // Tampilkan viewer yang dipilih dan beri tanda aktif pada tabnya
    if (tabType === 'word') {
        document.getElementById('pdf-viewer-word').style.display = "block";
        document.getElementById('tab-word').classList.add('active');
    } else if (tabType === 'ppt') {
        document.getElementById('pdf-viewer-ppt').style.display = "block";
        document.getElementById('tab-ppt').classList.add('active');
    } else if (tabType === 'video') {
        document.getElementById('video-viewer').style.display = "block";
        document.getElementById('tab-video').classList.add('active');
    }
}

// Menutup modal otomatis jika area luar modal diklik
window.onclick = function(event) {
    const modal = document.getElementById('multimedia-modal');
    if (event.target == modal) {
        closeBookModal();
    }
}