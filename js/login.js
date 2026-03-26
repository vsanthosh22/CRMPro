(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const { $, isValidEmail, setFieldError, setBtnLoading, showToast, announcePolite, announceUrgent } = window.CRMUtils;

    const emailInput   = $("login-email");
    const passwordInput= $("login-password");
    const pwToggleBtn  = $("login-pw-toggle");
    const submitBtn    = $("login-submit");
    const loginForm    = $("login-form");

    if (!loginForm) return;

    pwToggleBtn.addEventListener("click", function () {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      this.setAttribute("aria-label",   isHidden ? "Hide password" : "Show password");
      this.setAttribute("aria-pressed", isHidden ? "true" : "false");
      $("icon-eye-open").style.display   = isHidden ? "none" : "";
      $("icon-eye-closed").style.display = isHidden ? "" : "none";
    });

    emailInput.addEventListener("blur", function () {
      if (this.value && !isValidEmail(this.value)) {
        setFieldError("field-login-email", "login-email", true, "Please enter a valid email address.");
      } else {
        setFieldError("field-login-email", "login-email", false);
      }
    });
    emailInput.addEventListener("input", function () {
      if (isValidEmail(this.value)) setFieldError("field-login-email", "login-email", false);
    });

    passwordInput.addEventListener("blur", function () {
      if (this.value && this.value.length < 8) {
        setFieldError("field-login-password", "login-password", true, "Password must be at least 8 characters.");
      } else {
        setFieldError("field-login-password", "login-password", false);
      }
    });
    passwordInput.addEventListener("input", function () {
      if (this.value.length >= 8) setFieldError("field-login-password", "login-password", false);
    });

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailVal = emailInput.value.trim();
      const pwVal    = passwordInput.value;
      const errors   = [];

      setFieldError("field-login-email",    "login-email",    false);
      setFieldError("field-login-password", "login-password", false);

      if (!isValidEmail(emailVal)) {
        setFieldError("field-login-email", "login-email", true, "Please enter a valid email address.");
        errors.push("invalid email");
      }
      if (pwVal.length < 8) {
        setFieldError("field-login-password", "login-password", true, "Password must be at least 8 characters.");
        errors.push("password too short");
      }

      if (errors.length) {
        announceUrgent(
          `Please fix ${errors.length} error${errors.length > 1 ? "s" : ""}: ${errors.join(" and ")}.`
        );
        if (!isValidEmail(emailVal)) { emailInput.focus(); }
        else { passwordInput.focus(); }
        return;
      }

      setBtnLoading(submitBtn, true);
      announcePolite("Signing you in, please wait.");

      setTimeout(function () {
        setBtnLoading(submitBtn, false);
        showToast("Signed in successfully. Redirecting to dashboard…", "success");
        announcePolite("Signed in successfully. Redirecting.");
      }, 1800);
    });
  });
})();
