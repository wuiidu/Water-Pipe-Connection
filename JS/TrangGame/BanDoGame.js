// BẢN ĐỒ GAME (MIN: 3x8, MAX: 5x12)

// Biến toàn cục để kiểm tra xem game đã thắng chưa
let daKetNoiThanhCong = false;

// Biến cờ đánh dấu đang chạy chế độ đầu hàng (AI chơi hộ Player)
window.dangChayCheDoDauHang = false;

document.addEventListener("DOMContentLoaded", function () {
  const khungGame = document.querySelector(".KhungGame");
  const mapOption = sessionStorage.getItem("mapOption");
  const mapSize = sessionStorage.getItem("mapSize");
  const difficulty = sessionStorage.getItem("difficulty") || "easy";
  const gameMode = sessionStorage.getItem("gameMode");
  console.log("Map Option:", mapOption);
  console.log("Difficulty:", difficulty);

  // Biến toàn cục để lưu ô vàng đang được chọn
  let oVuongVangDuocChon = null;

  // Xác định số hàng và số cột
  const SO_HANG = 5;
  const SO_COT = 12;
  const TONG_SO_O = SO_HANG * SO_COT;

  // Tạo các ô bằng vòng lặp
  for (let i = 0; i < TONG_SO_O; i++) {
    const oVuong = document.createElement("div");
    oVuong.classList.add("KhungGame-OVuong");

    // Tính toán hàng (từ 1-5) và cột (từ 1-12)
    const row = Math.floor(i / SO_COT) + 1;
    const col = (i % SO_COT) + 1;

    oVuong.dataset.row = row;
    oVuong.dataset.col = col;

    khungGame.appendChild(oVuong);
  }

  // Hàm thêm ảnh vào ô bất kỳ
  function themAnhVaoO(row, col, tenFileAnh, gocXoayMacDinh = 0) {
    const oCanChen = document.querySelector(
      `.KhungGame-OVuong[data-row="${row}"][data-col="${col}"]`
    );

    if (oCanChen) {
      // Xóa nội dung cũ và viền xanh test
      oCanChen.innerHTML = "";
      oCanChen.style.border = "none";

      // Tự động gán hành vi dựa trên file
      if (tenFileAnh.includes("OngXanh/")) {
        oCanChen.classList.add("co-the-xoay");
        if (gameMode === "ai") {
          oCanChen.style.cursor = "default";
        }
      } else if (tenFileAnh.includes("OngVang/")) {
        oCanChen.classList.add("co-the-trao-doi");
        if (gameMode === "ai") {
          oCanChen.style.cursor = "default";
        }
      }

      if (tenFileAnh.includes("-Thang.svg")) {
        // LOGIC ỐNG THẲNG
        const ongWrapper = document.createElement("div");
        ongWrapper.classList.add("Ong-Wrapper");
        ongWrapper.innerHTML = svgNuocThang;

        const imgOng = document.createElement("img");
        imgOng.src = `Images/svg/Ong/${tenFileAnh}`;
        imgOng.classList.add("AnhOngNuoc");
        ongWrapper.appendChild(imgOng);
        ongWrapper.style.transform = `rotate(${gocXoayMacDinh}deg)`;
        ongWrapper.dataset.rotation = gocXoayMacDinh;
        oCanChen.appendChild(ongWrapper);
      } else if (tenFileAnh.includes("-ChuThap.svg")) {
        // LOGIC ỐNG CHỮ THẬP
        const ongWrapper = document.createElement("div");
        ongWrapper.classList.add("Ong-Wrapper");
        ongWrapper.innerHTML = svgNuocChuThapToanPhan;

        const imgOng = document.createElement("img");
        imgOng.src = `Images/svg/Ong/${tenFileAnh}`;
        imgOng.classList.add("AnhOngNuoc");
        ongWrapper.appendChild(imgOng);
        ongWrapper.style.transform = `rotate(${gocXoayMacDinh}deg)`;
        ongWrapper.dataset.rotation = gocXoayMacDinh;
        oCanChen.appendChild(ongWrapper);
      } else if (tenFileAnh.includes("-ChuL.svg")) {
        // LOGIC ỐNG CHỮ L
        const ongWrapper = document.createElement("div");
        ongWrapper.classList.add("Ong-Wrapper");
        ongWrapper.innerHTML = svgNuocChuL;

        const imgOng = document.createElement("img");
        imgOng.src = `Images/svg/Ong/${tenFileAnh}`;
        imgOng.classList.add("AnhOngNuoc");
        ongWrapper.appendChild(imgOng);
        ongWrapper.style.transform = `rotate(${gocXoayMacDinh}deg)`;
        ongWrapper.dataset.rotation = gocXoayMacDinh;
        oCanChen.appendChild(ongWrapper);
      } else {
        // LOGIC CÁC ỐNG CÒN LẠI
        const imgOng = document.createElement("img");
        imgOng.src = `Images/svg/Ong/${tenFileAnh}`;
        imgOng.classList.add("AnhOngNuoc");
        imgOng.style.transform = `rotate(${gocXoayMacDinh}deg)`;
        imgOng.dataset.rotation = gocXoayMacDinh;
        oCanChen.appendChild(imgOng);
      }
    } else {
      console.warn(`Không tìm thấy ô ${row}x${col}`);
    }
  }

  // Truyền hàm 'themAnhVaoO' và kích thước lưới vào
  if (mapOption === "custom") {
    const sizeStr = sessionStorage.getItem("mapSize") || "3x8";
    const [r, c] = sizeStr.split("x").map(Number);
    console.log(`Đang tạo bản đồ Custom: ${r}x${c}`);
    taoBanDoTuyChinh(themAnhVaoO, SO_HANG, SO_COT, r, c, difficulty);
  } else {
    taoBanDoNgauNhien(themAnhVaoO, SO_HANG, SO_COT, difficulty);
  }

  // Kích hoạt AI nếu đúng chế độ
  khoiChayAI();

  // Hàm tráo đổi ống chữ L
  function swapPipeContents(o1, o2) {
    const tempHTML = o1.innerHTML;
    o1.innerHTML = o2.innerHTML;
    o2.innerHTML = tempHTML;
  }

  // Click trên toàn bộ khung game
  khungGame.addEventListener("click", function (event) {
    // Nếu là chế độ AI thì chặn hoàn toàn thao tác của người dùng
    if (gameMode === "ai") return;

    // Nếu đang chạy chế độ đầu hàng thì chặn người chơi can thiệp
    if (window.dangChayCheDoDauHang) return;

    if (daKetNoiThanhCong) return;

    const oDuocClick = event.target.closest(".KhungGame-OVuong");

    // Bỏ chọn ống vàng nếu click ra ngoài hoặc vào ô không tương tác
    if (!oDuocClick) {
      if (oVuongVangDuocChon) {
        oVuongVangDuocChon.classList.remove("dang-chon-de-trao-doi");
        oVuongVangDuocChon = null;
      }
      return;
    }

    // LOGIC XOAY ỐNG
    if (oDuocClick.classList.contains("co-the-xoay")) {
      // Nếu đang chọn ống vàng thì bỏ chọn
      if (oVuongVangDuocChon) {
        oVuongVangDuocChon.classList.remove("dang-chon-de-trao-doi");
        oVuongVangDuocChon = null;
      }

      const ongWrapper = oDuocClick.querySelector(".Ong-Wrapper");
      const imgBenTrong = oDuocClick.querySelector(".AnhOngNuoc");
      const phanTuDeXoay = ongWrapper ? ongWrapper : imgBenTrong;

      if (phanTuDeXoay) {
        if (phanTuDeXoay.dataset.dangXoay === "true") {
          return;
        }

        phatAmThanhXoay();
        phanTuDeXoay.dataset.dangXoay = "true";
        let gocXoayHienTai = parseInt(phanTuDeXoay.dataset.rotation || 0, 10);
        const gocXoayMoi = gocXoayHienTai + 90;
        phanTuDeXoay.style.transform = `rotate(${gocXoayMoi}deg)`;
        phanTuDeXoay.dataset.rotation = gocXoayMoi;

        setTimeout(() => {
          phanTuDeXoay.dataset.dangXoay = "false";
          capNhatLuongNuoc();
        }, 300);
      }
    }
    // LOGIC TRÁO ĐỔI (Ống Vàng)
    else if (oDuocClick.classList.contains("co-the-trao-doi")) {
      if (!oVuongVangDuocChon) {
        // Lần click đầu tiên: Chọn ống vàng
        oVuongVangDuocChon = oDuocClick;
        oVuongVangDuocChon.classList.add("dang-chon-de-trao-doi");
      } else {
        // Lần click thứ hai
        if (oVuongVangDuocChon === oDuocClick) {
          // Click lại chính nó: Bỏ chọn
          oVuongVangDuocChon.classList.remove("dang-chon-de-trao-doi");
          oVuongVangDuocChon = null;
        } else {
          // Click vào một ống vàng khác, kiểm tra xem có kề nhau không
          const row1 = parseInt(oVuongVangDuocChon.dataset.row);
          const col1 = parseInt(oVuongVangDuocChon.dataset.col);
          const row2 = parseInt(oDuocClick.dataset.row);
          const col2 = parseInt(oDuocClick.dataset.col);

          const laLienKe =
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2);

          if (laLienKe) {
            // Hợp lệ: Tráo đổi
            swapPipeContents(oVuongVangDuocChon, oDuocClick);
            phatAmThanhDoiOng();

            // Bỏ chọn
            oVuongVangDuocChon.classList.remove("dang-chon-de-trao-doi");
            oVuongVangDuocChon = null;
            capNhatLuongNuoc();
          } else {
            // Không liền kề: Bỏ chọn ống cũ, chọn ống mới
            oVuongVangDuocChon.classList.remove("dang-chon-de-trao-doi");
            oVuongVangDuocChon = oDuocClick;
            oVuongVangDuocChon.classList.add("dang-chon-de-trao-doi");
          }
        }
      }
    }
    // LOGIC CLICK VÀO ỐNG CỐ ĐỊNH
    else {
      // Click vào ô không tương tác, bỏ chọn ống vàng
      if (oVuongVangDuocChon) {
        oVuongVangDuocChon.classList.remove("dang-chon-de-trao-doi");
        oVuongVangDuocChon = null;
      }
    }
  });

  khoiTaoDongHoThoiGian();
});

