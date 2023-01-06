'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;// will keep the state of the map

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    map = L.map('map').setView(coords, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);


    // part of Leaflet library (on())
    // add markers on the map where user clicked (handling clicks on map)
    map.on("click", function(eMap) {
      mapEvent = eMap; // Set state of the map (moves it to the global variable)
      form.classList.remove("hidden");
      inputDistance.focus();

    });

  }, (error) => {
    alert("Could not get your position");
  });

form.addEventListener("submit", function(e) {
  e.preventDefault();
  // Display marker after form is filled and submitted
  const { lat, lng } = mapEvent.latlng;
  const coords = [lat, lng];


  L.marker(coords)
    .addTo(map)
    .bindPopup(L.popup({
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: "running-popup"
    }))
    .setPopupContent("Workout")
    .openPopup();

  // Clear input fields and hide form
  inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";
  form.classList.add("hidden");
});

inputType.addEventListener("change", function(e) {
  inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
