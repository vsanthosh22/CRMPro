(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const { $, isValidEmail, setFieldError, setBtnLoading, announcePolite, announceUrgent } = window.CRMUtils;

    const forgotForm  = $("forgot-form");
    const emailInput  = $("forgot-email");
    const submitBtn   = $("forgot-submit");
    const formPanel   = $("forgot-form-panel");
    const successPanel= $("forgot-success-panel");
    const sentToEl    = $("forgot-sent-to");

    if (!forgotForm) return;

    emailInput.addEventListener("blur", function () {
      if (this.value && !isValidEmail(this.value)) {
        setFieldError("field-forgot-email", "forgot-email", true, "Please enter a valid email address.");
      } else {
        setFieldError("field-forgot-email", "forgot-email", false);
      }
    });
    emailInput.addEventListener("input", function () {
      if (isValidEmail(this.value)) setFieldError("field-forgot-email", "forgot-email", false);
    });

    forgotForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailVal = emailInput.value.trim();
      setFieldError("field-forgot-email", "forgot-email", false);

      if (!isValidEmail(emailVal)) {
        setFieldError("field-forgot-email", "forgot-email", true, "Please enter a valid email address.");
        emailInput.focus();
        announceUrgent("Error: please enter a valid email address.");
        return;
      }

      setBtnLoading(submitBtn, true);
      announcePolite("Sending reset code, please wait.");

      setTimeout(function () {
        setBtnLoading(submitBtn, false);

        try { sessionStorage.setItem("crm-reset-email", emailVal); } catch (err) {}

        if (sentToEl) sentToEl.textContent = emailVal;

        formPanel.style.display   = "none";
        successPanel.classList.add("is-visible");
        successPanel.setAttribute("tabindex", "-1");
        successPanel.focus();

        announcePolite("Reset code sent to " + emailVal + ". Please check your inbox.");
      }, 1500);
    });

    const retryBtn = $("forgot-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        successPanel.classList.remove("is-visible");
        formPanel.style.display = "";
        emailInput.value = "";
        setFieldError("field-forgot-email", "forgot-email", false);
        emailInput.focus();
        announcePolite("Form reset. Please enter a different email address.");
      });
    }
  });
})();
