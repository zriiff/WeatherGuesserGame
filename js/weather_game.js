/*
  Written independently using...

  Sources
    GeoNames - (https://www.geonames.org/ + https://download.geonames.org/export/dump/) - For the weather API
    OpenWeather - (https://openweathermap.org/) - For the places.csv data

  Notes
    places.csv is a file in the format ...
      city,country
      Aba,Nigeria
      Abeokuta,Nigeria
      ...
    it contains around 1000 of the most populated cities in the world
 */

const API_KEY = "5c26a30700394a02465c639499c61e42"
const UNITS = "imperial"

const DISPLAY1 = document.querySelector("#main .game-holder .game-place.one .place-name");
const DISPLAY2 = document.querySelector("#main .game-holder .game-place.two .place-name");

const TEMP_DISPLAY1 = document.querySelector("#main .game-holder .game-place.one .temperature");
const TEMP_DISPLAY2 = document.querySelector("#main .game-holder .game-place.two .temperature");

const OVERLAY = document.querySelector("#main .overlay");
const OVERLAY_SCORE_DISPLAY = document.querySelector("#main .overlay .gameover-container .score-display strong");
const OVERLAY_PLAY_AGAIN_BUTTON = document.querySelector("#main .overlay .gameover-container .play-again");

const DISPLAY_SETTINGS = {
    transition: DISPLAY1.style.transition,
    marginTop: {
        default: DISPLAY1.style.marginTop,
        animated: "30px"
    },
    fontSize: {
        default: DISPLAY1.style.fontSize,
        animated: "42px"
    }
}

const TEMPERATURE_ANIMATION_TIME = 1500;

function csvTextToList(text) {
    const lines = text.split("\n");
    const keys = lines[0].split(",");
    const data = lines.slice(1);
    const csvList = []
    for (let line of data) {
        const values = line.split(",");
        const dict = {}
        for (let i = 0; i < keys.length; i ++) {
            dict[keys[i].trim()] = values[i].replace("\r", "");
        }
        csvList.push(dict)
    }
    return csvList
}

async function getPlaces() {
    const res = await fetch("../assets/places.csv");
    const text = await res.text();
    return csvTextToList(text);
}

function placeToString(place) {
    return place["city"] + ", " + place["country"];
}

async function getWeatherTemp(place) {
    try {
        const locationRequest = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${placeToString(place)}&limit=${1}&appid=${API_KEY}`);
        const locationRequestJson = await locationRequest.json();
        const location = [locationRequestJson[0]['lat'], locationRequestJson[0]['lon']];
        const weatherRequest = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location[0]}&lon=${location[1]}&units=${UNITS}&appid=${API_KEY}`);
        const weatherRequestJson = await weatherRequest.json();
        const weather = weatherRequestJson["weather"][0]["description"];
        const temperature = weatherRequestJson["main"]["temp"];
        return {weather: weather, temperature: temperature};
    } catch (e) {
        return null;
    }
}

function displayText(city1, city2) {
    DISPLAY1.innerHTML = city1;
    DISPLAY2.innerHTML = city2;
}

async function waitForUserInput() {
    const button1 = document.querySelector("#main .game-holder .game-place.one button");
    const button2 = document.querySelector("#main .game-holder .game-place.two button");
    return await new Promise((resolve) => {
        button1.addEventListener("click", onButton1Clicked);
        button2.addEventListener("click", onButton2Clicked);
        function onButton1Clicked() {
            button1.removeEventListener("click", onButton1Clicked);
            button2.removeEventListener("click", onButton2Clicked);
            resolve(1);
        }
        function onButton2Clicked() {
            button1.removeEventListener("click", onButton1Clicked);
            button2.removeEventListener("click", onButton2Clicked);
            resolve(2);
        }
    });
}

