let streak = parseInt(localStorage.getItem("ramadanStreak")) || 0;
let perfectDays = parseInt(localStorage.getItem("ramadanPerfectDays")) || 0;
let lastCheckDate = localStorage.getItem("ramadanLastCheck") || null;

const motivations = [
    "Ramadan cuma 30 hari. Jangan sia-siakan.",
    "Puasa bukan alasan untuk lemah.",
    "Kalau streak putus, bangun lebih kuat.",
    "Disiplin hari ini, bangga nanti.",
    "Istiqomah lebih kuat dari motivasi.",
];

window.onload = function () {
    document.getElementById("welcomeModal").style.display = "flex";
    initializeDefaultTasks();
    loadTasks();
    updateClock();
    updateStats();
    setMotivation();
    checkDailyReset();
};

function closeModal() {
    document.getElementById("welcomeModal").style.display = "none";
}

function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent =
        now.toLocaleTimeString("id-ID");
    checkOverdueTasks();
}
setInterval(updateClock, 1000);

function initializeDefaultTasks() {
    const existing = JSON.parse(localStorage.getItem("ramadanTasks"));
    if (existing && existing.length > 0) return;

    const wajibTasks = [
        { text: "Sholat Shubuh", time: "05:00" },
        { text: "Sholat Dzuhur", time: "12:00" },
        { text: "Sholat Ashar", time: "15:30" },
        { text: "Sholat Maghrib", time: "18:00" },
        { text: "Sholat Isya", time: "19:30" },
        { text: "Push Up 10-20x", time: "" },
    ];

    localStorage.setItem(
        "ramadanTasks",
        JSON.stringify(
        wajibTasks.map((t) => ({ text: t.text, time: t.time, completed: false })),
        ),
    );
}

function addTask() {
    const text = document.getElementById("taskInput").value.trim();
    const time = document.getElementById("taskTime").value;
    if (text === "") return;
    const li = createTask(text, time, false);
    document.getElementById("taskList").appendChild(li);
    document.getElementById("taskInput").value = "";
    document.getElementById("taskTime").value = "";
    saveTasks();
    updateProgress();
}

function createTask(text, time, completed) {
    const li = document.createElement("li");
    li.innerHTML = `
        <span class="task-text">${text}</span>
        <span class="task-time">${time || "Tanpa waktu"}</span>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Hapus</button>
        `;
    li.dataset.time = time;
    if (completed) li.classList.add("completed");

    li.querySelector(".task-text").onclick = function () {
        li.classList.toggle("completed");
        saveTasks();
        updateProgress();
    };

    li.querySelector(".delete-btn").onclick = function () {
        li.remove();
        saveTasks();
        updateProgress();
    };

    li.querySelector(".edit-btn").onclick = function () {
        const span = li.querySelector(".task-text");
        const input = document.createElement("input");
        input.value = span.textContent;
        input.style.flex = "1";
        span.replaceWith(input);
        input.focus();
        input.onblur = function () {
            const newSpan = document.createElement("span");
            newSpan.className = "task-text";
            newSpan.textContent = input.value || span.textContent;
            newSpan.onclick = span.onclick;
            input.replaceWith(newSpan);
            saveTasks();
            };
    };
    return li;
}

function updateProgress() {
    const tasks = document.querySelectorAll("#taskList li");
    const completed = document.querySelectorAll("#taskList li.completed");
    const percent =
        tasks.length === 0 ? 0 : (completed.length / tasks.length) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
    if (percent === 100 && tasks.length > 0) showConfetti();
}

function showConfetti() {
    for (let i = 0; i < 40; i++) {
        const c = document.createElement("div");
        c.style.position = "fixed";
        c.style.width = "6px";
        c.style.height = "6px";
        c.style.background = "#fbd786";
        c.style.top = "-10px";
        c.style.left = Math.random() * 100 + "vw";
        c.style.borderRadius = "50%";
        c.style.zIndex = "9999";
        c.style.transition = "transform 2.5s linear, opacity 2.5s";
        document.body.appendChild(c);
        setTimeout(() => {
            c.style.transform = "translateY(100vh)";
            c.style.opacity = "0";
        }, 50);
        setTimeout(() => {
            c.remove();
        }, 2500);
    }
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll("#taskList li").forEach((li) => {
        tasks.push({
            text: li.querySelector(".task-text").textContent,
            time: li.dataset.time,
            completed: li.classList.contains("completed"),
        });
    });
    localStorage.setItem("ramadanTasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("ramadanTasks")) || [];
    tasks.forEach((t) => {
        const li = createTask(t.text, t.time, t.completed);
        document.getElementById("taskList").appendChild(li);
    });
    updateProgress();
}

function updateStats() {
    document.getElementById("streak").textContent = streak;
    document.getElementById("perfectDays").textContent = perfectDays;
}

function setMotivation() {
  const random = Math.floor(Math.random() * motivations.length);
    document.getElementById("motivationText").textContent = motivations[random];
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (lastCheckDate === today) return;

    const tasks = JSON.parse(localStorage.getItem("ramadanTasks")) || [];

    if (tasks.length > 0) {
        const allComplete = tasks.every((t) => t.completed);
        if (allComplete) {
            streak++;
            perfectDays++;
        } else {
            streak = 0;
        }
    }

    localStorage.setItem("ramadanStreak", streak);
    localStorage.setItem("ramadanPerfectDays", perfectDays);
    localStorage.setItem("ramadanLastCheck", today);
    updateStats();
}

function checkOverdueTasks() {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    document.querySelectorAll("#taskList li").forEach((task) => {
        const t = task.dataset.time;
        if (t) {
        const [h, m] = t.split(":").map(Number);
        if (h * 60 + m < current && !task.classList.contains("completed")) {
            task.style.boxShadow = "0 0 20px rgba(255,0,0,0.4)";
        } else {
            task.style.boxShadow = "none";
        }
        }
    });
    }

document.getElementById("taskInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("welcomeModal");
    const modalText = document.getElementById("modalText");
    const closeBtn = document.getElementById("closeModal");

    // GANTI TANGGAL RAMADAN DI SINI
    const RAMADAN_START = new Date("2026-02-18");

    const today = new Date();
    const diffTime = today.getTime() - RAMADAN_START.getTime();
    const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let message = "";

    if (day >= 1 && day <= 10) {
        message =
        "Ini awal perjalananmu. Bangun niat yang benar, kuatkan disiplin, dan jangan sia-siakan momentum yang jarang datang dua kali.";
    } 
    else if (day >= 11 && day <= 20) {
        message =
        "Semangat awal mungkin mulai menurun. Sekarang yang diuji adalah konsistensimu. Apakah kamu tetap serius saat tidak ada yang melihat?";
    } 
    else if (day >= 21 && day <= 30) {
        message =
        "Ramadan hampir berakhir. Jangan biarkan ia pergi tanpa perubahan nyata dalam dirimu. Waktu tidak bisa diulang. Gunakan hari ini sebaik mungkin.";
    } 
    else {
        message =
        "Setiap hari adalah kesempatan untuk memperbaiki diri. Jangan menunggu momen spesial untuk berubah.";
    }

    modalText.textContent = message;

    modal.classList.add("show");

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });
});
