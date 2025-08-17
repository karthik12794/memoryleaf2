const login = document.getElementById("login");
const vaultAnim = document.getElementById("vaultAnim");
const welcome = document.getElementById("welcome");
const bookAnim = document.getElementById("bookAnim");
const diary = document.getElementById("diary");

const pageText = document.getElementById("pageText");
const dateDisplay = document.getElementById("dateDisplay");
const pageNumber = document.getElementById("pageNumber");
const datePicker = document.getElementById("datePicker");

let currentDate = null;
let currentPage = 0;
let userId = null; // store logged-in user

// 🌍 Backend API base URL
const API_URL = "https://memoryleaf-backend-1.onrender.com";

// ✅ Prevent all forms from auto-submitting (fix buttons not working)
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => e.preventDefault());
});

// 📅 Format date
function formatDate(dateObj) {
  return dateObj.toDateString(); // Example: "Sat Aug 17 2025"
}

// 📅 Update date display
function updateDateDisplay() {
  dateDisplay.textContent = currentDate;
  datePicker.valueAsDate = new Date(currentDate);
}

// 📝 Load current page from backend
async function loadPage() {
  try {
    const res = await fetch(`${API_URL}/api/vault/${userId}`);
    const data = await res.json();

    // Filter by current date (backend stores date in "site", content in "password")
    const entries = data.filter((e) => e.site === currentDate);

    // Get entry for this page
    const entry = entries[currentPage];
    pageText.value = entry ? entry.password : "";
  } catch (err) {
    console.error("Error loading page:", err);
    pageText.value = "";
  }
  pageNumber.textContent = `Page ${currentPage + 1}`;
  updateDateDisplay();
}

// --- Autoplay fallback helper ---
function tryAutoplay(videoEl, buttonEl) {
  if (!videoEl) return;
  const attempt = () =>
    videoEl.play().catch(() => {
      if (buttonEl) buttonEl.classList.remove("hidden");
    });

  attempt();
  videoEl.addEventListener("loadeddata", attempt, { once: true });

  if (buttonEl) {
    buttonEl.addEventListener("click", () => {
      videoEl.play();
      buttonEl.classList.add("hidden");
    });
  }
}

// 🔐 Login
document.getElementById("loginBtn").onclick = async () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) {
    return alert("Enter username & password!");
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const data = await res.json();
    if (res.ok) {
      userId = data.userId; // ✅ store logged-in user
      localStorage.setItem("userId", userId);

      login.classList.add("hidden");
      vaultAnim.classList.remove("hidden");

      const v = document.getElementById("vaultVideo");
      const btn = document.getElementById("vaultPlay");
      tryAutoplay(v, btn);
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Server error, try again later.");
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
  const bookVideo = document.getElementById("bookVideo");
  const bookBtn = document.getElementById("bookPlay");
  tryAutoplay(bookVideo, bookBtn);
};

// Book → Diary
document.getElementById("bookVideo").addEventListener("ended", () => {
  bookAnim.classList.add("hidden");
  diary.classList.remove("hidden");

  currentDate = formatDate(new Date());
  currentPage = 0;
  loadPage();
});

// 💾 Save Page to backend
document.getElementById("savePage").onclick = async () => {
  try {
    await fetch(`${API_URL}/api/vault`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        site: currentDate, // storing date in "site" field
        username: "Diary",
        password: pageText.value, // storing diary text in "password" field
      }),
    });
    alert(`✅ Page ${currentPage + 1} saved for ${currentDate}`);
  } catch (err) {
    alert("❌ Error saving page. Check console.");
    console.error(err);
  }
};

// 🌙 Toggle Theme
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
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

// Forgot Password
document.getElementById("forgotPassword").onclick = () => {
  alert("Password reset feature will be added later.");
};

// ✅ Create Account (works with backend)
document.getElementById("createAccount").onclick = async () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) {
    return alert("Enter username & password!");
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Account created! You can now log in.");
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Register error:", err);
    alert("Server error, try again later.");
  }
};

// ⬅️➡️ Page Navigation
document.getElementById("nextPage").onclick = () => {
  currentPage++;
  loadPage();
};

document.getElementById("prevPage").onclick = () => {
  if (currentPage > 0) {
    currentPage--;
    loadPage();
  } else {
    alert("No previous page for this date!");
  }
};

// 📅 Jump to selected date
datePicker.onchange = () => {
  const pickedDate = new Date(datePicker.value);
  if (pickedDate.toString() !== "Invalid Date") {
    currentDate = formatDate(pickedDate);
    currentPage = 0;
    loadPage();
  }
};
