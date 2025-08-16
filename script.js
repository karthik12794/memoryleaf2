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
let userId = null; // logged-in userId

// 🌍 Backend API base URL
const API_URL = "https://memoryleaf-backend-1.onrender.com";

// 📅 Format date
function formatDate(dateObj) {
  return dateObj.toDateString();
}

function updateDateDisplay() {
  dateDisplay.textContent = currentDate;
  datePicker.valueAsDate = new Date(currentDate);
}

// 📝 Load page from backend
async function loadPage() {
  try {
    const res = await fetch(
      `${API_URL}/getPage?userId=${userId}&date=${encodeURIComponent(
        currentDate
      )}&page=${currentPage}`
    );
    const data = await res.json();
    pageText.value = data.content || "";
  } catch (err) {
    console.error("Error loading page:", err);
    pageText.value = "";
  }
  pageNumber.textContent = `Page ${currentPage + 1}`;
  updateDateDisplay();
}

// 🔐 Login
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
      document.getElementById("vaultVideo").play();
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("❌ Unable to login.");
  }
};

// 🆕 Register
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

    if (res.ok) {
      alert("✅ Account created. Please login!");
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Register error:", err);
    alert("❌ Unable to create account.");
  }
};

// Vault → Welcome
document.getElementById("vaultVideo").addEventListener("ended", () => {
  vaultAnim.classList.add("hidden");
  welcome.classList.remove("hidden");
});

// Welcome → Book
document.getElementById("openDiaryBtn").onclick = () => {
  welcome.classList.add("hidden");
  bookAnim.classList.remove("hidden");
  document.getElementById("bookVideo").play();
};

// Book → Diary
document.getElementById("bookVideo").addEventListener("ended", () => {
  bookAnim.classList.add("hidden");
  diary.classList.remove("hidden");

  currentDate = formatDate(new Date());
  currentPage = 0;
  loadPage();
});

// 💾 Save Page
document.getElementById("savePage").onclick = async () => {
  try {
    await fetch(`${API_URL}/savePage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        date: currentDate,
        page: currentPage,
        content: pageText.value,
      }),
    });
    alert(`✅ Page ${currentPage + 1} saved for ${currentDate}`);
  } catch (err) {
    console.error(err);
    alert("❌ Error saving page.");
  }
};

// ⬅️➡️ Navigation
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

// 📅 Jump to date
datePicker.onchange = () => {
  const pickedDate = new Date(datePicker.value);
  if (pickedDate.toString() !== "Invalid Date") {
    currentDate = formatDate(pickedDate);
    currentPage = 0;
    loadPage();
  }
};

// 🌙 Theme
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
};

// 🎵 Song
document.getElementById("playSong").onclick = () => {
  const fileInput = document.querySelector('input[type="file"][accept="audio/*"]');
  const songUrl = document.getElementById("songUrl").value;
  const audioPlayer = document.getElementById("audioPlayer");

  if (fileInput.files.length > 0) {
    audioPlayer.src = URL.createObjectURL(fileInput.files[0]);
    audioPlayer.play();
  } else if (songUrl) {
    audioPlayer.src = songUrl;
    audioPlayer.play();
  } else {
    alert("Please upload a song or paste a link.");
  }
};

// Forgot Password dummy
document.getElementById("forgotPassword").onclick = () => {
  alert("Password reset will be added later.");
};
