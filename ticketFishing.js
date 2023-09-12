// 전역 설정 변수
let desiredTickets = 4; // 구매하고 싶은 티켓 수, 3 이상 입력시 default = 4
let personalNumber = 960924; // 인터파크 주민등록 번호

// 변경 금지 전역변수
let seatsLength = 0; // 사용 가능한 좌석 수
let selectedSeats = 0; // 실제로 선택된 좌석 수
let pause = false;
let bum = null;
let seatCheckInterval = null;

// 프레임 변수
let frmDetail = frames["ifrmSeat"].window.frames["ifrmSeatDetail"];
let frmView = frames["ifrmSeat"].window.frames["ifrmSeatView"];
let myfrmBook = frames["ifrmBookStep"];

// 원래 alert 함수를 오버라이드해서 추가 작업 수행
let originalAlert = window.alert;
window.alert = function (message) {
  originalAlert(message);
  setTimeout(() => {
    tryBuy();
  }, 500);
};

// 웹페이지에서 특정 요소가 표시될 때까지 기다리는 함수
function waitForElementToDisplay(selector, time, callback) {
  if (myfrmBook.document.querySelector(selector)) {
    callback();
  } else {
    setTimeout(() => {
      waitForElementToDisplay(selector, time, callback);
    }, time);
  }
}

// 사용 가능한 좌석에 따라 티켓 구매 시도
function buy() {
  const seats = frmDetail.document.getElementsByClassName("SeatN");
  seatsLength = seats.length;
  console.log("잔여좌석 검색중: " + seatsLength);

  if (seats.length > 0) {
    try {
      // 선택하려는 티켓 수를 최대 4로 제한
      let maxSeatsToSelect = Math.min(desiredTickets, 4);

      // 실제로 클릭된 좌석 수를 저장
      let clickedSeats = 0;
      for (let i = 0; i < Math.min(maxSeatsToSelect, seats.length); i++) {
        seats[i].click();
        clickedSeats++;
      }
      selectedSeats = clickedSeats; // 전역 변수 업데이트

      // 좌석 선택 후의 작업 수행
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

// 결제 화면에서 좌석 수 설정
function checkout_count() {
  waitForElementToDisplay('select[name="SeatCount"]', 100, () => {
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

// 결제 화면에서 주소(주민등록 번호) 설정
function checkout_address() {
  waitForElementToDisplay('input[name="YYMMDD"]', 100, () => {
    console.log("주소 선택 창 진입");
    let inputElement = myfrmBook.document.querySelector('input[name="YYMMDD"]');
    inputElement.value = personalNumber;
    inputElement.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
    setTimeout(() => {
      document.getElementById("SmallNextBtnLink").click();
    }, 500);
  });
}

// 결제 화면에서 마지막 설정(은행 선택 등)
function checkout_last() {
  waitForElementToDisplay("#BankCode", 100, () => {
    console.log("마지막 창 진입");
    let radioButton = myfrmBook.document.querySelector(
      'input[type="radio"][name="Payment"][value="22004"]'
    );
    radioButton.click();
    console.log("무통장 입금 선택");
    selectBank();
  });
}

// 은행 선택 함수
function selectBank() {
  waitForElementToDisplay("#BankCode", 100, () => {
    console.log("은행 선택 진입");
    let selectElement = myfrmBook.document.querySelector("#BankCode");
    selectElement.value = "38051";
    selectElement.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    document.getElementById("SmallNextBtnLink").click();
  });
}

// 전체 동의 체크 및 다음 단계 진행
function selectcheckAll() {
  waitForElementToDisplay("#checkAll", 100, () => {
    try {
      let checkbox = myfrmBook.document.querySelector("#checkAll");
      checkbox.click();
      document.getElementById("LargeNextBtnLink").click();
    } catch (e) {
      console.error("selectcheckAll 함수에서 오류 발생:", e);
    }
  });
}

// 랜덤 인터벌을 반환하는 함수
function getRandomInterval(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// 좌석 정보를 새로고침하고 선택을 시도하는 함수
function refreshAndSelectSeat() {
  frames["ifrmSeat"].fnRefresh();
  console.log(
    "검색된 좌석 수: " +
      frmDetail.document.getElementsByClassName("SeatN").length
  );
  let randomInterval = getRandomInterval(1000, 2000);
  bum = setTimeout(refreshAndSelectSeat, randomInterval);
}

// 자동 티켓 구매 시작
function startRandomInterval() {
  refreshAndSelectSeat();
  seatCheckInterval = setInterval(buy, 400);
}

// 매크로 중지 함수
function stopMacro() {
  clearTimeout(bum);
  clearInterval(seatCheckInterval);
  console.log("코드가 정지되었습니다.");
}

// 매크로 재시작 함수
function resumeMacro() {
  startRandomInterval();
  console.log("코드가 재개되었습니다.");
}

// 매크로 시작
startRandomInterval();
