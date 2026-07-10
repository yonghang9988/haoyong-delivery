const form = document.querySelector("#driver-login-form");
const sendCodeButton = document.querySelector("#send-code");
const toast = document.querySelector(".toast");
let toastTimer;
let countdown = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

sendCodeButton.addEventListener("click", () => {
  if (countdown > 0) return;
  countdown = 30;
  showToast("演示验证码已发送，输入任意 6 位数字即可登录。");

  const timer = window.setInterval(() => {
    countdown -= 1;
    sendCodeButton.textContent = countdown > 0 ? `${countdown}s` : "获取验证码";
    sendCodeButton.disabled = countdown > 0;
    if (countdown <= 0) {
      window.clearInterval(timer);
    }
  }, 1000);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = document.querySelector("#driver-account").value.trim();
  const code = document.querySelector("#driver-code").value.trim();

  if (!account) {
    showToast("请输入司机手机号或工号。");
    return;
  }

  if (!/^\d{6}$/.test(code)) {
    showToast("请输入 6 位数字验证码。");
    return;
  }

  window.sessionStorage.setItem("haoyong_driver", account);
  showToast("登录成功，正在进入司机端。");
  window.setTimeout(() => {
    window.location.href = "driver.html";
  }, 700);
});