// ----------------------------------------------------------------------------------------------------------------------------
// LOGIC BẢN ĐỒ

// Tạo bản đồ Random
function taoBanDoNgauNhien(themAnhVaoO, SO_HANG_LUOI, SO_COT_LUOI, difficulty) {
  console.log("Đang tạo bản đồ ngẫu nhiên...");

  // Hệ số độ dài đường ống giải
  const HE_SO_DO_DAI = 2.0;
  // Số khoảng cách ô phạm vi giữa ống Bắt Đầu và ống Kết Thúc
  const KHOANG_CACH_AN_TOAN = 3;

  const kichThuocHopLe = [
    [3, 8],
    [3, 10],
    [3, 12],
    [5, 4],
    [5, 6],
    [5, 8],
    [5, 10],
    [5, 12],
  ];

  const indexNgauNhien = Math.floor(Math.random() * kichThuocHopLe.length);
  const kichThuocChon = kichThuocHopLe[indexNgauNhien];
  const mapRows = kichThuocChon[0];
  const mapCols = kichThuocChon[1];

  console.log(`Kích thước map ngẫu nhiên: ${mapRows}x${mapCols}`);

  const rowOffset = Math.floor((SO_HANG_LUOI - mapRows) / 2);
  const colOffset = Math.floor((SO_COT_LUOI - mapCols) / 2);
  const startRow = rowOffset + 1;
  const endRow = rowOffset + mapRows;
  const startCol = colOffset + 1;
  const endCol = colOffset + mapCols;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let canh = [0, 1, 2, 3];
  canh.sort(() => Math.random() - 0.5);
  const canhBatDau = canh[0];
  const canhKetThuc = canh[1];

  let startR, startC, startRotation, startDirection;
  let endR, endC, endRotation, endDirection;

  // Hướng xoay cho ống Bắt Đầu và Kết Thúc
  switch (canhBatDau) {
    case 0:
      startR = startRow;
      startC = getRandomInt(startCol, endCol);
      startRotation = 90;
      startDirection = 2;
      break;
    case 1:
      startR = getRandomInt(startRow, endRow);
      startC = endCol;
      startRotation = 180;
      startDirection = 3;
      break;
    case 2:
      startR = endRow;
      startC = getRandomInt(startCol, endCol);
      startRotation = 270;
      startDirection = 0;
      break;
    case 3:
      startR = getRandomInt(startRow, endRow);
      startC = startCol;
      startRotation = 0;
      startDirection = 1;
      break;
  }
  switch (canhKetThuc) {
    case 0:
      endR = startRow;
      endC = getRandomInt(startCol, endCol);
      endRotation = 90;
      endDirection = 2;
      break;
    case 1:
      endR = getRandomInt(startRow, endRow);
      endC = endCol;
      endRotation = 180;
      endDirection = 3;
      break;
    case 2:
      endR = endRow;
      endC = getRandomInt(startCol, endCol);
      endRotation = 270;
      endDirection = 0;
      break;
    case 3:
      endR = getRandomInt(startRow, endRow);
      endC = startCol;
      endRotation = 0;
      endDirection = 1;
      break;
  }

  let isTooClose =
    Math.abs(startR - endR) <= KHOANG_CACH_AN_TOAN &&
    Math.abs(startC - endC) <= KHOANG_CACH_AN_TOAN;
  let gioiHanThu = 0;
  while (isTooClose) {
    if (gioiHanThu > 50) {
      location.reload();
      return;
    }
    gioiHanThu++;
    switch (canhKetThuc) {
      case 0:
        endC = getRandomInt(startCol, endCol);
        break;
      case 1:
        endR = getRandomInt(startRow, endRow);
        break;
      case 2:
        endC = getRandomInt(startCol, endCol);
        break;
      case 3:
        endR = getRandomInt(startRow, endRow);
        break;
    }
    isTooClose =
      Math.abs(startR - endR) <= KHOANG_CACH_AN_TOAN &&
      Math.abs(startC - endC) <= KHOANG_CACH_AN_TOAN;
  }

  themAnhVaoO(startR, startC, "OngBatDau.svg", startRotation);
  themAnhVaoO(endR, endC, "OngKetThuc.svg", endRotation);

  const khoangCachManhattan = Math.abs(startR - endR) + Math.abs(startC - endC);
  const tongSoO = (endRow - startRow + 1) * (endCol - startCol + 1);
  let maxSteps = Math.floor(khoangCachManhattan * HE_SO_DO_DAI);
  const buocToiThieu = khoangCachManhattan + 2;
  const buocToiDaChoPhep = tongSoO - 2;
  maxSteps = Math.max(buocToiThieu, Math.min(maxSteps, buocToiDaChoPhep));

  const path = timDuongDanDFS(
    startR,
    startC,
    endR,
    endC,
    startRow,
    endRow,
    startCol,
    endCol,
    startDirection,
    endDirection,
    maxSteps
  );

  if (path) {
    sessionStorage.setItem("solutionPath", JSON.stringify(path));
    datOngChoDuongDan(
      path,
      themAnhVaoO,
      startRow,
      endRow,
      startCol,
      endCol,
      difficulty
    );
  } else {
    console.error("Không tìm được đường trong giới hạn bước! Thử lại...");
    taoBanDoNgauNhien(themAnhVaoO, SO_HANG_LUOI, SO_COT_LUOI, difficulty);
  }
}

