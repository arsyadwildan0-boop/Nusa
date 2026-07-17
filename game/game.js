const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==========================================
// 📚 BANK SOAL ACRAK & DINAMIS (BISA DITAMBAH)
// ==========================================
const quizData = {
    umum: [
        { q: "Sabar secara bahasa memiliki arti...", options: ["Marah-marah", "Menahan diri", "Pasrah total tanpa ikhtiar"], correct: 1 },
        { q: "Orang yang selalu mengambil hikmah dari setiap cobaan memiliki sikap...", options: ["Pesimis", "Husnudzon (Berpikir Positif)", "Su'udzon"], correct: 1 },
        { q: "Manakah di bawah ini yang merupakan bentuk sabar dalam menjalankan perintah Allah?", options: ["Tetap sholat tepat waktu meski mengantuk", "Mengeluh saat cuaca panas", "Menunda ibadah demi bermain game"], correct: 0 },
        { q: "Lawan dari sifat Husnudzon (Berpikir Positif) adalah...", options: ["Tawakal", "Su'udzon (Berpikir Negatif)", "Qanaah"], correct: 1 },
        { q: "Manfaat utama dari memelihara sifat sabar di dalam jiwa adalah...", options: ["Hati menjadi tenang dan lapang", "Membuat kita mudah ditipu", "Cepat merasa putus asa"], correct: 0 }
    ],
    putus_asa: [
        { q: "Di dalam Al-Qur'an surah Yusuf ayat 87, Allah melarang kita berputus asa dari...", options: ["Kekayaan dunia", "Rahmat dan pertolongan Allah", "Pujian manusia"], correct: 1 },
        { q: "Bagaimana cara terbaik agar tidak putus asa saat menghadapi kegagalan?", options: ["Langsung berhenti berusaha", "Sabar, berdoa, dan mencari jalan keluar baru", "Menyalahkan orang lain"], correct: 1 },
        { q: "Mengapa sifat putus asa sangat dilarang dalam Islam?", options: ["Karena membuat kita menjadi malas", "Karena menandakan kurangnya iman pada kekuasaan Allah", "Karena merugikan secara finansial"], correct: 1 },
        { q: "Sikap yang tepat ketika melihat rencana kita belum dikabulkan oleh Allah adalah...", options: ["Kecewa dan menjauh", "Tetap optimis dan berikhtiar", "Menyerah sepenuhnya"], correct: 1 }
    ]
};

// ==========================================
// PENGATURAN AREA LEVEL & KAMERA MARIO
// ==========================================
let gameActive = true;
let cameraX = 0; 
const levelWidth = 3200; // Map yang sangat panjang ke kanan
let currentQuizType = "umum";
let activeQuiz = null;

let player = {
    x: 50, y: 150, width: 32, height: 44, speed: 5, velX: 0, velY: 0,
    jumping: false, grounded: false, hasShield: false, shieldTimer: 0
};

// STRUKTUR LEVEL (TANAH & PLATFORM MELAYANG)
const platforms = [
    { x: 0, y: 350, w: 550, h: 50 },
    { x: 680, y: 350, w: 450, h: 50 },   // Jurang 1
    { x: 820, y: 240, w: 160, h: 25 },   // Platform melayang diatas jurang 1
    { x: 1250, y: 350, w: 600, h: 50 },  // Jurang 2
    { x: 1400, y: 220, w: 200, h: 25 },  // Platform tinggi di jurang 2
    { x: 1950, y: 350, w: 1300, h: 50 }  // Jalan lurus panjang menuju finish
];

// DATA MUSUH PATROLI (DENGAN JANGKAUAN GERAK)
let enemies = [
    { x: 420, y: 315, w: 35, h: 35, speed: -2, range: [100, 500], label: "Putus Asa" },
    { x: 850, y: 205, w: 32, h: 32, speed: -1.5, range: [830, 960], label: "Gelisah" },
    { x: 1450, y: 315, w: 35, h: 35, speed: -3, range: [1280, 1750], label: "Amarah" },
    { x: 2200, y: 315, w: 35, h: 35, speed: -2.5, range: [2000, 2600], label: "Sombong" }
];

