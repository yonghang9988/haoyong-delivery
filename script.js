const drivers = {
  chen: {
    name: "陈师傅",
    vehicle: "沪A-72K8",
    position: "徐汇客户仓附近 · 31.190N, 121.436E",
    eta: "18 分钟",
    pin: { left: "54%", top: "18%" },
    status: "按最优路径执行",
    route: ["静安中央厨房", "徐汇客户仓", "浦东门店", "杨浦补货点"],
  },
  li: {
    name: "李师傅",
    vehicle: "沪C-19M2",
    position: "虹桥冷库待命 · 31.205N, 121.326E",
    eta: "待分配",
    pin: { left: "24%", top: "48%" },
    status: "等待新任务",
    route: ["虹桥冷库", "长宁客户仓", "普陀门店"],
  },
  wang: {
    name: "王师傅",
    vehicle: "沪B-55N6",
    position: "返回静安中央厨房 · 31.232N, 121.455E",
    eta: "26 分钟",
    pin: { left: "34%", top: "26%" },
    status: "回仓复核",
    route: ["黄浦门店", "静安中央厨房"],
  },
  zhou: {
    name: "周师傅",
    vehicle: "沪D-83P1",
    position: "杨浦补货点附近 · 31.286N, 121.526E",
    eta: "9 分钟",
    pin: { left: "24%", top: "72%" },
    status: "短途配送中",
    route: ["杨浦补货点", "五角场客户", "江湾门店"],
  },
};

const warehouses = {
  徐汇客户仓: [
    ["冷冻牛肉", "32 箱", "安全库存"],
    ["净菜组合", "86 份", "需补 20 份"],
    ["调味料包", "140 包", "充足"],
  ],
  浦东门店: [
    ["鲜切鸡肉", "44 箱", "今日可售"],
    ["意面套装", "28 份", "低库存"],
    ["冷藏酱料", "72 瓶", "充足"],
  ],
  杨浦补货点: [
    ["南瓜浓汤包", "61 份", "安全库存"],
    ["酸奶杯套装", "36 份", "需补 15 份"],
    ["保温袋", "220 个", "充足"],
  ],
};

const driverItems = document.querySelectorAll(".driver-item");
const routeTitle = document.querySelector("#route-title");
const currentPosition = document.querySelector("#current-position");
const eta = document.querySelector("#eta");
const routeStatus = document.querySelector("#route-status");
const routeList = document.querySelector("#route-list");
const driverPin = document.querySelector("#driver-pin");
const toast = document.querySelector(".toast");
const eventLog = document.querySelector("#event-log");
const stockList = document.querySelector("#stock-list");
const customerTabs = document.querySelectorAll(".customer-tabs button");
const proofState = document.querySelector("#proof-state");
const proofPreview = document.querySelector("#proof-preview");
let selectedDriver = "chen";
let toastTimer;

function nowTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function addLog(message) {
  const item = document.createElement("li");
  item.innerHTML = `<time>${nowTime()}</time> ${message}`;
  eventLog.prepend(item);
}

function renderRoute(driverKey) {
  const driver = drivers[driverKey];
  routeTitle.textContent = `${driver.name} · 今日路线`;
  currentPosition.textContent = driver.position;
  eta.textContent = driver.eta;
  routeStatus.textContent = driver.status;
  driverPin.style.left = driver.pin.left;
  driverPin.style.top = driver.pin.top;

  routeList.innerHTML = driver.route
    .map((stop, index) => {
      const className = index === 0 ? "done" : index === 1 ? "current" : "";
      const state = index === 0 ? "已完成" : index === 1 ? "送达中" : "待配送";
      return `<li class="${className}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${stop}</strong><em>${state}</em></li>`;
    })
    .join("");
}

function renderWarehouse(customerName) {
  stockList.innerHTML = warehouses[customerName]
    .map(
      ([name, count, state]) => `
        <article>
          <span>${name}</span>
          <strong>${count}</strong>
          <em>${state}</em>
        </article>
      `,
    )
    .join("");
}