// Tạo bản đồ Custom
function taoBanDoTuyChinh(
  themAnhVaoO,
  SO_HANG_LUOI,
  SO_COT_LUOI,
  mapRows,
  mapCols,
  difficulty
) {
  const HE_SO_DO_DAI = 2.0;
  const KHOANG_CACH_AN_TOAN = 3;

  const rowOffset = Math.floor((SO_HANG_LUOI - mapRows) / 2);
  const colOffset = Math.floor((SO_COT_LUOI - mapCols) / 2);
  const startRow = rowOffset + 1;
  const endRow = rowOffset + mapRows;
  const startCol = colOffset + 1;
  const endCol = colOffset + mapCols;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let canh = [0, 1, 2, 3];
  canh.sort(() => Math.random() - 0.5);
  const canhBatDau = canh[0];
  const canhKetThuc = canh[1];

  let startR, startC, startRotation, startDirection;
  let endR, endC, endRotation, endDirection;

  switch (canhBatDau) {
    case 0:
      startR = startRow;
      startC = getRandomInt(startCol, endCol);
      startRotation = 90;
      startDirection = 2;
      break;
    case 1:
      startR = getRandomInt(startRow, endRow);
      startC = endCol;
      startRotation = 180;
      startDirection = 3;
      break;
    case 2:
      startR = endRow;
      startC = getRandomInt(startCol, endCol);
      startRotation = 270;
      startDirection = 0;
      break;
    case 3:
      startR = getRandomInt(startRow, endRow);
      startC = startCol;
      startRotation = 0;
      startDirection = 1;
      break;
  }
  switch (canhKetThuc) {
    case 0:
      endR = startRow;
      endC = getRandomInt(startCol, endCol);
      endRotation = 90;
      endDirection = 2;
      break;
    case 1:
      endR = getRandomInt(startRow, endRow);
      endC = endCol;
      endRotation = 180;
      endDirection = 3;
      break;
    case 2:
      endR = endRow;
      endC = getRandomInt(startCol, endCol);
      endRotation = 270;
      endDirection = 0;
      break;
    case 3:
      endR = getRandomInt(startRow, endRow);
      endC = startCol;
      endRotation = 0;
      endDirection = 1;
      break;
  }

  let isTooClose =
    Math.abs(startR - endR) <= KHOANG_CACH_AN_TOAN &&
    Math.abs(startC - endC) <= KHOANG_CACH_AN_TOAN;
  let gioiHanThu = 0;
  while (isTooClose) {
    if (gioiHanThu > 50) {
      location.reload();
      return;
    }
    gioiHanThu++;
    switch (canhKetThuc) {
      case 0:
        endC = getRandomInt(startCol, endCol);
        break;
      case 1:
        endR = getRandomInt(startRow, endRow);
        break;
      case 2:
        endC = getRandomInt(startCol, endCol);
        break;
      case 3:
        endR = getRandomInt(startRow, endRow);
        break;
    }
    isTooClose =
      Math.abs(startR - endR) <= KHOANG_CACH_AN_TOAN &&
      Math.abs(startC - endC) <= KHOANG_CACH_AN_TOAN;
  }

  themAnhVaoO(startR, startC, "OngBatDau.svg", startRotation);
  themAnhVaoO(endR, endC, "OngKetThuc.svg", endRotation);

  const khoangCachManhattan = Math.abs(startR - endR) + Math.abs(startC - endC);
  const tongSoO = (endRow - startRow + 1) * (endCol - startCol + 1);
  let maxSteps = Math.floor(khoangCachManhattan * HE_SO_DO_DAI);
  const buocToiThieu = khoangCachManhattan + 2;
  const buocToiDaChoPhep = tongSoO - 2;
  maxSteps = Math.max(buocToiThieu, Math.min(maxSteps, buocToiDaChoPhep));

  const path = timDuongDanDFS(
    startR,
    startC,
    endR,
    endC,
    startRow,
    endRow,
    startCol,
    endCol,
    startDirection,
    endDirection,
    maxSteps
  );

  if (path) {
    sessionStorage.setItem("solutionPath", JSON.stringify(path));
    datOngChoDuongDan(
      path,
      themAnhVaoO,
      startRow,
      endRow,
      startCol,
      endCol,
      difficulty
    );
  } else {
    console.error("Không tìm được đường trong giới hạn bước! Thử lại...");
    taoBanDoTuyChinh(
      themAnhVaoO,
      SO_HANG_LUOI,
      SO_COT_LUOI,
      mapRows,
      mapCols,
      difficulty
    );
  }
}

