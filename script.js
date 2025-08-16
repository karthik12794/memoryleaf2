const login = document.getElementById("login");
const vaultAnim = document.getElementById("vaultAnim");
const welcome = document.getElementById("welcome");
const bookAnim = document.getElementById("bookAnim");
const diary = document.getElementById("diary");

const pageText = document.getElementById("pageText");
const dateDisplay = document.getElementById("dateDisplay");
const pageNumber = document.getElementById("pageNumber");
const datePicker = document.getElementById("datePicker");

let diaryData = {};  
let currentDate = null;
let currentPage = 0;

// 📅 Format date
function formatDate(dateObj) {
  return dateObj.toDateString(); // Example: "Sat Aug 17 2025"
}

// 📅 Update date display
function updateDateDisplay() {
  dateDisplay.textContent = currentDate;
  datePicker.valueAsDate = new Date(currentDate);
}

// 📝 Load current page
function loadPage() {
  if (!diaryData[currentDate]) diaryData[currentDate] = [""];
  pageText.value = diaryData[currentDate][currentPage];
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

// 💾 Save Page
document.getElementById("savePage").onclick = () => {
  diaryData[currentDate][currentPage] = pageText.value;
  alert(`✅ Page ${currentPage + 1} saved for ${currentDate}`);
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
  if (!diaryData[currentDate][currentPage]) diaryData[currentDate].push("");
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