driverItems.forEach((item) => {
  item.addEventListener("click", () => {
    selectedDriver = item.dataset.driver;
    driverItems.forEach((driverItem) => driverItem.classList.toggle("is-active", driverItem === item));
    renderRoute(selectedDriver);
    addLog(`已切换查看 ${drivers[selectedDriver].name} 的实时位置与任务。`);
  });
});

document.querySelector("#optimize-route").addEventListener("click", () => {
  const driver = drivers[selectedDriver];
  driver.route = [...driver.route].sort((a, b) => a.length - b.length);
  driver.status = "已重新计算最优路径";
  driver.eta = selectedDriver === "li" ? "14 分钟" : "12 分钟";
  renderRoute(selectedDriver);
  document.querySelector("#saved-distance").textContent = "16.4km";
  showToast("系统已按距离、时效、库存优先级重新规划路线。");
  addLog(`${driver.name} 路线已优化，预计节省里程 16.4km。`);
});

document.querySelector("#reroute-driver").addEventListener("click", () => {
  const driver = drivers[selectedDriver];
  const first = driver.route.shift();
  driver.route.push(first);
  driver.status = "调度员手动改线";
  driver.pin = { left: "63%", top: "58%" };
  renderRoute(selectedDriver);
  showToast(`${driver.name} 的配送顺序已调整，系统已同步到司机端。`);
  addLog(`调度员更改 ${driver.name} 路线，司机端已收到更新。`);
});

document.querySelector("#simulate-alert").addEventListener("click", () => {
  document.querySelector("#new-instruction").value = "客户临时要求：到达后先联系仓库管理员，再卸货拍照。";
  document.querySelector("#new-stop").value = "临时卸货点";
  showToast("已生成一条临时指令，可直接下发给司机。");
});

document.querySelector("#command-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const instruction = document.querySelector("#new-instruction").value.trim();
  const stop = document.querySelector("#new-stop").value.trim();

  if (!instruction && !stop) {
    showToast("请填写新指令或新增地点。");
    return;
  }

  const driver = drivers[selectedDriver];
  if (stop) {
    driver.route.splice(2, 0, stop);
  }
  driver.status = "执行新调度指令";
  renderRoute(selectedDriver);
  addLog(`${driver.name} 收到新指令：${instruction || "新增配送地点"}${stop ? `，新增地点 ${stop}` : ""}。`);
  showToast("新指令已下发，路线已同步更新。");
  event.currentTarget.reset();
});

customerTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    customerTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderWarehouse(tab.dataset.customer);
    addLog(`${tab.dataset.customer} 专属库存库已打开。`);
  });
});

document.querySelector("#sync-stock").addEventListener("click", () => {
  showToast("客户仓库库存已同步，缺货项目已加入补货建议。");
  addLog("系统完成客户专属仓库库存同步。");
});

function previewFile(input, slotIndex, label) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    proofPreview.children[slotIndex].innerHTML = `<img src="${reader.result}" alt="${label}" />`;
  });
  reader.readAsDataURL(file);
}

document.querySelector("#receipt-photo").addEventListener("change", (event) => {
  previewFile(event.target, 0, "送货单照片");
});

document.querySelector("#goods-photo").addEventListener("change", (event) => {
  previewFile(event.target, 1, "货物照片");
});

document.querySelector("#proof-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const receipt = document.querySelector("#receipt-photo").files.length > 0;
  const goods = document.querySelector("#goods-photo").files.length > 0;

  if (!receipt || !goods) {
    showToast("请先上传送货单和货物照片，再完成配送。");
    return;
  }

  proofState.textContent = "已完成";
  proofState.style.background = "#e8f8ef";
  proofState.style.color = "#1f9d63";
  document.querySelector("#today-orders").textContent = "29";
  showToast("配送已完成，回单和货物照片已归档。");
  addLog("司机完成配送，送货单与货物照片已上传归档。");
});

window.setInterval(() => {
  const driver = drivers[selectedDriver];
  const left = Number.parseFloat(driver.pin.left);
  const nextLeft = Math.min(68, left + 0.7);
  driver.pin.left = `${nextLeft}%`;
  driverPin.style.left = driver.pin.left;
}, 3600);
