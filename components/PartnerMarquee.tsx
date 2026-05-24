/* File: components/marquee.css
   Styles for PartnerMarquee — scoped so it never affects the rest of the site.
   Tuned for the LIGHT theme: defined white cards, dark readable text. */
@keyframes productionScrollLeft {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}
@keyframes productionScrollRight {
  0% { transform: translate3d(-50%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
/* Scroll speed: higher seconds = slower. Was 40s; now 70s (~half the pace).
   Both rows use the same duration so the two rows stay visually matched. */
.force-marquee-left {
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  animation: productionScrollLeft 70s linear infinite;
}
.force-marquee-right {
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  animation: productionScrollRight 70s linear infinite;
}
.force-marquee-left:hover,
.force-marquee-right:hover {
  animation-play-state: paused;
}
.fathom-glass-card-upgrade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem; /* space between the logo and the partner name */
  min-width: 170px;
  height: 4rem;
  padding: 0 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(40, 60, 90, 0.12);
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 18px rgba(60, 90, 130, 0.10);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fathom-glass-card-upgrade span {
  color: #1d2733 !important;   /* dark, readable on the light cards */
  font-weight: 600;
}
/* Partner logo (favicon) sitting to the left of the name. flex-shrink:0 keeps
   it from squashing; object-fit keeps non-square favicons tidy. If the image
   fails to load, the component hides it (onError) so only the name shows. */
.fathom-glass-card-upgrade .partner-logo {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 5px;
  object-fit: contain;
}
.fathom-glass-card-upgrade:hover {
  border-color: rgba(224, 164, 37, 0.55);
  background-color: #ffffff;
  box-shadow: 0 8px 22px rgba(224, 164, 37, 0.18);
  transform: translateY(-2px);
}