// ----------------------------------------------------------------------------------------------------------------------------
// TẠO ĐƯỜNG ĐI NGẪU NHIÊN

// Dùng thuật toán DFS tìm đường đi ngẫu nhiên
function timDuongDanDFS(
  startR,
  startC,
  endR,
  endC,
  minR,
  maxR,
  minC,
  maxC,
  startDirection = null,
  endDirection = null,
  maxSteps = 100
) {
  let visited = new Set();
  let pathStack = [];
  let found = false;

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function dfs(r, c) {
    if (found) return;
    const id = `${r}-${c}`;

    // Điều kiện cơ bản
    if (visited.has(id) || r < minR || r > maxR || c < minC || c > maxC) {
      return;
    }

    // Điều kiện cắt tỉa
    const stepsSoFar = pathStack.length;
    const minDistToTarget = Math.abs(r - endR) + Math.abs(c - endC);

    // Nếu số bước đã đi + số bước tối thiểu cần để về đích > maxSteps, thì đường này vô vọng -> Quay lui ngay
    if (stepsSoFar + minDistToTarget > maxSteps) {
      return;
    }

    visited.add(id);
    pathStack.push({ r, c });

    if (r === endR && c === endC) {
      found = true;
      return;
    }

    let finalDirections = [...directions];
    shuffle(finalDirections);

    if (r === startR && c === startC && startDirection !== null) {
      const startDirVector = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
      ][startDirection];
      finalDirections = finalDirections.filter(
        (d) => d[0] !== startDirVector[0] || d[1] !== startDirVector[1]
      );
      finalDirections.unshift(startDirVector);
    }

    for (const [dr, dc] of finalDirections) {
      const nextR = r + dr;
      const nextC = c + dc;

      if (nextR === endR && nextC === endC && endDirection !== null) {
        let hopLe = false;
        if (endDirection === 0 && dr === 1 && dc === 0) hopLe = true;
        else if (endDirection === 1 && dr === 0 && dc === -1) hopLe = true;
        else if (endDirection === 2 && dr === -1 && dc === 0) hopLe = true;
        else if (endDirection === 3 && dr === 0 && dc === 1) hopLe = true;

        if (hopLe) dfs(nextR, nextC);
      } else {
        dfs(nextR, nextC);
      }

      if (found) return;
    }

    if (!found) {
      pathStack.pop();
    }
  }

  dfs(startR, startC);
  return found ? pathStack : null;
}

