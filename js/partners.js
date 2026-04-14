/* ----------------------------------------------------
   LOAD PARTNERS FROM JSON
---------------------------------------------------- */
async function loadPartners() {
  const response = await fetch('/api/data/partners.json');
  const data = await response.json();
  return data.partners;
}

/* ----------------------------------------------------
   RENDER COLUMN 1 (CATEGORIZED PARTNER LIST)
---------------------------------------------------- */
async function renderColumn1() {
  const partners = await loadPartners();
  const col1 = document.getElementById("column1-partners");

  const categories = {};

  partners.forEach(p => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  col1.innerHTML = "";

  Object.keys(categories).forEach(category => {
    const section = document.createElement("div");
    section.className = "category";

    section.innerHTML = `
      <details>
        <summary>${category}</summary>
        <ul>
          ${categories[category].map(p => `
            <li>
              <a href="${p.url}" target="_blank">
                <img src="/assets/logos/${p.logo}" 
                     alt="${p.name}" 
                     onerror="this.src='/assets/logos/_fallback.png'">
                ${p.name}
              </a>
            </li>
          `).join("")}
        </ul>
      </details>
    `;

    col1.appendChild(section);
  });
}

/* ----------------------------------------------------
   RENDER COLUMN 3 (FLOATING LOGO LOOPS)
---------------------------------------------------- */
async function renderColumn3() {
  const partners = await loadPartners();
  const cluster = document.getElementById("partnerCluster");

  cluster.innerHTML = "";

  partners.forEach(p => {
    const link = document.createElement("a");
    link.href = p.url;
    link.target = "_blank";
    link.className = "loop";

    link.innerHTML = `
      <img src="/assets/logos/${p.logo}" 
           alt="${p.name}" 
           onerror="this.src='/assets/logos/_fallback.png'">
    `;

    cluster.appendChild(link);
  });

  // Trigger animation engine
  if (typeof scatterLoops === "function") {
    scatterLoops();
  }
}

/* ----------------------------------------------------
   INITIALIZE BOTH COLUMNS
---------------------------------------------------- */
window.addEventListener("load", () => {
  renderColumn1();
  renderColumn3();
});