// ITEM LENTERA ILMU (POWER-UP PERISAI)
let items = [
    { x: 900, y: 190, w: 22, h: 22, collected: false },
    { x: 1490, y: 170, w: 22, h: 22, collected: false }
];

let keys = [];
const gravity = 0.6;
const friction = 0.85;

window.addEventListener("keydown", (e) => { keys[e.keyCode] = true; });
window.addEventListener("keyup", (e) => { keys[e.keyCode] = false; });

// SIMULASI UTAMA GAME
function update() {
    if (!gameActive) return;

    // Kontrol Arah pergerakan
    if (keys[39]) { if (player.velX < player.speed) player.velX++; }
    if (keys[37]) { if (player.velX > -player.speed) player.velX--; }
    if ((keys[38] || keys[32]) && !player.jumping && player.grounded) {
        player.jumping = true; player.grounded = false; player.velY = -12.5;
    }

    player.velX *= friction;
    player.velY += gravity;
    player.grounded = false;

    // Deteksi Pijakan Kaki pada Platform
    platforms.forEach(p => {
        let dir = colCheck(player, p);
        if (dir === "b") { player.grounded = true; player.jumping = false; }
        else if (dir === "t") { player.velY = 0; }
    });

    player.x += player.velX;
    player.y += player.velY;

    if (player.x < 0) player.x = 0;
    
    // JIKA JATUH KE JURANG (Trigger Kuis Sabar)
    if (player.y > canvas.height) {
        triggerGameOver("Kamu terperosok ke dalam Jurang Kelalaian! Bangkit dengan kesabaran.", "umum");
    }

    // Manajemen Durasi Perisai
    if (player.hasShield && --player.shieldTimer <= 0) player.hasShield = false;

    // Cek Ambil Item Lentera
    items.forEach(item => {
        if (!item.collected && colCheck(player, item)) {
            item.collected = true; player.hasShield = true; player.shieldTimer = 350;
        }
    });

    // Cek Senggolan dengan Awan Emosi
    enemies.forEach(enemy => {
        enemy.x += enemy.speed;
        if (enemy.x < enemy.range[0] || enemy.x > enemy.range[1]) enemy.speed *= -1;
        
        if (colCheck(player, enemy)) {
            if (player.hasShield) { 
                enemy.x = -999; // Musuh hancur jika menabrak perisai ilmu
            } else { 
                triggerGameOver(`Kamu terselimuti Awan Emosi "${enemy.label}"!`, "putus_asa"); 
            }
        }
    });

    // SISTEM SCROLLING KAMERA (Kamera mengikuti Player)
    cameraX = player.x - canvas.width / 4;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > levelWidth - canvas.width) cameraX = levelWidth - canvas.width;

    // CEK MENANG (Sampai ke Ujung Map)
    if (player.x > levelWidth - 120) triggerGameWin();

    render();
    requestAnimationFrame(update);
}