// Đặt các ống nước lên đường đi và lấp đầy các ô trống còn lại
function datOngChoDuongDan(
  path,
  themAnhVaoO,
  minR,
  maxR,
  minC,
  maxC,
  difficulty
) {
  // Cấu hình tỉ lệ xuất hiện
  const CONFIG = {
    XAC_SUAT_VANG_KHOI_TAO: 0.25,
    TI_LE_VANG_KE_NHAU: 0.5,
    MAX_VANG_LIEN_TIEP: 2,
    XAC_SUAT_ONG_DO: 0.15,
    XAC_SUAT_CHU_THAP: 0.1,
    XAC_SUAT_TUONG: 0.15,
  };

  // Điều chỉnh cấu hình dựa trên độ khó
  if (difficulty === "easy") {
    CONFIG.XAC_SUAT_VANG_KHOI_TAO = 0;
    CONFIG.XAC_SUAT_ONG_DO = 0;
    CONFIG.XAC_SUAT_TUONG = 0;
  } else if (difficulty === "medium") {
    CONFIG.XAC_SUAT_VANG_KHOI_TAO = 0;
  }

  let listOngVang = [];
  let pathSet = new Set();
  path.forEach((p) => pathSet.add(`${p.r}-${p.c}`));
  let demVangLienTiep = 0;

  // Xử lý đường ống giải
  for (let i = 1; i < path.length - 1; i++) {
    const cell = path[i];
    const prevCell = path[i - 1];
    const nextCell = path[i + 1];

    // Logic tính hướng
    let inDir, outDir;
    if (prevCell.r < cell.r) inDir = 0;
    else if (prevCell.r > cell.r) inDir = 2;
    else if (prevCell.c < cell.c) inDir = 3;
    else inDir = 1;
    if (nextCell.r < cell.r) outDir = 0;
    else if (nextCell.r > cell.r) outDir = 2;
    else if (nextCell.c < cell.c) outDir = 3;
    else outDir = 1;

    // Logic chọn màu sắc
    let mauSac = "OngXanh";
    let isVang = false;

    if (demVangLienTiep >= CONFIG.MAX_VANG_LIEN_TIEP) {
      isVang = false;
    } else {
      if (demVangLienTiep > 0) {
        if (Math.random() < CONFIG.TI_LE_VANG_KE_NHAU) isVang = true;
      } else {
        if (Math.random() < CONFIG.XAC_SUAT_VANG_KHOI_TAO) isVang = true;
      }
    }

    if (isVang) {
      mauSac = "OngVang";
      demVangLienTiep++;
    } else {
      demVangLienTiep = 0;
      const tyLeConLai = 1.0 - CONFIG.XAC_SUAT_VANG_KHOI_TAO;
      const tyLeDoTrongPhanConLai = CONFIG.XAC_SUAT_ONG_DO / tyLeConLai;
      if (Math.random() < tyLeDoTrongPhanConLai) mauSac = "OngDo";
      else mauSac = "OngXanh";
    }

    // Logic chọn hình dáng & góc xoay
    let hinhDang = "";
    let rotation = 0;
    const rShape = Math.random();

    if (Math.abs(inDir - outDir) === 2) {
      if (rShape < CONFIG.XAC_SUAT_CHU_THAP) hinhDang = "ChuThap";
      else hinhDang = "Thang";
      if (inDir === 0 || inDir === 2) rotation = 0;
      else rotation = 90;
    } else {
      if (rShape < CONFIG.XAC_SUAT_CHU_THAP) hinhDang = "ChuThap";
      else hinhDang = "ChuL";
      const dirs = [inDir, outDir].sort((a, b) => a - b);
      if (dirs[0] === 1 && dirs[1] === 2) rotation = 0;
      else if (dirs[0] === 2 && dirs[1] === 3) rotation = 90;
      else if (dirs[0] === 0 && dirs[1] === 3) rotation = 180;
      else if (dirs[0] === 0 && dirs[1] === 1) rotation = 270;
    }

    xuLyDatOng(cell.r, cell.c, mauSac, hinhDang, rotation);
  }

  // Reset biến đếm để dùng cho phần nhiễu
  demVangLienTiep = 0;

  // Lắp đầy các ô còn lại
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      // Bỏ qua nếu ô này đã thuộc đường giải
      if (pathSet.has(`${r}-${c}`)) continue;

      // Nếu random trúng tỉ lệ tường thì vẽ tường và bỏ qua phần tạo ống bên dưới
      if (Math.random() < CONFIG.XAC_SUAT_TUONG) {
        themAnhVaoO(r, c, "Tuong.png");
        continue;
      }

      // Logic chọn màu sắc
      let mauSac = "OngXanh";
      let isVang = false;

      if (demVangLienTiep >= CONFIG.MAX_VANG_LIEN_TIEP) {
        isVang = false;
      } else {
        if (demVangLienTiep > 0) {
          if (Math.random() < CONFIG.TI_LE_VANG_KE_NHAU) isVang = true;
        } else {
          if (Math.random() < CONFIG.XAC_SUAT_VANG_KHOI_TAO) isVang = true;
        }
      }

      if (isVang) {
        mauSac = "OngVang";
        demVangLienTiep++;
      } else {
        demVangLienTiep = 0;
        const tyLeConLai = 1.0 - CONFIG.XAC_SUAT_VANG_KHOI_TAO;
        const tyLeDoTrongPhanConLai = CONFIG.XAC_SUAT_ONG_DO / tyLeConLai;
        if (Math.random() < tyLeDoTrongPhanConLai) mauSac = "OngDo";
        else mauSac = "OngXanh";
      }

      // Logic chọn hình dáng ngẫu nhiên
      let hinhDang = "";
      const rShape = Math.random();
      if (rShape < CONFIG.XAC_SUAT_CHU_THAP) {
        hinhDang = "ChuThap";
      } else {
        hinhDang = Math.random() < 0.5 ? "Thang" : "ChuL";
      }

      // Logic chọn góc xoay ngẫu nhiên (0, 90, 180, 270)
      const rotation = Math.floor(Math.random() * 4) * 90;

      xuLyDatOng(r, c, mauSac, hinhDang, rotation);
    }
  }

  // Hàm xử lý đặt & lưu trữ
  function xuLyDatOng(r, c, mauSac, hinhDang, rotation) {
    const pipeType = `${mauSac}/${mauSac}-${hinhDang}.svg`;

    if (mauSac === "OngXanh") {
      // ỐNG XANH: Xoay ngẫu nhiên thêm một chút (dù là ô giải hay ô nhiễu)
      const randomOffset = (Math.floor(Math.random() * 3) + 1) * 90;
      const scrambledRotation = (rotation + randomOffset) % 360;
      themAnhVaoO(r, c, pipeType, scrambledRotation);
    } else if (mauSac === "OngVang") {
      // ỐNG VÀNG: Lưu lại để xử lý tráo đổi
      listOngVang.push({
        r: r,
        c: c,
        pipeType: pipeType,
        rotation: rotation,
      });
    } else {
      // ỐNG ĐỎ: Vẽ luôn
      themAnhVaoO(r, c, pipeType, rotation);
    }
  }

  // Xử lý cụm ống Vàng
  if (listOngVang.length > 0) {
    let visited = new Array(listOngVang.length).fill(false);

    function isNeighbor(p1, p2) {
      return Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c) === 1;
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    for (let i = 0; i < listOngVang.length; i++) {
      if (!visited[i]) {
        let clusterIndices = [i];
        visited[i] = true;

        let queue = [i];
        while (queue.length > 0) {
          let currentIdx = queue.shift();
          for (let j = 0; j < listOngVang.length; j++) {
            if (!visited[j]) {
              if (isNeighbor(listOngVang[currentIdx], listOngVang[j])) {
                visited[j] = true;
                clusterIndices.push(j);
                queue.push(j);
              }
            }
          }
        }

        let clusterContents = clusterIndices.map((idx) => ({
          pipeType: listOngVang[idx].pipeType,
          rotation: listOngVang[idx].rotation,
        }));

        if (clusterContents.length > 1) {
          shuffleArray(clusterContents);
        }

        for (let k = 0; k < clusterIndices.length; k++) {
          const originalIndex = clusterIndices[k];
          const pos = listOngVang[originalIndex];
          const newContent = clusterContents[k];
          themAnhVaoO(pos.r, pos.c, newContent.pipeType, newContent.rotation);
        }
      }
    }
  }
}

// ----------------------------------------------------------------------------------------------------------------------------
// HIỆU ỨNG CHO CÁC ỐNG

// Ống Thẳng
function batDauDongHoOngThang(ongWrapper, huongChay = "duoi-len") {
  let nuocRects = Array.from(ongWrapper.querySelectorAll(".OngThang_Nuoc"));

  if (nuocRects.length === 0) return;

  if (huongChay && huongChay.includes("tren-xuong")) {
    nuocRects.reverse();
  }

  // Thời gian dòng nước chảy
  const TONG_THOI_GIAN_DAY = 600;
  const soMucNuoc = nuocRects.length;
  const thoiGianMoiBuoc = TONG_THOI_GIAN_DAY / soMucNuoc;
  let mucNuocHienTai = 0;

  const nuocInterval = setInterval(() => {
    if (mucNuocHienTai < soMucNuoc) {
      nuocRects[mucNuocHienTai].style.opacity = 1;
      mucNuocHienTai++;
    } else {
      clearInterval(nuocInterval);
    }
  }, thoiGianMoiBuoc);
}

