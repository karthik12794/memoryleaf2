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

// 🌍 Backend API base URL
const API_URL = "https://memoryleaf-backend-1.onrender.com";

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
    const res = await fetch(`${API_URL}/getPage?date=${encodeURIComponent(currentDate)}&page=${currentPage}`);
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
document.getElementById("loginBtn").onclick = () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user && pass) {
    login.classList.add("hidden");
    vaultAnim.classList.remove("hidden");
    const vaultVideo = document.getElementById("vaultVideo");
    vaultVideo.play();
  } else {
    alert("Enter username & password!");
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
  bookVideo.play();
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
    await fetch(`${API_URL}/savePage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        page: currentPage,
        content: pageText.value,
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

  if (fileInput.files.length > 0) {
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

// Forgot Password / Create Account (dummy for now)
document.getElementById("forgotPassword").onclick = () => {
  alert("Password reset feature will be added later.");
};
document.getElementById("createAccount").onclick = () => {
  alert("Account creation feature will be added later.");
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


