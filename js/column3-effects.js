/* ----------------------------------------------------
   COLUMN 3 — FLOATING LOGO EFFECTS
---------------------------------------------------- */

function scatterLoops() {
  const loops = document.querySelectorAll('#partnerCluster .loop');
  const cluster = document.getElementById('partnerCluster');
  if (!cluster || loops.length === 0) return;

  const clusterWidth = cluster.clientWidth;
  const clusterHeight = cluster.clientHeight;

  loops.forEach(loop => {
    const size = 50 + Math.random() * 30; // 50–80px
    const x = Math.random() * (clusterWidth - size);
    const y = Math.random() * (clusterHeight - size);
    const rotate = Math.random() * 360;

    loop.style.width = `${size}px`;
    loop.style.height = `${size}px`;
    loop.style.left = `${x}px`;
    loop.style.top = `${y}px`;
    loop.style.transform = `rotate(${rotate}deg)`;
    loop.style.boxShadow = `0 0 12px rgba(255,255,255,0.25)`;
  });
}

/* ----------------------------------------------------
   AUTO-RESHUFFLE EVERY 20 SECONDS
---------------------------------------------------- */
setInterval(() => {
  scatterLoops();
}, 20000);

/* ----------------------------------------------------
   INITIALIZE ON LOAD
---------------------------------------------------- */
window.addEventListener("load", () => {
  setTimeout(() => {
    scatterLoops();
  }, 300);
});
