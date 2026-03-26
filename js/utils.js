(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function announcePolite(msg) {
    const el = $("crm-live-polite");
    if (!el) return;
    el.textContent = "";
    requestAnimationFrame(() => { el.textContent = msg; });
  }

  function announceUrgent(msg) {
    const el = $("crm-live-urgent");
    if (!el) return;
    el.textContent = "";
    requestAnimationFrame(() => { el.textContent = msg; });
  }

  let _toastTimer = null;

  function showToast(msg, type = "success", duration = 3400) {
    const toast = $("crm-toast");
    const text  = $("crm-toast-text");
    if (!toast || !text) return;

    toast.classList.remove("crm-toast--success", "crm-toast--info");
    toast.classList.add(`crm-toast--${type}`);
    text.textContent = msg;
    toast.classList.add("is-visible");

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  }

  function setFieldError(fieldId, inputId, hasError, errorMsg) {
    const field = $(fieldId);
    const input = $(inputId);
    if (!field || !input) return;

    field.classList.toggle("is-error", hasError);
    input.setAttribute("aria-invalid", hasError ? "true" : "false");

    if (errorMsg) {
      const msgEl = field.querySelector(".crm-error-msg span[data-msg]");
      if (msgEl) msgEl.textContent = errorMsg;
    }
  }

  function setBtnLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle("is-loading", loading);
    btn.disabled = loading;
  }

  window.CRMUtils = {
    announcePolite,
    announceUrgent,
    showToast,
    isValidEmail,
    setFieldError,
    setBtnLoading,
    $,
  };
})();
