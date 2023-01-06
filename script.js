'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map; // Private Instance Properties
  #mapEvent;
  constructor() { //Called immediately when a new instance of this class is created
    this._getPosition(); // gets current position at the start
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), //use the coords from this to load map
        (error) => {
          alert("Could not get your position");
        });
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.#map);
    // part of Leaflet library (on())
    // add markers on the map where user clicked (handling clicks on map)
    this.#map.on("click", this._showForm.bind(this));
  };

  _showForm(eMap) {
    this.#mapEvent = eMap; // Set state of the map (moves it to the global variable)
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField(e) {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();
    // Display marker after form is filled and submitted
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];

    L.marker(coords)
      .addTo(this.#map)
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
  }
}
// Initializing the App class
const app = new App();
