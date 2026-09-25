(() => {
  const script = document.currentScript;
  const endpoint = script?.dataset.endpoint;
  if (!endpoint || document.getElementById("tolux-ai-assistant")) return;

  const root = document.createElement("div");
  root.id = "tolux-ai-assistant";
  root.innerHTML = `
    <style>
      #tolux-ai-assistant { font-family: Arial, sans-serif; }
      #tolux-ai-toggle { position:fixed; right:22px; bottom:22px; z-index:99999; border:0; border-radius:999px; background:#073b5c; color:#fff; padding:14px 18px; font-weight:700; font-size:15px; box-shadow:0 8px 24px rgba(0,0,0,.22); cursor:pointer; }
      #tolux-ai-panel { position:fixed; right:22px; bottom:82px; z-index:99999; width:min(360px,calc(100vw - 32px)); height:500px; max-height:calc(100vh - 115px); background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 14px 42px rgba(0,0,0,.28); display:none; flex-direction:column; border:1px solid #dce7ed; }
      #tolux-ai-header { background:#073b5c; color:#fff; padding:16px; display:flex; justify-content:space-between; align-items:center; }
      #tolux-ai-header strong { display:block; } #tolux-ai-header small { opacity:.82; }
      #tolux-ai-close { background:transparent; border:0; color:#fff; font-size:24px; cursor:pointer; }
      #tolux-ai-messages { flex:1; padding:14px; overflow:auto; background:#f7fafb; }
      .tolux-ai-message { max-width:84%; padding:10px 12px; margin:8px 0; line-height:1.4; border-radius:12px; font-size:14px; white-space:pre-wrap; }
      .tolux-ai-bot { background:#e8f1f5; color:#142b37; border-bottom-left-radius:3px; }
      .tolux-ai-user { background:#0c7698; color:#fff; margin-left:auto; border-bottom-right-radius:3px; }
      #tolux-ai-form { display:flex; gap:8px; padding:12px; border-top:1px solid #dce7ed; }
      #tolux-ai-input { flex:1; min-width:0; border:1px solid #b9cbd3; border-radius:10px; padding:10px; font:inherit; }
      #tolux-ai-send { border:0; border-radius:10px; background:#0c7698; color:#fff; padding:0 14px; font-weight:700; cursor:pointer; }
      #tolux-ai-send:disabled { opacity:.6; cursor:wait; }
    </style>
    <button id="tolux-ai-toggle" aria-expanded="false">Chat with Tolux</button>
    <section id="tolux-ai-panel" aria-label="Tolux AI Assistant">
      <header id="tolux-ai-header"><div><strong>Tolux AI Assistant</strong><small>How can we help?</small></div><button id="tolux-ai-close" aria-label="Close chat">×</button></header>
      <div id="tolux-ai-messages"><div class="tolux-ai-message tolux-ai-bot">Hello! I’m the Tolux AI Assistant. How can I help you today?</div></div>
      <form id="tolux-ai-form"><input id="tolux-ai-input" maxlength="1200" placeholder="Ask a question…" aria-label="Your message"><button id="tolux-ai-send" type="submit">Send</button></form>
    </section>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector("#tolux-ai-panel");
  const toggle = root.querySelector("#tolux-ai-toggle");
  const close = root.querySelector("#tolux-ai-close");
  const form = root.querySelector("#tolux-ai-form");
  const input = root.querySelector("#tolux-ai-input");
  const send = root.querySelector("#tolux-ai-send");
  const messages = root.querySelector("#tolux-ai-messages");

  const addMessage = (text, role) => {
    const message = document.createElement("div");
    message.className = `tolux-ai-message tolux-ai-${role}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };
  const setOpen = (open) => {
    panel.style.display = open ? "flex" : "none";
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  };

  toggle.addEventListener("click", () => setOpen(panel.style.display !== "flex"));
  close.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addMessage(message, "user");
    input.value = "";
    send.disabled = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      addMessage(data.reply || data.error || "I’m sorry, I couldn’t answer that right now.", "bot");
    } catch {
      addMessage("I’m sorry, the assistant is temporarily unavailable.", "bot");
    } finally {
      send.disabled = false;
      input.focus();
    }
  });
})();
