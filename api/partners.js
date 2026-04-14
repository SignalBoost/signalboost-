const express = require('express');
const router = express.Router();

// ===============================
// FULL PARTNER LIST (CLEANED)
// ===============================

const partners = {
  "Flights & Travel Meta": [
    { name: "Kiwi CA", url: "https://www.awin1.com/cread.php?awinmid=19859&awinaffid=2834806" },
    { name: "Kiwi US", url: "https://www.awin1.com/cread.php?awinmid=19856&awinaffid=2834806" },
    { name: "Aviasales", url: "https://aviasales.tpo.lv/VoWXgFFm" }
  ],

  "Hotels & Meta": [
    { name: "Trivago AR", url: "https://www.awin1.com/cread.php?awinmid=105929&awinaffid=2834806" },
    { name: "Trivago BR", url: "https://www.awin1.com/cread.php?awinmid=105937&awinaffid=2834806" },
    { name: "Trivago MX", url: "https://www.awin1.com/cread.php?awinmid=105931&awinaffid=2834806" }
  ],

  "SIM & eSIM": [
    { name: "Airalo", url: "https://airalo.tpo.lv/eXjKLiuw" },
    { name: "Yesim", url: "https://yesim.tpo.lv/3vIzBQts" },
    { name: "Drimsim", url: "https://drimsim.tpo.lv/PGwr6JTr" }
  ],

  "Cars & Transfers": [
    { name: "Localrent", url: "https://localrent.tpo.lv/XS0CqdMP" },
    { name: "EconomyBookings", url: "https://economybookings.tpo.lv/jSFMPEPA" },
    { name: "QEEQ", url: "https://qeeq.tpo.lv/jklB4Pbm" },
    { name: "GetTransfer", url: "https://gettransfer.tpo.lv/Pb4p9ljm" }
  ],

  "Activities & Experiences": [
    { name: "Klook", url: "https://klook.tpo.lv/pTp1NljF" },
    { name: "WeGoTrip", url: "https://wegotrip.tpo.lv/kKIF0gIW" },
    { name: "Big Bus Tours", url: "https://bigbustours.tpo.lv/grT1QWXA" }
  ],

  "Travel Services": [
    { name: "AirHelp", url: "https://airhelp.tpo.lv/EPrGDSO3" },
    { name: "Radical Storage", url: "https://radicalstorage.tpo.lv/tna4hnly" },
    { name: "HolidayTaxis", url: "https://holidaytaxis.tpo.lv/oHwpbrFt" }
  ],

  "Other & Shopping": [
    { name: "Tsarbomba", url: "https://www.awin1.com/cread.php?awinmid=109230&awinaffid=2834806" }
  ]
};

// ===============================
// API ROUTE
// ===============================

router.get('/', (req, res) => {
  res.json(partners);
});

module.exports = router;
