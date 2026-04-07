async function checkHealth() {
  const statusBox = document.getElementById("apiStatus");

  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    if (data.status === "ok") {
      statusBox.textContent = "Server online";
      statusBox.style.background = "#e8f7ea";
      statusBox.style.color = "#146c2e";
    } else {
      statusBox.textContent = "Server issue detected";
      statusBox.style.background = "#fdeaea";
      statusBox.style.color = "#8b1e1e";
    }
  } catch (error) {
    statusBox.textContent = "Backend not connected";
    statusBox.style.background = "#fdeaea";
    statusBox.style.color = "#8b1e1e";
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const formMessage = document.getElementById("formMessage");
  const form = document.getElementById("requestForm");

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value,
    details: form.details.value.trim()
  };

  formMessage.textContent = "Submitting...";
  formMessage.style.color = "#333";

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Submission failed");
    }

    formMessage.textContent = "Request submitted successfully.";
    formMessage.style.color = "green";
    form.reset();
  } catch (error) {
    formMessage.textContent = error.message || "Something went wrong.";
    formMessage.style.color = "red";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkHealth();

  const form = document.getElementById("requestForm");
  form.addEventListener("submit", handleFormSubmit);
});
