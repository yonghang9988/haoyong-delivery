const toast = document.querySelector(".toast");
const stops = [
  { name: "静安中央厨房装车", state: "已完成", eta: "17:25" },
  { name: "徐汇客户仓", state: "当前", eta: "18 分钟" },
  { name: "浦东门店", state: "下一站", eta: "42 分钟" },
  { name: "杨浦补货点", state: "待配送", eta: "68 分钟" },
];

let currentIndex = 1;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function renderStops() {
  const list = document.querySelector("#stop-list");
  list.innerHTML = stops
    .map((stop, index) => {
      const className = index < currentIndex ? "done" : index === currentIndex ? "active" : "";
      const label = index < currentIndex ? "已完成" : index === currentIndex ? "当前" : stop.state;
      return `<li class="${className}"><span>${label}</span><strong>${stop.name}</strong><em>${stop.eta}</em></li>`;
    })
    .join("");

  const activeStop = stops[currentIndex] || stops[stops.length - 1];
  document.querySelector("#current-task").textContent = activeStop.name;
  document.querySelector("#eta").textContent = activeStop.eta;
}

function previewFile(input, slotIndex, label) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    document.querySelector("#photo-preview").children[slotIndex].innerHTML = `<img src="${reader.result}" alt="${label}" />`;
  });
  reader.readAsDataURL(file);
}

document.querySelector("#refresh-route").addEventListener("click", () => {
  showToast("已同步调度中心最新路线。");
});

document.querySelector("#report-delay").addEventListener("click", () => {
  showToast("异常已上报调度中心，等待新指令。");
});

document.querySelector("#next-stop").addEventListener("click", () => {
  currentIndex = Math.min(stops.length - 1, currentIndex + 1);
  renderStops();
  document.querySelector(".van-pin").style.left = currentIndex >= 2 ? "calc(100% - 76px)" : "42px";
  document.querySelector(".van-pin").style.bottom = currentIndex >= 3 ? "172px" : "92px";
  showToast("已切换到下一站任务。");
});

document.querySelector("#receipt-photo").addEventListener("change", (event) => {
  previewFile(event.target, 0, "送货单照片");
});

document.querySelector("#goods-photo").addEventListener("change", (event) => {
  previewFile(event.target, 1, "货物照片");
});

document.querySelector("#driver-proof-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const hasReceipt = document.querySelector("#receipt-photo").files.length > 0;
  const hasGoods = document.querySelector("#goods-photo").files.length > 0;

  if (!hasReceipt || !hasGoods) {
    showToast("请先拍摄送货单和货物照片。");
    return;
  }

  document.querySelector("#proof-state").textContent = "已完成";
  currentIndex = Math.min(stops.length - 1, currentIndex + 1);
  renderStops();
  showToast("当前配送已完成，回单已同步调度中心。");
});