// Ống Chữ Thập
function batDauDongHoChuThapPhanNhanh(ongWrapper, huongDauVao = "duoi-len") {
  // Lấy các nhóm phần tử nước
  const nhanhDuoi = Array.from(ongWrapper.querySelectorAll(".Nuoc_NhanhDuoi"));
  const nhanhTren = Array.from(ongWrapper.querySelectorAll(".Nuoc_NhanhTren"));
  const nhanhTrai = Array.from(ongWrapper.querySelectorAll(".Nuoc_NhanhTrai"));
  const nhanhPhai = Array.from(ongWrapper.querySelectorAll(".Nuoc_NhanhPhai"));
  const nuocTam = ongWrapper.querySelector(".Nuoc_Tam");

  let dauVao = [];
  let cacDauRa = [];

  // Cấu hình hướng chảy
  switch (huongDauVao) {
    case "duoi-len":
      dauVao = nhanhDuoi;
      cacDauRa = [
        nhanhTren.reverse(),
        nhanhTrai.reverse(),
        nhanhPhai.reverse(),
      ];
      break;

    case "tren-xuong":
      dauVao = nhanhTren;
      cacDauRa = [
        nhanhDuoi.reverse(),
        nhanhTrai.reverse(),
        nhanhPhai.reverse(),
      ];
      break;

    case "trai-qua":
      dauVao = nhanhTrai;
      cacDauRa = [
        nhanhPhai.reverse(),
        nhanhTren.reverse(),
        nhanhDuoi.reverse(),
      ];
      break;

    case "phai-qua":
      dauVao = nhanhPhai;
      cacDauRa = [
        nhanhTrai.reverse(),
        nhanhTren.reverse(),
        nhanhDuoi.reverse(),
      ];
      break;

    default:
      return;
  }

  // Thời gian dòng nước chảy
  const TONG_THOI_GIAN = 450;
  const thoiGianDauVao = TONG_THOI_GIAN / 2;
  const thoiGianDauRa = TONG_THOI_GIAN / 2;

  chayDongNuoc(dauVao, thoiGianDauVao, () => {
    if (nuocTam) nuocTam.style.opacity = 1;

    cacDauRa.forEach((nhomNuoc) => {
      chayDongNuoc(nhomNuoc, thoiGianDauRa);
    });
  });
}

