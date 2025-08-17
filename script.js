const login = document.getElementById("login");
const vaultAnim = document.getElementById("vaultAnim");
const welcome = document.getElementById("welcome");
const bookAnim = document.getElementById("bookAnim");
const diary = document.getElementById("diary");

const pageText = document.getElementById("pageText");
const dateDisplay = document.getElementById("dateDisplay");
const pageNumber = document.getElementById("pageNumber");
const datePicker = document.getElementById("datePicker");
const photoUpload = document.getElementById("photoUpload");
const photoPreview = document.getElementById("photoPreview");

let currentDate = null;
let currentPage = 0;
let userId = null;
let currentPhotos = []; // store up to 2 photos

// 🌍 Backend API
const API_URL = "https://memoryleaf-backend-1.onrender.com";

// 📅 Format date
function formatDate(dateObj) {
  return dateObj.toDateString();
}

// 📅 Update date display
function updateDateDisplay() {
  dateDisplay.textContent = currentDate;
  datePicker.valueAsDate = new Date(currentDate);
}

// 📝 Load current page
async function loadPage() {
  try {
    const res = await fetch(`${API_URL}/api/vault/${userId}`);
    const data = await res.json();

    const entries = data.filter((e) => e.site === currentDate);
    const entry = entries[currentPage];

    pageText.value = entry ? entry.password : "";

    // load photos if available
    currentPhotos = entry && entry.photos ? entry.photos : [];
    renderPhotos();
  } catch (err) {
    console.error("Error loading page:", err);
    pageText.value = "";
    currentPhotos = [];
    renderPhotos();
  }
  pageNumber.textContent = `Page ${currentPage + 1}`;
  updateDateDisplay();
}

// 📸 Render photos
function renderPhotos() {
  photoPreview.innerHTML = "";
  currentPhotos.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    photoPreview.appendChild(img);
  });
}

// 📤 Handle photo upload
photoUpload.addEventListener("change", () => {
  const files = Array.from(photoUpload.files);
  if (files.length + currentPhotos.length > 2) {
    alert("⚠ You can only add 2 photos per page.");
    return;
  }

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (currentPhotos.length < 2) {
        currentPhotos.push(e.target.result);
        renderPhotos();
      }
    };
    reader.readAsDataURL(file);
  });
});

// 💾 Save Page
document.getElementById("savePage").onclick = async () => {
  try {
    await fetch(`${API_URL}/api/vault`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        site: currentDate,
        username: "Diary",
        password: pageText.value,
        photos: currentPhotos, // ✅ save photos
      }),
    });
    alert(`✅ Page ${currentPage + 1} saved for ${currentDate}`);
  } catch (err) {
    alert("❌ Error saving page.");
    console.error(err);
  }
};

// 📄 Download PDF
document.getElementById("downloadPDF").onclick = async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`MemoryLeaf - ${currentDate} (Page ${currentPage + 1})`, 10, 10);
  doc.setFontSize(12);

  const text = pageText.value || "(Empty page)";
  doc.text(text, 10, 20, { maxWidth: 180 });

  let y = 40;
  for (let i = 0; i < currentPhotos.length; i++) {
    const img = currentPhotos[i];
    doc.addImage(img, "JPEG", 10, y, 60, 60);
    y += 70;
  }

  doc.save(`Diary_${currentDate}_Page${currentPage + 1}.pdf`);
};

// 🎵 Song
document.getElementById("playSong").onclick = () => {
  const fileInput = document.querySelector('input[type="file"][accept="audio/*"]');
  const songUrl = document.getElementById("songUrl").value;
  const audioPlayer = document.getElementById("audioPlayer");

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    audioPlayer.src = URL.createObjectURL(file);
    audioPlayer.play();
  } else if (songUrl) {
    audioPlayer.src = songUrl;
    audioPlayer.play();
  } else {
    alert("Please upload a song file or paste a song link.");
  }
};

// 🌙 Toggle Theme
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
};

// Forgot Password
document.getElementById("forgotPassword").onclick = () => {
  alert("Password reset feature will be added later.");
};

// Create Account
document.getElementById("createAccount").onclick = async () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) return alert("Enter username & password!");

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const data = await res.json();
    res.ok ? alert("✅ Account created!") : alert("❌ " + data.error);
  } catch (err) {
    console.error("Register error:", err);
    alert("Server error.");
  }
};

// Login
document.getElementById("loginBtn").onclick = async () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) return alert("Enter username & password!");

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const data = await res.json();
    if (res.ok) {
      userId = data.userId;
      localStorage.setItem("userId", userId);

      login.classList.add("hidden");
      vaultAnim.classList.remove("hidden");

      const v = document.getElementById("vaultVideo");
      const btn = document.getElementById("vaultPlay");
      tryAutoplay(v, btn);
    } else alert("❌ " + data.error);
  } catch (err) {
    console.error("Login error:", err);
    alert("Server error.");
  }
};

// Vault → Welcome
document.getElementById("vaultVideo").addEventListener("ended", () => {
  vaultAnim.classList.add("hidden");
  welcome.classList.remove("hidden");
});

// Welcome → Book Animation
document.getElementById("openDiaryBtn").onclick = () => {
  welcome.classList.add("hidden");
  bookAnim.classList.remove("hidden");
  tryAutoplay(document.getElementById("bookVideo"), document.getElementById("bookPlay"));
};

// Book → Diary
document.getElementById("bookVideo").addEventListener("ended", () => {
  bookAnim.classList.add("hidden");
  diary.classList.remove("hidden");

  currentDate = formatDate(new Date());
  currentPage = 0;
  loadPage();
});

// ⬅️➡️ Navigation
document.getElementById("nextPage").onclick = () => { currentPage++; loadPage(); };
document.getElementById("prevPage").onclick = () => {
  if (currentPage > 0) { currentPage--; loadPage(); }
  else alert("No previous page for this date!");
};

// 📅 Jump date
datePicker.onchange = () => {
  const picked = new Date(datePicker.value);
  if (picked.toString() !== "Invalid Date") {
    currentDate = formatDate(picked);
    currentPage = 0;
    loadPage();
  }
};

// --- Video autoplay helper ---
function tryAutoplay(videoEl, buttonEl) {
  if (!videoEl) return;
  const attempt = () => videoEl.play().catch(() => {
    if (buttonEl) buttonEl.classList.remove("hidden");
  });
  attempt();
  videoEl.addEventListener("loadeddata", attempt, { once: true });
  if (buttonEl) {
    buttonEl.addEventListener("click", () => {
      videoEl.play(); buttonEl.classList.add("hidden");
    });
  }
}
