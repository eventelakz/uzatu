/* =========================================
   НАСТРОЙКИ ПРИГЛАШЕНИЯ
========================================= */

const WEDDING = {

  // Имя можно поменять здесь
  bride: "Аяулы қызымыз",

  // Имя девушки
  name: "(сіздің есіміңіз)",

  // Дата
  dateText: "17 қыркүйек 2026",

  // Время начала
  // ПОКА стоит 18:00 - потом просто поменяй
  dateISO: "2026-09-17T18:00:00+05:00",

  // Ресторан
  venue: "Ресторан атауы",

  // Адрес
  address: "Алматы қаласы, мекенжайы",

  // Ссылка на 2GIS
  map: "#",

  // WhatsApp EVENTELA
  whatsapp: "77475308178",

  // Google Apps Script
  // Сюда вставишь ссылку после подключения Google Sheets
  googleScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL"
};


/* =========================================
   ELEMENTS
========================================= */

const opening = document.getElementById("opening");
const openButton = document.getElementById("openButton");
const mainContent = document.getElementById("mainContent");

const music = document.getElementById("music");
const musicControl = document.getElementById("musicControl");

const guestForm = document.getElementById("guestForm");
const formSuccess = document.getElementById("formSuccess");

const introVideo = document.getElementById("introVideo");


/* =========================================
   TEXT
========================================= */

document.querySelectorAll(".hero-name, .letter-name")
  .forEach(function(element) {
    element.textContent = WEDDING.name;
  });

document.querySelectorAll(".hero-content h1, .letter h2")
  .forEach(function(element) {
    element.textContent = WEDDING.bride;
  });

document.getElementById("venue").textContent = WEDDING.venue;
document.getElementById("address").textContent = WEDDING.address;

document.getElementById("mapLink").href = WEDDING.map;


/* =========================================
   OPEN ENVELOPE
========================================= */

let invitationOpened = false;

openButton.addEventListener("click", function() {

  if (invitationOpened) return;

  invitationOpened = true;

  /*
    Lock page while envelope animation is playing.
  */

  document.body.classList.add("locked");

  /*
    Start envelope animation.
  */

  opening.classList.add("opened");


  /*
    Music can start because this action
    comes directly from user's tap.
  */

  music.volume = 0.35;

  music.play()
    .then(function() {

      musicControl.style.display = "flex";

    })
    .catch(function(error) {

      console.log("Music autoplay blocked:", error);

      musicControl.style.display = "flex";

    });


  /*
    IMPORTANT:
    We do NOT show the main page immediately.

    First:
    1. envelope opens
    2. letter rises
    3. opening screen disappears
    4. only then main content becomes visible

    This prevents the old bug where photos/video
    appeared behind the envelope.
  */

  setTimeout(function() {

    opening.classList.add("is-hidden");

  }, 1800);


  setTimeout(function() {

    mainContent.classList.add("is-visible");

    document.body.classList.remove("locked");

    /*
      Make sure the video starts immediately.
    */

    introVideo.play()
      .catch(function(error) {
        console.log("Video autoplay blocked:", error);
      });

  }, 2850);

});


/* =========================================
   MUSIC BUTTON
========================================= */

let musicPlaying = true;

musicControl.addEventListener("click", function() {

  if (musicPlaying) {

    music.pause();

    musicPlaying = false;

    musicControl.querySelector(".music-symbol").textContent = "♪";

  } else {

    music.play()
      .then(function() {

        musicPlaying = true;

        musicControl.querySelector(".music-symbol").textContent = "♫";

      })
      .catch(function(error) {

        console.log("Music could not start:", error);

      });

  }

});


/* =========================================
   COUNTDOWN
========================================= */

const weddingDate =
  new Date(WEDDING.dateISO).getTime();


function updateCountdown() {

  const now = new Date().getTime();

  const distance = weddingDate - now;


  if (distance <= 0) {

    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";

    return;
  }


  const days =
    Math.floor(
      distance / (1000 * 60 * 60 * 24)
    );

  const hours =
    Math.floor(
      (distance % (1000 * 60 * 60 * 24))
      / (1000 * 60 * 60)
    );

  const minutes =
    Math.floor(
      (distance % (1000 * 60 * 60))
      / (1000 * 60)
    );

  const seconds =
    Math.floor(
      (distance % (1000 * 60))
      / 1000
    );


  document.getElementById("days").textContent =
    String(days).padStart(2, "0");

  document.getElementById("hours").textContent =
    String(hours).padStart(2, "0");

  document.getElementById("minutes").textContent =
    String(minutes).padStart(2, "0");

  document.getElementById("seconds").textContent =
    String(seconds).padStart(2, "0");
}


updateCountdown();

setInterval(updateCountdown, 1000);


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
  document.querySelectorAll(".reveal");


const revealObserver =
  new IntersectionObserver(
    function(entries) {

      entries.forEach(function(entry) {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12
    }
  );


revealElements.forEach(function(element) {

  revealObserver.observe(element);

});


/* =========================================
   AUTO SCROLL
   Starts after invitation opens
========================================= */

let autoScroll = null;
let autoScrolling = false;


function startAutoScroll() {

  if (autoScrolling) return;

  autoScrolling = true;

  autoScroll = setInterval(function() {

    window.scrollBy(0, 1);

  }, 70);

}


function stopAutoScroll() {

  if (autoScroll) {

    clearInterval(autoScroll);

    autoScroll = null;

  }

  autoScrolling = false;

}


window.addEventListener(
  "touchstart",
  stopAutoScroll,
  { passive: true }
);

window.addEventListener(
  "wheel",
  stopAutoScroll,
  { passive: true }
);

window.addEventListener(
  "mousedown",
  stopAutoScroll
);


/*
  Auto-scroll starts only after the hero
  has had time to appear.
*/

setTimeout(function() {

  if (invitationOpened) {
    startAutoScroll();
  }

}, 6500);


/* =========================================
   RSVP
========================================= */

guestForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const submitButton =
      guestForm.querySelector(".rsvp-button");


    /*
      If Google Script URL hasn't been added,
      don't pretend that the form was sent.
    */

    if (
      !WEDDING.googleScriptUrl ||
      WEDDING.googleScriptUrl ===
      "YOUR_GOOGLE_APPS_SCRIPT_URL"
    ) {

      alert(
        "Google Sheets әлі қосылмаған. " +
        "script.js ішіндегі googleScriptUrl жолына " +
        "Google Apps Script сілтемесін енгізіңіз."
      );

      return;
    }


    submitButton.disabled = true;
    submitButton.textContent = "ЖІБЕРІЛУДЕ...";


    const formData =
      new FormData(guestForm);


    try {

      const response =
        await fetch(
          WEDDING.googleScriptUrl,
          {
            method: "POST",
            body: formData
          }
        );


      if (!response.ok) {

        throw new Error(
          "Request failed"
        );

      }


      guestForm.style.display = "none";

      formSuccess.style.display = "block";


    } catch (error) {

      console.error(error);

      submitButton.disabled = false;

      submitButton.textContent =
        "ҚАЙТА ЖІБЕРУ";

      alert(
        "Жауапты жіберу мүмкін болмады. " +
        "Біраз уақыттан кейін қайта көріңіз."
      );

    }

  }
);