// Hàm phụ trợ để chạy hiệu ứng từng thanh nước
function chayDongNuoc(mangRect, thoiGianTong, callback) {
  if (mangRect.length === 0) {
    if (callback) callback();
    return;
  }

  const thoiGianMoiBuoc = thoiGianTong / mangRect.length;
  let index = 0;

  const interval = setInterval(() => {
    if (index < mangRect.length) {
      mangRect[index].style.opacity = 1;
      index++;
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, thoiGianMoiBuoc);
}

// Ống Chữ L
function batDauDongHoOngChuL(ongWrapper, huongChay = "duoi-qua-phai") {
  const rectsCum1 = Array.from(
    ongWrapper.querySelectorAll("#OngChuL_Cum1 .OngChuL_Nuoc")
  );
  const rectsCum2 = Array.from(
    ongWrapper.querySelectorAll("#OngChuL_Cum2 .OngChuL_Nuoc")
  );
  const rectsCum3 = Array.from(
    ongWrapper.querySelectorAll("#OngChuL_Cum3 .OngChuL_Nuoc")
  );
  const rectsCum4 = Array.from(
    ongWrapper.querySelectorAll("#OngChuL_Cum4 .OngChuL_Nuoc")
  );

  if (
    rectsCum1.length === 0 ||
    rectsCum2.length === 0 ||
    rectsCum3.length === 0 ||
    rectsCum4.length === 0
  ) {
    console.warn("Không tìm thấy đủ các thanh nước chữ L.");
    return;
  }

  const order_DuoiQuaPhai = [
    ...rectsCum1,
    ...rectsCum2,
    ...rectsCum4,
    ...rectsCum3,
  ];

  const order_PhaiXuongDuoi = [
    ...[...rectsCum3].reverse(),
    ...[...rectsCum4].reverse(),
    ...[...rectsCum2].reverse(),
    ...[...rectsCum1].reverse(),
  ];

  const rectsToAnimate =
    huongChay && huongChay.includes("phai-xuong-duoi")
      ? order_PhaiXuongDuoi
      : order_DuoiQuaPhai;

  // Thời gian dòng nước chảy
  const TONG_THOI_GIAN_DAY = 600;
  const soMucNuoc = rectsToAnimate.length;
  if (soMucNuoc === 0) return;

  const thoiGianMoiBuoc = TONG_THOI_GIAN_DAY / soMucNuoc;
  let mucNuocHienTai = 0;

  const nuocInterval = setInterval(() => {
    if (mucNuocHienTai < soMucNuoc) {
      rectsToAnimate[mucNuocHienTai].style.opacity = 1;
      mucNuocHienTai++;
    } else {
      clearInterval(nuocInterval);
    }
  }, thoiGianMoiBuoc);
}

// ============================================================================================================================
// LOGIC XỬ LÝ LUỒNG NƯỚC

// Cấu hình hướng mở của các loại ống (Mặc định khi chưa xoay)
// Quy ước: 0: Lên, 1: Phải, 2: Xuống, 3: Trái
const CAU_HINH_ONG = {
  Thang: [0, 2],
  ChuL: [1, 2],
  ChuThap: [0, 1, 2, 3],
  BatDau: [1],
  KetThuc: [1],
};

// Thời gian chảy (phải khớp với số giây trong hàm animation)
const THOI_GIAN_ANIMATION = {
  Thang: 600,
  ChuL: 600,
  ChuThap: 450,
  BatDau: 0,
  KetThuc: 0,
};

// Biến lưu trữ các intervals animation đang chạy để reset khi click
let cacIntervalNuoc = [];

// Mảng lưu các timeout ID để hủy khi người chơi xoay lại ống
let cacTimeoutChoNuoc = [];

// Hàm tính toán hướng mở thực tế dựa trên góc xoay
function layHuongMoThucTe(loaiOng, gocXoay) {
  const soLanXoay = Math.round(gocXoay / 90) % 4;
  const huongMacDinh = CAU_HINH_ONG[loaiOng];
  if (!huongMacDinh) return [];
  return huongMacDinh.map((h) => (h + soLanXoay) % 4);
}

// Reset toàn bộ nước
function resetNuoc() {
  cacTimeoutChoNuoc.forEach((id) => clearTimeout(id));
  cacTimeoutChoNuoc = [];

  const tatCaNuoc = document.querySelectorAll(
    ".Ong-Nuoc rect, .Ong-Nuoc path, .Nuoc_Tam"
  );
  tatCaNuoc.forEach((el) => {
    el.style.opacity = 0;
    el.style.transition = "none";
  });

  void document.body.offsetWidth;

  tatCaNuoc.forEach((el) => {
    el.style.transition = "opacity 0.5s ease-in-out";
  });
}

// Kiểm tra và cho nước chảy TUẦN TỰ
function kichHoatHieuUngChayNuoc() {
  resetNuoc();

  const oBatDau = document
    .querySelector('img[src*="OngBatDau.svg"]')
    ?.closest(".KhungGame-OVuong");
  if (!oBatDau) return;

  let queue = [];
  let daDuyet = new Set();
  let thoiGianKetThucGame = 0;
  let daTimThayDich = false;

  // Bắt đầu: Thời gian chờ = 0
  queue.push({ div: oBatDau, tuHuong: null, thoiGianCho: 0 });

  while (queue.length > 0) {
    const { div, tuHuong, thoiGianCho } = queue.shift();

    const row = parseInt(div.dataset.row);
    const col = parseInt(div.dataset.col);
    const idO = `${row}-${col}`;

    if (daDuyet.has(idO)) continue;
    daDuyet.add(idO);

    const img = div.querySelector(".AnhOngNuoc");
    // Kiểm tra nếu img không tồn tại (ví dụ: ô rỗng sau khi tráo đổi)
    if (!img) continue;

    const wrapper = div.querySelector(".Ong-Wrapper");
    const src = img.src;
    const phanTuLuuTruXoay = wrapper ? wrapper : img;
    const gocXoay = parseInt(phanTuLuuTruXoay.dataset.rotation || 0);

    // Xác định loại ống
    let loaiOng = "";
    if (src.includes("Thang")) loaiOng = "Thang";
    else if (src.includes("ChuL")) loaiOng = "ChuL";
    else if (src.includes("ChuThap")) loaiOng = "ChuThap";
    else if (src.includes("BatDau")) loaiOng = "BatDau";
    else if (src.includes("KetThuc")) loaiOng = "KetThuc";

    // Xử lý animation có delay
    if (wrapper && loaiOng !== "BatDau" && loaiOng !== "KetThuc") {
      const timeoutId = setTimeout(() => {
        kichHoatHieuUngNuoc(wrapper, loaiOng, tuHuong, gocXoay);
      }, thoiGianCho);

      cacTimeoutChoNuoc.push(timeoutId);
    }

    // Tính thời gian của ống
    const thoiGianChayCuaOngNay = THOI_GIAN_ANIMATION[loaiOng] || 0;
    const thoiGianKetThucCuaOngNay = thoiGianCho + thoiGianChayCuaOngNay;

    // Cập nhật thời gian kết thúc game muộn nhất
    if (thoiGianKetThucCuaOngNay > thoiGianKetThucGame) {
      thoiGianKetThucGame = thoiGianKetThucCuaOngNay;
    }

    // Xử lý thắng game
    if (loaiOng === "KetThuc") {
      console.log("ĐÃ KẾT NỐI ĐẾN ĐÍCH! Đang chờ các nhánh chảy xong...");
      daTimThayDich = true;
    }

    // Tính thời gian của ống tiếp theo
    const thoiGianChoTiepTheo = thoiGianCho + thoiGianChayCuaOngNay;

    // Tìm các ô hàng xóm
    const huongMo = layHuongMoThucTe(loaiOng, gocXoay);

    huongMo.forEach((huong) => {
      let nextRow = row;
      let nextCol = col;
      let huongNuocVaoHangXom = -1;

      if (huong === 0) {
        nextRow--;
        huongNuocVaoHangXom = 2;
      }
      if (huong === 1) {
        nextCol++;
        huongNuocVaoHangXom = 3;
      }
      if (huong === 2) {
        nextRow++;
        huongNuocVaoHangXom = 0;
      }
      if (huong === 3) {
        nextCol--;
        huongNuocVaoHangXom = 1;
      }

      const oHangXom = document.querySelector(
        `.KhungGame-OVuong[data-row="${nextRow}"][data-col="${nextCol}"]`
      );

      if (oHangXom) {
        const imgHangXom = oHangXom.querySelector(".AnhOngNuoc");
        if (!imgHangXom) return;

        let loaiHangXom = "";
        if (imgHangXom.src.includes("Thang")) loaiHangXom = "Thang";
        else if (imgHangXom.src.includes("ChuL")) loaiHangXom = "ChuL";
        else if (imgHangXom.src.includes("ChuThap")) loaiHangXom = "ChuThap";
        else if (imgHangXom.src.includes("KetThuc")) loaiHangXom = "KetThuc";

        const wrapperHangXom = oHangXom.querySelector(".Ong-Wrapper");
        const phanTuLuuTruXoayHangXom = wrapperHangXom
          ? wrapperHangXom
          : imgHangXom;
        const gocXoayHangXom = parseInt(
          phanTuLuuTruXoayHangXom.dataset.rotation || 0
        );
        const huongMoHangXom = layHuongMoThucTe(loaiHangXom, gocXoayHangXom);
        const huongDoiDien = (huong + 2) % 4;

        if (huongMoHangXom.includes(huongDoiDien)) {
          queue.push({
            div: oHangXom,
            tuHuong: huongNuocVaoHangXom,
            thoiGianCho: thoiGianChoTiepTheo,
          });
        }
      }
    });
  }

  // Tải lại trang (qua màn) sau khi thắng
  if (daTimThayDich) {
    console.log(
      `Tất cả animation sẽ kết thúc sau ${thoiGianKetThucGame}ms. Hẹn giờ thắng.`
    );

    const timeoutThang = setTimeout(() => {
      // Nếu là AI giải hộ (chế độ Đầu hàng) thì xử lý như thua
      if (window.dangChayCheDoDauHang) {
        console.log(
          "AI đã giải xong (Đầu hàng). Hiện bảng kết thúc và phát âm thanh thua."
        );
        if (typeof xuLyThuaGame === "function") {
          xuLyThuaGame();
        }
        return;
      }

      capNhatThongKeUser("thang");

      // Tăng điểm sao dựa theo độ khó
      const doKho = sessionStorage.getItem("difficulty") || "easy";
      let diemCong = 0;
      if (doKho === "easy") diemCong = 100;
      else if (doKho === "medium") diemCong = 200;
      else if (doKho === "hard") diemCong = 300;
      if (typeof congDiem === "function") {
        congDiem(diemCong);
      }

      // Phát âm thanh khi thắng
      if (
        typeof amThanhBat !== "undefined" &&
        amThanhBat &&
        typeof audioChienThang !== "undefined"
      ) {
        audioChienThang.currentTime = 0;
        audioChienThang.play();
        audioChienThang.onended = function () {
          location.reload();
        };
      } else {
        setTimeout(() => {
          location.reload();
        }, 500);
      }
    }, thoiGianKetThucGame + 500);

    cacTimeoutChoNuoc.push(timeoutThang);
    cacTimeoutChoNuoc.push(timeoutThang);
  }
}

// Hàm mapping logic thuật toán sang tên Animation chính xác theo góc xoay
function kichHoatHieuUngNuoc(wrapper, loaiOng, tuHuong, gocXoay) {
  // tuHuong: Là hướng nước đi vào ô tính theo màn hình
  // 0: Vào từ cạnh Trên (Top)
  // 1: Vào từ cạnh Phải (Right)
  // 2: Vào từ cạnh Dưới (Bottom)
  // 3: Vào từ cạnh Trái (Left)

  // +10 điểm ngay khi nước chảy vào ống
  if (typeof congDiem === "function") {
    if (!window.dangChayCheDoDauHang) {
      congDiem(10);
    }
  }

  // Tính số lần xoay
  const soLanXoay = (gocXoay / 90) % 4;

  // Tính xem hướng 'tuHuong' trên màn hình tương ứng với cổng nào của SVG gốc
  const congVaoSVG = (((tuHuong - soLanXoay) % 4) + 4) % 4;

  let strHuong = "";

  if (loaiOng === "Thang") {
    if (congVaoSVG === 0) {
      strHuong = "tren-xuong";
    } else {
      strHuong = "duoi-len";
    }
    batDauDongHoOngThang(wrapper, strHuong);
  } else if (loaiOng === "ChuThap") {
    switch (congVaoSVG) {
      case 0:
        strHuong = "tren-xuong";
        break;
      case 1:
        strHuong = "phai-qua";
        break;
      case 2:
        strHuong = "duoi-len";
        break;
      case 3:
        strHuong = "trai-qua";
        break;
    }
    batDauDongHoChuThapPhanNhanh(wrapper, strHuong);
  } else if (loaiOng === "ChuL") {
    if (congVaoSVG === 2) {
      strHuong = "duoi-qua-phai";
    } else {
      strHuong = "phai-xuong-duoi";
    }
    batDauDongHoOngChuL(wrapper, strHuong);
  }
}

// Hàm kiểm tra xem có đường đi từ Bắt đầu đến Kết thúc hay không
function kiemTraDuongDiDenDich() {
  const oBatDau = document
    .querySelector('img[src*="OngBatDau.svg"]')
    ?.closest(".KhungGame-OVuong");
  if (!oBatDau) return false;

  let queue = [];
  let daDuyet = new Set();

  // Bắt đầu dò từ ô Start
  queue.push({ div: oBatDau, tuHuong: null });

  while (queue.length > 0) {
    const { div, tuHuong } = queue.shift();

    const row = parseInt(div.dataset.row);
    const col = parseInt(div.dataset.col);
    const idO = `${row}-${col}`;

    if (daDuyet.has(idO)) continue;
    daDuyet.add(idO);

    const img = div.querySelector(".AnhOngNuoc");
    // Kiểm tra nếu img không tồn tại (ví dụ: ô rỗng)
    if (!img) continue;

    const wrapper = div.querySelector(".Ong-Wrapper");
    const src = img.src;
    const phanTuLuuTruXoay = wrapper ? wrapper : img;
    const gocXoay = parseInt(phanTuLuuTruXoay.dataset.rotation || 0);

    let loaiOng = "";
    if (src.includes("Thang")) loaiOng = "Thang";
    else if (src.includes("ChuL")) loaiOng = "ChuL";
    else if (src.includes("ChuThap")) loaiOng = "ChuThap";
    else if (src.includes("BatDau")) loaiOng = "BatDau";
    else if (src.includes("KetThuc")) loaiOng = "KetThuc";

    if (loaiOng === "KetThuc") {
      return true;
    }

    const huongMo = layHuongMoThucTe(loaiOng, gocXoay);

    huongMo.forEach((huong) => {
      let nextRow = row;
      let nextCol = col;
      let huongNuocVaoHangXom = -1;

      if (huong === 0) {
        nextRow--;
        huongNuocVaoHangXom = 2;
      }
      if (huong === 1) {
        nextCol++;
        huongNuocVaoHangXom = 3;
      }
      if (huong === 2) {
        nextRow++;
        huongNuocVaoHangXom = 0;
      }
      if (huong === 3) {
        nextCol--;
        huongNuocVaoHangXom = 1;
      }

      const oHangXom = document.querySelector(
        `.KhungGame-OVuong[data-row="${nextRow}"][data-col="${nextCol}"]`
      );

      if (oHangXom) {
        const imgHangXom = oHangXom.querySelector(".AnhOngNuoc");
        if (!imgHangXom) return;

        let loaiHangXom = "";
        if (imgHangXom.src.includes("Thang")) loaiHangXom = "Thang";
        else if (imgHangXom.src.includes("ChuL")) loaiHangXom = "ChuL";
        else if (imgHangXom.src.includes("ChuThap")) loaiHangXom = "ChuThap";
        else if (imgHangXom.src.includes("KetThuc")) loaiHangXom = "KetThuc";

        const wrapperHangXom = oHangXom.querySelector(".Ong-Wrapper");
        const phanTuLuuTruXoayHangXom = wrapperHangXom
          ? wrapperHangXom
          : imgHangXom;
        const gocXoayHangXom = parseInt(
          phanTuLuuTruXoayHangXom.dataset.rotation || 0
        );
        const huongMoHangXom = layHuongMoThucTe(loaiHangXom, gocXoayHangXom);
        const huongDoiDien = (huong + 2) % 4;

        if (huongMoHangXom.includes(huongDoiDien)) {
          queue.push({ div: oHangXom, tuHuong: huongNuocVaoHangXom });
        }
      }
    });
  }

  return false;
}

// Hàm điều phối chính
function capNhatLuongNuoc() {
  resetNuoc();

  if (kiemTraDuongDiDenDich()) {
    console.log("Đã thông đường! Bắt đầu xả nước...");
    daKetNoiThanhCong = true;

    // Vô hiệu hóa và làm mờ nút Dừng + Đầu hàng khi nước đang chảy
    const btnDung = document.getElementById("nutDung");
    const btnDauHang = document.getElementById("nutDauHang");
    if (btnDung) {
      btnDung.style.pointerEvents = "none";
      btnDung.style.opacity = "0.7";
    }
    if (btnDauHang) {
      btnDauHang.style.pointerEvents = "none";
      btnDauHang.style.opacity = "0.7";
    }

    // Dừng đồng hồ
    if (typeof tamDungDongHoThoiGian === "function") {
      tamDungDongHoThoiGian();
    }

    kichHoatHieuUngChayNuoc();
  } else {
    daKetNoiThanhCong = false;
    console.log("Đường chưa thông. Nước không chảy.");
  }
}

// ============================================================================================================================
