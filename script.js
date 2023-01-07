'use strict';

// Application Architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map; // Private Instance Properties
  #mapZoomLvl = 13;
  #mapEvent;
  #workouts = []; // Initialized with an empty arr
  constructor() { //Called immediately when a new instance of this class is created
    this._getPosition(); // gets current position at the start
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
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

    this.#map = L.map('map').setView(coords, this.#mapZoomLvl);
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

  _hideForm(e) {
    // empty inputs
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";
    // imitates replacing of the form to the new workout display
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => form.style.display = "grid", 1000);
  }

  _toggleElevationField(e) {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    // Helper functions for validation
    const validInputs = (...inputs) => inputs.every(input => Number.isFinite(input));
    const positiveInts = (...inputs) => inputs.every(input => input > 0);

    e.preventDefault();

    // Get data from the form
    const type = inputType.value;
    // "+" transforms it into an integer
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    // packing coordinates for the class constructors
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];

    // creating a variable to hold "workout" in the outside scope to use in methods
    let workout;
    // Create an object depending on type of workout
    if (type === "running") {
      const cadence = +inputCadence.value;

      // Validation of data (checks for valid numbers)
      if (!validInputs(distance, duration, cadence) || !positiveInts(distance, duration, cadence)
      ) return alert("Inputs have to be positive numbers");

      workout = new Running(coords, distance, duration, cadence);
    }
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      // Validation of data
      if (!validInputs(distance, duration, elevation) || !positiveInts(distance, duration)
      ) return alert("Inputs have to be positive numbers");

      workout = new Cycling(coords, distance, duration, elevation);
    }


    // After Passing Validation Add new object to workout arr
    this.#workouts.push(workout);

    // render workout on the list
    this._renderWorkout(workout);

    // Display marker after form is filled and submitted
    this._renderWorkoutMarker(workout);

    // Clear input fields and hide form
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    // render workout on the map as marker
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`
      }))
      .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`)
      .openPopup();
  }
  _renderWorkout(workout) {
    let html =
      `<li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;
    if (workout.type === "running")
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace}</span>
          <span class="workout__unit">${workout.cadence}</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">178</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === "cycling")
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) { // When workout is clicked it will move map to the precise location
    const workoutEl = e.target.closest(".workout"); //getter for the div with clicked on workout
    if (!workoutEl) return;
    const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
    this.#map.setView(workout.coords, this.#mapZoomLvl, {
      animate: true,
      pan: { duration: 1 }
    });
    // Using Public Interface
    workout.click();
  }

}

class Workout {
  // ES6 class fields
  date = new Date();
  id = (Date.now() + "").slice(-10); // Bad Idea, but works for now
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDesc() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
    console.log(this.clicks);
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace(); // runs on creation of the instance
    this._setDesc(); // Uses the type and date of workout to make a string
  };

  calcPace() {
    // min per km
    this.pace = (this.duration / this.distance).toFixed(2);
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.calcSpeed();
    this._setDesc();
  };

  calcSpeed() {
    // kilometers per hour = kilometers / (hours + (minutes / 60))
    this.speed = Math.round(this.duration / (this.distance / 60));
    return this.speed;
  }



}
// Initializing the App class
const app = new App();
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycle1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycle1);
