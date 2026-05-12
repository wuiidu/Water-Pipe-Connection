// ẨN/HIỆN BẢNG ĐĂNG NHẬP/ĐĂNG KÝ

const nutDangNhap = document.getElementById("nutDangNhap");
const dangNhap_NutThoat = document.getElementById("dangNhap_NutThoat");
const khungDangNhap = document.getElementById("khungDangNhap");
const lopPhu_BangDangNhap = document.getElementById("lopPhu_BangDangNhap");

// Hàm để mở bảng đăng nhập/đăng ký
function moDangNhap() {
  khungDangNhap.style.display = "block";
  lopPhu_BangDangNhap.style.display = "block";
}

// Hàm để đóng bảng đăng nhập/đăng ký
function dongDangNhap() {
  khungDangNhap.style.display = "none";
  lopPhu_BangDangNhap.style.display = "none";

  // Reset về bảng đăng nhập khi đóng, đặt tgian để tránh bị giật hình
  setTimeout(() => {
    bangDangKy.style.display = "none";
    bangDangNhap.style.display = "flex";
  }, 200);
}

// Gán sự kiện click
nutDangNhap.addEventListener("click", function () {
  const userHienTai = localStorage.getItem("userHienTai");
  if (userHienTai) {
    // Nếu đang đăng nhập thì hỏi đăng xuất
    const xacNhan = confirm("Are you sure you want to sign out?");
    if (xacNhan) {
      dangXuat();
    }
  } else {
    // Nếu chưa đăng nhập thì mở bảng
    moDangNhap();
  }
});
dangNhap_NutThoat.addEventListener("click", dongDangNhap);

// ----------------------------------------------------------------------------------------------------------------------------
// CHUYỂN ĐỔI GIỮA BẢNG ĐĂNG NHẬP VÀ ĐĂNG KÝ

const bangDangNhap = document.querySelector(".BangDangNhap");
const bangDangKy = document.querySelector(".BangDangKy");
const linkDangKy = document.getElementById("linkDangKy");
const linkDangNhap = document.getElementById("linkDangNhap");

// Hàm chuyển sang bảng Đăng Ký
function chuyenSangDangKy(event) {
  event.preventDefault();
  bangDangNhap.style.display = "none";
  bangDangKy.style.display = "flex";
}

// Hàm chuyển sang bảng Đăng Nhập
function chuyenSangDangNhap(event) {
  event.preventDefault();
  bangDangKy.style.display = "none";
  bangDangNhap.style.display = "flex";
}

// Gán sự kiện click
linkDangKy.addEventListener("click", chuyenSangDangKy);
linkDangNhap.addEventListener("click", chuyenSangDangNhap);

// ----------------------------------------------------------------------------------------------------------------------------
// QUÊN MẬT KHẨU

const linkQuenMatKhau = document.getElementById("linkQuenMatKhau");

// Hàm bắt đầu quá trình quên mật khẩu
function thucHienQuenMatKhau() {
  // Nhập Username và kiểm tra tồn tại
  function promptUsername() {
    const username = prompt("Please enter your username:");
    if (username === null) return;
    if (username.trim() === "") {
      alert("Please enter your username!");
      promptUsername();
      return;
    }
    const danhSachUser = JSON.parse(localStorage.getItem("danhSachUser")) || [];
    const userTonTai = danhSachUser.find((user) => user.username === username);
    if (!userTonTai) {
      alert("Username not found! Please try again.");
      promptUsername();
      return;
    }
    promptNewPassword(username);
  }

  // Nhập Mật khẩu mới
  function promptNewPassword(username) {
    const newPassword = prompt("Please enter your new password:");
    if (newPassword === null) return;
    if (newPassword.trim() === "") {
      alert("Password cannot be empty!");
      promptNewPassword(username);
      return;
    }
    promptConfirmPassword(username, newPassword);
  }

  // Xác nhận và Lưu mật khẩu mới
  function promptConfirmPassword(username, newPassword) {
    const confirmPassword = prompt("Please confirm your new password:");
    if (confirmPassword === null) return;
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match! Please try again.");
      promptNewPassword(username);
      return;
    }
    const danhSachUser = JSON.parse(localStorage.getItem("danhSachUser")) || [];
    const index = danhSachUser.findIndex((user) => user.username === username);
    if (index !== -1) {
      danhSachUser[index].password = newPassword;
      localStorage.setItem("danhSachUser", JSON.stringify(danhSachUser));
      alert(
        "Password changed successfully! Please login with your new password."
      );
    }
  }
  promptUsername();
}

// Gán sự kiện click cho link "Forgot your password?"
linkQuenMatKhau.addEventListener("click", (event) => {
  event.preventDefault();
  thucHienQuenMatKhau();
});

// ----------------------------------------------------------------------------------------------------------------------------
// ICON MẮT (HIỆN/ẨN MẬT KHẨU)