// PROSES PENGGAMBARAN ELEMEN
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-cameraX, 0); // Geser layar dunia game secara horizontal

    // 1. Gambar Tanah & Rumput
    platforms.forEach(p => {
        ctx.fillStyle = "#451a03"; ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#15803d"; ctx.fillRect(p.x, p.y, p.w, 8);
    });

    // Tanda Garis Finish
    ctx.fillStyle = "#eab308";
    ctx.fillRect(levelWidth - 100, 200, 10, 150);
    ctx.fillStyle = "#fff"; ctx.font = "16px Arial";
    ctx.fillText("🏁 GERBUNG SUKSES", levelWidth - 180, 180);

    // 2. Gambar Lentera Emas
    items.forEach(item => {
        if (!item.collected) {
            ctx.fillStyle = "#fbbf24"; ctx.fillRect(item.x, item.y, item.w, item.h);
            ctx.strokeStyle = "#fff"; ctx.strokeRect(item.x, item.y, item.w, item.h);
        }
    });

    // 3. Gambar Awan Emosi
    enemies.forEach(e => {
        if (e.x > 0) {
            ctx.fillStyle = "#475569"; ctx.beginPath(); ctx.arc(e.x + 15, e.y + 15, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#f8fafc"; ctx.font = "11px Arial"; ctx.fillText(e.label, e.x - 5, e.y + 18);
        }
    });

    // 4. Gambar Karakter Utama (Kotak Merah Berani)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Gambar Efek Perisai Lingkaran Biru Neon
    if (player.hasShield) {
        ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(player.x + 16, player.y + 22, 28, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.restore();
}

function triggerGameOver(reason, type) {
    gameActive = false;
    currentQuizType = type;
    const overlay = document.getElementById("gameOverlay");
    document.getElementById("overlayTitle").innerText = "GAME OVER";
    document.getElementById("overlayTitle").className = "color-lose";
    document.getElementById("overlayMessage").innerText = reason;
    document.getElementById("quizBtn").style.display = "inline-block";
    overlay.style.display = "flex";
}

function triggerGameWin() {
    gameActive = false;
    const overlay = document.getElementById("gameOverlay");
    document.getElementById("overlayTitle").innerText = "YOU WIN! 🎉";
    document.getElementById("overlayTitle").className = "color-win";
    document.getElementById("overlayMessage").innerText = "Hebat! Kamu berhasil menyeimbangkan hati dan pikiran dengan ilmu.";
    document.getElementById("quizBtn").style.display = "none";
    overlay.style.display = "flex";
}

function showQuizFromOverlay() {
    document.getElementById("gameOverlay").style.display = "none";
    const pool = quizData[currentQuizType];
    activeQuiz = pool[Math.floor(Math.random() * pool.length)]; // Diacak total otomatis
    
    document.getElementById("quizQuestion").innerText = activeQuiz.q;
    document.getElementById("opt0").innerText = activeQuiz.options[0];
    document.getElementById("opt1").innerText = activeQuiz.options[1];
    document.getElementById("opt2").innerText = activeQuiz.options[2];
    document.getElementById("quizModal").style.display = "flex";
}

function checkAnswer(idx) {
    document.getElementById("quizModal").style.display = "none";
    if (idx === activeQuiz.correct) {
        alert("Jawabanmu Tepat! Semangatmu kembali membara, silakan lanjutkan petualangan.");
        player.y = 100; player.velX = 0; player.velY = 0;
        // Mundurkan player sedikit dari posisi rintangan maut agar aman saat hidup kembali
        player.x = Math.max(50, player.x - 120);
        gameActive = true;
        update();
    } else {
        alert("Jawabanmu Kurang Tepat. Mari belajar lagi dari awal!");
        resetGame();
    }
}

function resetGame() {
    location.reload(); // Reset halaman penuh untuk mengacak ulang posisi objek dari awal map
}

function colCheck(sA, sB) {
    let vX = (sA.x + (sA.width / 2)) - (sB.x + (sB.w / 2)),
        vY = (sA.y + (sA.height / 2)) - (sB.y + (sB.h / 2)),
        hW = (sA.width / 2) + (sB.w / 2),
        hH = (sA.height / 2) + (sB.h / 2);
    if (Math.abs(vX) < hW && Math.abs(vY) < hH) {
        let oX = hW - Math.abs(vX), oY = hH - Math.abs(vY);
        if (oX >= oY) { if (vY > 0) { sA.y += oY; return "t"; } else { sA.y -= oY; return "b"; } }
        else { if (vX > 0) { sA.x += oX; return "l"; } else { sA.x -= oX; return "r"; } }
    }
    return null;
}

update();