async function animateGame(temp1, temp2) {
    return new Promise((resolve) => {
        function handleTransitionEnd(event) {
            if (event.target === DISPLAY1 || event.target === DISPLAY2) {
                event.target.removeEventListener("transitionend", handleTransitionEnd);
                displayTemperature(temp1, temp2);
            }
        }

        function displayTemperature(temp1, temp2) {
            let lastTimestamp = null;
            let accumulatedTemp = 0;
            const endTemp = Math.max(Math.abs(temp1), Math.abs(temp2));
            const step = (timestamp) => {
                if (lastTimestamp == null) {
                    lastTimestamp = timestamp
                }
                const deltaTime = timestamp - lastTimestamp;
                lastTimestamp = timestamp
                accumulatedTemp += endTemp / TEMPERATURE_ANIMATION_TIME * deltaTime;
                if (accumulatedTemp > Math.abs(temp1)) {
                    TEMP_DISPLAY1.innerHTML = "<p>" + temp1.toFixed(2) + "°F<p/>";
                    TEMP_DISPLAY1.querySelector("p")
                        .style.fontSize = Math.round(40 + (100 - 40) / endTemp * temp1) + "px";
                } else {
                    let printTemp = (accumulatedTemp * (temp1 / Math.abs(temp1))).toFixed(2);
                    TEMP_DISPLAY1.innerHTML = "<p>" + printTemp + "°F<p/>";
                    TEMP_DISPLAY1.querySelector("p")
                        .style.fontSize = Math.round(40 + (100 - 40) / endTemp * accumulatedTemp) + "px";
                }

                if (accumulatedTemp > Math.abs(temp2)) {
                    TEMP_DISPLAY2.innerHTML = "<p>" + temp2.toFixed(2) + "°F<p/>";
                    TEMP_DISPLAY2.querySelector("p")
                        .style.fontSize = Math.round(40 + (100 - 40) / endTemp * temp2) + "px";
                } else {
                    let printTemp = (accumulatedTemp * (temp2 / Math.abs(temp2))).toFixed(2);
                    TEMP_DISPLAY2.innerHTML = "<p>" + printTemp + "°F<p/>";
                    TEMP_DISPLAY2.querySelector("p")
                        .style.fontSize = Math.round(40 + (100 - 40) / endTemp * accumulatedTemp) + "px";
                }

                if (accumulatedTemp < endTemp) {
                    window.requestAnimationFrame(step);
                }
            }
            window.requestAnimationFrame(step);
            setTimeout(() => {
                resolve();
            }, TEMPERATURE_ANIMATION_TIME + 1000);
        }

        DISPLAY1.addEventListener("transitionend", handleTransitionEnd);
        DISPLAY2.addEventListener("transitionend", handleTransitionEnd);
        DISPLAY1.style.marginTop = DISPLAY_SETTINGS.marginTop.animated;
        DISPLAY2.style.marginTop = DISPLAY_SETTINGS.marginTop.animated;
        DISPLAY1.style.fontSize = DISPLAY_SETTINGS.fontSize.animated;
        DISPLAY2.style.fontSize = DISPLAY_SETTINGS.fontSize.animated;
    })
}

function resetGame() {
    DISPLAY1.style.marginTop = DISPLAY_SETTINGS.marginTop.default;
    DISPLAY2.style.marginTop = DISPLAY_SETTINGS.marginTop.default;
    DISPLAY1.style.fontSize = DISPLAY_SETTINGS.fontSize.default;
    DISPLAY2.style.fontSize = DISPLAY_SETTINGS.fontSize.default;
    TEMP_DISPLAY1.innerHTML = "";
    TEMP_DISPLAY2.innerHTML = "";
}

async function playGame(c) {
    let score = 0;
    let running = true;
    while (running) {
        resetGame()
        let cities = c;
        const place1 = cities[Math.floor(Math.random() * cities.length)];
        const city1Info = await getWeatherTemp(place1);
        if (city1Info == null) {
            alert("Error loading weather data, something is wrong with the API.");
        }
        let newCities = []
        cities.forEach((value) => {
            if (value["country"] !== place1["country"]) {
                newCities.push(value);
            }
        })
        cities = newCities;
        const place2 = cities[Math.floor(Math.random() * cities.length)];
        const city2Info = await getWeatherTemp(place2);
        if (city2Info == null) {
            alert("Error loading weather data, something is wrong with the API.");
        }
        displayText(
            placeToString(place1).replace(",", ",<br/>"),
            placeToString(place2).replace(",", ",<br/>")
        );
        const num = await waitForUserInput();
        await animateGame(city1Info["temperature"], city2Info["temperature"])
        if (num === 1) {
            if (city1Info["temperature"] >= city2Info["temperature"]) {
                console.log(`You win! (${city1Info["temperature"]}°F > ${city2Info["temperature"]}°F)\n`);
                displayText("Loading...", "Loading...");
                score += 1;
            } else {
                console.log(`You lose (${city1Info["temperature"]}°F < ${city2Info["temperature"]}°F)\n`);
                running = false;

            }
        } else {
            if (city2Info["temperature"] >= city1Info["temperature"]) {
                console.log(`You win! (${city1Info["temperature"]}°F < ${city2Info["temperature"]}°F)\n`);
                displayText("Loading...", "Loading...");
                score += 1;
            } else {
                console.log(`You lose (${city1Info["temperature"]}°F > ${city2Info["temperature"]}°F)\n`);
                running = false;
            }
        }
    }
    gameover(score);
    return score;
}

function gameover(score) {
    function playAgain() {
        OVERLAY.style.display = "none"
        displayText("Loading...", "Loading...");
        main();
        OVERLAY_PLAY_AGAIN_BUTTON.removeEventListener("click", playAgain);
    }
    OVERLAY.style.display = "flex"
    OVERLAY_SCORE_DISPLAY.innerHTML = score
    OVERLAY_PLAY_AGAIN_BUTTON.addEventListener("click", playAgain)
}

async function main() {
    const cities = await getPlaces();
    const score = await playGame(cities);
    console.log("Score: " + score)
    return true;
}

main();
