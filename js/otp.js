(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const { $, setBtnLoading, showToast, announcePolite, announceUrgent } = window.CRMUtils;

    const otpPanel     = $("otp-panel");
    const successPanel = $("otp-success-panel");
    const verifyBtn    = $("otp-verify-btn");
    const otpForm      = $("otp-form");
    const otpError     = $("otp-error");
    const otpErrorText = $("otp-error-text");
    const emailDisplay = $("otp-email-display");

    if (!otpForm) return;

    try {
      const saved = sessionStorage.getItem("crm-reset-email");
      if (saved && emailDisplay) emailDisplay.textContent = saved;
    } catch (err) {}

    const digits = [0, 1, 2, 3, 4, 5].map((i) => $("otp-d" + i));

    const segs = [0, 1, 2, 3, 4, 5].map((i) => $("otp-ps" + i));

    function updateProgress() {
      digits.forEach((d, i) => segs[i].classList.toggle("is-filled", d.value.length > 0));
    }

    function clearOtpErrors() {
      otpError.classList.remove("is-visible");
      digits.forEach((d) => d.classList.remove("is-error"));
    }

    digits.forEach(function (inp, i) {
      inp.addEventListener("focus", () => inp.select());

      inp.addEventListener("input", function () {
        const val = inp.value.replace(/\D/g, "");
        inp.value = val.slice(0, 1);
        inp.classList.toggle("is-filled", inp.value.length > 0);
        clearOtpErrors();
        updateProgress();

        const filled = digits.filter((d) => d.value).length;
        if (filled === 6) {
          announcePolite("All 6 digits entered. Ready to verify.");
        } else if (inp.value) {
          announcePolite("Digit " + (i + 1) + " of 6 entered. " + (6 - filled) + " remaining.");
        }

        if (inp.value && i < digits.length - 1) digits[i + 1].focus();
      });

      inp.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !inp.value && i > 0) {
          digits[i - 1].value = "";
          digits[i - 1].classList.remove("is-filled");
          digits[i - 1].focus();
          updateProgress();
        }
        if (e.key === "ArrowLeft"  && i > 0)              { e.preventDefault(); digits[i - 1].focus(); }
        if (e.key === "ArrowRight" && i < digits.length - 1) { e.preventDefault(); digits[i + 1].focus(); }
      });

      inp.addEventListener("paste", function (e) {
        e.preventDefault();
        const text  = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        const chars = [...text].slice(0, 6);
        chars.forEach(function (ch, j) {
          if (digits[j]) {
            digits[j].value = ch;
            digits[j].classList.toggle("is-filled", !!ch);
          }
        });
        updateProgress();
        digits[Math.min(chars.length, digits.length - 1)].focus();
        announcePolite(chars.length + " digit" + (chars.length !== 1 ? "s" : "") + " pasted.");
      });
    });

    let totalSecs     = 10 * 60;
    let expiryTimer   = null;
    const announcedAt = new Set();
    const milestones  = [300, 120, 60, 30, 10];
    const expDisplay  = $("otp-expiry-display");
    const expText     = $("otp-expiry-text");
    const expSR       = $("otp-expiry-sr");

    function formatTime(s) {
      const m   = Math.floor(s / 60).toString().padStart(2, "0");
      const sec = (s % 60).toString().padStart(2, "0");
      return m + ":" + sec;
    }

    function startExpiry() {
      clearInterval(expiryTimer);
      expiryTimer = setInterval(function () {
        totalSecs--;
        if (expText) expText.textContent = formatTime(totalSecs);
        if (totalSecs <= 120 && expDisplay) expDisplay.classList.add("is-urgent");

        if (milestones.includes(totalSecs) && !announcedAt.has(totalSecs)) {
          announcedAt.add(totalSecs);
          const msg = totalSecs >= 60
            ? "Warning: code expires in " + Math.floor(totalSecs / 60) + " minute" + (totalSecs >= 120 ? "s" : "") + "."
            : "Warning: code expires in " + totalSecs + " seconds.";
          if (expSR) {
            expSR.textContent = "";
            requestAnimationFrame(() => { expSR.textContent = msg; });
          }
        }

        if (totalSecs <= 0) {
          clearInterval(expiryTimer);
          if (expText) expText.textContent = "Expired";
          if (expDisplay) expDisplay.classList.add("is-urgent");
          if (verifyBtn) verifyBtn.disabled = true;
          announceUrgent("The verification code has expired. Please request a new code.");
        }
      }, 1000);
    }

    startExpiry();

    let resendSecs  = 0;
    let resendTimer = null;
    const resendBtn        = $("otp-resend-btn");
    const resendTimerWrap  = $("otp-resend-timer");
    const resendCountdown  = $("otp-resend-countdown");

    function startResendCooldown(secs) {
      resendSecs = secs;
      if (resendBtn)       resendBtn.style.display       = "none";
      if (resendTimerWrap) resendTimerWrap.style.display = "inline";
      if (resendCountdown) resendCountdown.textContent   = resendSecs;

      clearInterval(resendTimer);
      resendTimer = setInterval(function () {
        resendSecs--;
        if (resendCountdown) resendCountdown.textContent = resendSecs;
        if (resendSecs <= 0) {
          clearInterval(resendTimer);
          if (resendTimerWrap) resendTimerWrap.style.display = "none";
          if (resendBtn)       resendBtn.style.display       = "inline";
          announcePolite("You can now resend the verification code.");
        }
      }, 1000);
    }

    startResendCooldown(30);

    if (resendBtn) {
      resendBtn.addEventListener("click", function () {
        clearInterval(expiryTimer);
        totalSecs = 10 * 60;
        announcedAt.clear();
        if (expText)    expText.textContent = formatTime(totalSecs);
        if (expDisplay) expDisplay.classList.remove("is-urgent");
        if (verifyBtn)  verifyBtn.disabled = false;

        digits.forEach(function (d) { d.value = ""; d.classList.remove("is-filled", "is-error"); });
        updateProgress();
        clearOtpErrors();

        startExpiry();
        startResendCooldown(30);
        digits[0].focus();
        showToast("A new code has been sent to your email.", "info");
        announcePolite("New verification code sent. Timer reset to 10 minutes.");
      });
    }

    otpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearOtpErrors();

      const code       = digits.map((d) => d.value).join("");
      const emptyDigits = digits.filter((d) => !d.value);

      if (emptyDigits.length > 0) {
        emptyDigits.forEach((d) => d.classList.add("is-error"));
        const msg = emptyDigits.length === 6
          ? "Please enter the 6-digit verification code."
          : "Please fill in the remaining " + emptyDigits.length + " digit" + (emptyDigits.length > 1 ? "s" : "") + ".";
        if (otpErrorText) otpErrorText.textContent = msg;
        otpError.classList.add("is-visible");
        announceUrgent(msg);
        emptyDigits[0].focus();
        return;
      }

      setBtnLoading(verifyBtn, true);
      announcePolite("Verifying your code, please wait.");

      setTimeout(function () {
        setBtnLoading(verifyBtn, false);
        clearInterval(expiryTimer);

        otpPanel.style.display = "none";
        successPanel.classList.add("is-visible");
        successPanel.setAttribute("tabindex", "-1");
        successPanel.focus();
        announcePolite("Identity verified. You may now set a new password.");
      }, 1800);
    });
  });
})();
