let myTicket = 3; // 내가 가진 티켓 수
let personalNumber = "990707"; // 인터파크 주민등록 번호

/* 변경 금지 전역변수 */
let seatsLength = 0;
let selectedSeats = 0;
let pause = false;
let bum = null;
let seatCheckInterval = null;
let pos = 1;

let frmDetail = frames["ifrmSeat"].window.frames["ifrmSeatDetail"];
let frmView = frames["ifrmSeat"].window.frames["ifrmSeatView"];
let myfrmBook = frames["ifrmBookStep"];

let originalAlert = window.alert;

window.alert = function (message) {
  originalAlert(message);
  setTimeout(() => {
    tryBuy();
  }, 500);
};

function waitForElementToDisplay(selector, time, callback) {
  if (myfrmBook.document.querySelector(selector)) {
    callback();
  } else {
    setTimeout(function () {
      waitForElementToDisplay(selector, time, callback);
    }, time);
  }
}
function buy() {
  const seats = frmDetail.document.getElementsByClassName("SeatN");
  seatsLength = seats.length;
  console.log("잔여좌석 검색중: " + seatsLength);

  if (seats.length > 0) {
    try {
      let maxSeatsToSelect;
      switch (myTicket) {
        case 1:
          maxSeatsToSelect = 3;
          break;
        case 2:
          maxSeatsToSelect = 2;
          break;
        case 3:
          maxSeatsToSelect = 1;
          break;
        default:
          maxSeatsToSelect = Math.min(4, seats.length);
          break;
      }

      let clickedSeats = 0; // 이번 실행에서 클릭된 좌석 수를 저장하는 지역 변수
      for (let i = 0; i < Math.min(maxSeatsToSelect, seats.length); i++) {
        seats[i].click();
        clickedSeats++;
      }
      selectedSeats = clickedSeats; // 전역 변수를 업데이트

      frames["ifrmSeat"].fnSelect();
      stopMacro();
      checkout_count();
      checkout_address();
      checkout_last();
      selectcheckAll();
    } catch (e) {
      console.error("좌석 선택 중에 오류 발생:", e);
    }
  }
}

function checkout_count() {
  waitForElementToDisplay('select[name="SeatCount"]', 100, function () {
    console.log("가격 선택 창 진입");
    var selectElement = myfrmBook.document.querySelector(
      'select[name="SeatCount"]'
    );

    selectElement.value = String(selectedSeats);
    selectElement.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );

    document.getElementById("SmallNextBtnLink").click();
  });
}

function checkout_address() {
  waitForElementToDisplay('input[name="YYMMDD"]', 100, function () {
    console.log("주소 선택 창 진입");
    let inputElement = myfrmBook.document.querySelector('input[name="YYMMDD"]');
    inputElement.value = personalNumber;
    inputElement.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
    setTimeout(function () {
      document.getElementById("SmallNextBtnLink").click();
    }, 500);
  });
}

function checkout_last() {
  waitForElementToDisplay("#BankCode", 100, function () {
    console.log("마지막 창 진입");
    let radioButton = myfrmBook.document.querySelector(
      'input[type="radio"][name="Payment"][value="22004"]'
    );
    radioButton.click();
    console.log("무통장 입금 선택");
    selectBank();
  });
}

function selectBank() {
  waitForElementToDisplay("#BankCode", 100, function () {
    console.log("은행 선택 진입");
    let selectElement = myfrmBook.document.querySelector("#BankCode");
    selectElement.value = "38051";
    selectElement.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    document.getElementById("SmallNextBtnLink").click();
  });
}

function selectcheckAll() {
  waitForElementToDisplay("#checkAll", 100, function () {
    try {
      let checkbox = myfrmBook.document.querySelector("#checkAll");
      checkbox.click();
      document.getElementById("LargeNextBtnLink").click();
    } catch (e) {
      console.error("selectcheckAll 함수에서 오류 발생:", e);
    }
  });
}

function getRandomInterval(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function refreshAndSelectSeat() {
  frames["ifrmSeat"].fnRefresh();
  console.log(
    "검색된 좌석 수: " +
      frmDetail.document.getElementsByClassName("SeatN").length
  );
  let randomInterval = getRandomInterval(1000, 2000);
  bum = setTimeout(refreshAndSelectSeat, randomInterval);
}

function macro() {
  pos++;
  if (pos == 2) pos = 3;
  if (pos == 10) pos = 1;

  frmView.UILock = false;
  frmView.GetBlockSeatList("", "", "RGN00" + pos);
  console.log(
    pos +
      "에서 발견한 좌석 수: " +
      frmDetail.document.getElementsByClassName("SeatN").length
  );
}

function startRandomInterval() {
  refreshAndSelectSeat();
  seatCheckInterval = setInterval(buy, 400);
}

function stopMacro() {
  clearTimeout(bum);
  clearInterval(seatCheckInterval);
  console.log("코드가 정지되었습니다.");
}

function resumeMacro() {
  startRandomInterval();
  console.log("코드가 재개되었습니다.");
}

startRandomInterval();