const matKhau_DnPass = document.getElementById("matKhau_DnPass");
const matKhau_DnEye = document.getElementById("matKhau_DnEye");

const matKhau_DkPass = document.getElementById("matKhau_DkPass");
const matKhau_DkEye = document.getElementById("matKhau_DkEye");

const matKhau_XnPass = document.getElementById("matKhau_XnPass");
const matKhau_XnEye = document.getElementById("matKhau_XnEye");

const eyeOpen = "Images/svg/Eye/EyeOpen.svg";
const eyeClose = "Images/svg/Eye/EyeClose.svg";

// Hàm chuyển đổi loại ẩn/hiện mật khẩu
function togglePasswordVisibility(input, icon) {
  if (input.type === "password") {
    input.type = "text";
    icon.src = eyeOpen;
  } else {
    input.type = "password";
    icon.src = eyeClose;
  }
}

// Gán sự kiện click cho từng icon
matKhau_DnEye.addEventListener("click", () => {
  togglePasswordVisibility(matKhau_DnPass, matKhau_DnEye);
});
matKhau_DkEye.addEventListener("click", () => {
  togglePasswordVisibility(matKhau_DkPass, matKhau_DkEye);
});
matKhau_XnEye.addEventListener("click", () => {
  togglePasswordVisibility(matKhau_XnPass, matKhau_XnEye);
});

// ============================================================================================================================
// LOGIC ĐĂNG KÝ - ĐĂNG NHẬP - ĐĂNG XUẤT

const inputUserDK = document.querySelector(".DangKy-TenTK input");
const inputPassDK = document.getElementById("matKhau_DkPass");
const inputPassXnDK = document.getElementById("matKhau_XnPass");
const btnDangKy = document.querySelector(".DangKy-Nut");

const inputUserDN = document.querySelector(".DangNhap-TenTK input");
const inputPassDN = document.getElementById("matKhau_DnPass");
const btnDangNhap = document.querySelector(".DangNhap-Nut");

// Hàm Đăng Ký
btnDangKy.addEventListener("click", function () {
  const username = inputUserDK.value.trim();
  const password = inputPassDK.value.trim();
  const confirmPass = inputPassXnDK.value.trim();

  // Kiểm tra rỗng
  if (!username || !password || !confirmPass) {
    alert("Please enter all required information!");
    return;
  }

  // Kiểm tra mật khẩu khớp
  if (password !== confirmPass) {
    alert("Passwords do not match!");
    return;
  }

  // Lấy danh sách user từ LocalStorage
  let danhSachUser = JSON.parse(localStorage.getItem("danhSachUser")) || [];

  // Kiểm tra tài khoản tồn tại
  const userTonTai = danhSachUser.find((user) => user.username === username);
  if (userTonTai) {
    alert("This username is already taken!");
    return;
  }

  // Lưu tài khoản mới
  danhSachUser.push({
    username: username,
    password: password,
    highScore: 0,
    totalGames: 0,
    totalWins: 0,
  });
  localStorage.setItem("danhSachUser", JSON.stringify(danhSachUser));

  // Thông báo và chuyển tab
  alert("Registration successful!");

  // Reset form đăng ký
  inputUserDK.value = "";
  inputPassDK.value = "";
  inputPassXnDK.value = "";

  // Chuyển sang bảng đăng nhập
  document.getElementById("linkDangNhap").click();
});

// Hàm Đăng Nhập
btnDangNhap.addEventListener("click", function () {
  const username = inputUserDN.value.trim();
  const password = inputPassDN.value.trim();

  if (!username || !password) {
    alert("Please enter username and password!");
    return;
  }

  const danhSachUser = JSON.parse(localStorage.getItem("danhSachUser")) || [];

  // Tìm user khớp
  const userDung = danhSachUser.find(
    (user) => user.username === username && user.password === password
  );

  if (userDung) {
    localStorage.setItem("userHienTai", username);
    capNhatGiaoDienDaDangNhap(username);
    if (window.capNhatHienThiDiemCao) window.capNhatHienThiDiemCao();
    dongDangNhap();
    inputUserDN.value = "";
    inputPassDN.value = "";
  } else {
    alert("Incorrect username or password!");
  }
});

// Hàm Đăng Xuất
function dangXuat() {
  localStorage.removeItem("userHienTai");
  nutDangNhap.innerText = "Login | Register";
  if (window.capNhatHienThiDiemCao) window.capNhatHienThiDiemCao();
}

// Hàm Cập nhật giao diện
function capNhatGiaoDienDaDangNhap(username) {
  nutDangNhap.innerText = username;
}

// Kiểm tra trạng thái khi tải lại trang
document.addEventListener("DOMContentLoaded", function () {
  const userHienTai = localStorage.getItem("userHienTai");
  if (userHienTai) {
    capNhatGiaoDienDaDangNhap(userHienTai);
  }
});

// ============================================================================================================================
