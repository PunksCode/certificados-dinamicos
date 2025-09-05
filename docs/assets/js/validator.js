(function () {
  const API = (window.__CONFIG__ && window.__CONFIG__.VERCEL_API) || "";

  const $id = document.getElementById("id");
  const $btn = document.getElementById("btn");
  const $status = document.getElementById("status");
  const $meta = document.getElementById("meta");
  const $actions = document.getElementById("actions");
  const $raw = document.getElementById("raw");

  if (!API) {
    $status.innerHTML = '<span class="bad">Configurá VERCEL_API en assets/js/config.js</span>';
  }

  function setBusy(b) {
    $btn.disabled = b;
    $id.disabled = b;
  }

  async function verificar() {
    const id = ($id.value || "").trim();
    $status.textContent = "Consultando...";
    $meta.innerHTML = ""; $actions.innerHTML = ""; $raw.textContent = "";
    if (!id) { $status.innerHTML = '<span class="bad">Ingresá un ID</span>'; return; }
    if (!API) { return; }

    setBusy(true);
    try {
      const r = await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: "GET" });
      const json = await r.json();

      if (!json.valid) {
        $status.innerHTML = '<span class="bad">❌ Certificado no válido o no encontrado</span>';
        $raw.textContent = JSON.stringify(json, null, 2);
        return;
      }

      $status.innerHTML = '<span class="ok">✅ Certificado válido</span>';
      const d = json.data;

      $meta.innerHTML = `
        <p><strong>Nombre:</strong> ${escapeHtml(d.name)} &nbsp;
        <strong>Curso:</strong> ${escapeHtml(d.course)} &nbsp;
        <strong>Fecha:</strong> ${escapeHtml(d.date)} &nbsp;
        <strong>ID:</strong> ${escapeHtml(d.id)}</p>`;

      if (d.png_url) {
        const a = document.createElement('a');
        a.href = d.png_url; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Ver imagen (PNG)';
        $actions.appendChild(a);
      }
      if (d.pdf_url) {
        const a = document.createElement('a');
        a.href = d.pdf_url; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Abrir PDF';
        $actions.appendChild(a);
      }

      $raw.textContent = JSON.stringify(json, null, 2);
    } catch (e) {
      $status.innerHTML = '<span class="bad">Error consultando el servicio</span>';
      $raw.textContent = String(e);
    } finally {
      setBusy(false);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Botón
  $btn.addEventListener("click", verificar);
  // Enter en el input
  $id.addEventListener("keydown", (e) => {
    if (e.key === "Enter") verificar();
  });

  // Autocomplete si viene ?id= en la URL (para QR)
  const fromUrl = new URL(location.href).searchParams.get('id');
  if (fromUrl) { $id.value = fromUrl; verificar(); }
})();
