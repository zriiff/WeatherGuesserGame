const API_KEY = "5c26a30700394a02465c639499c61e42"
const UNITS = "imperial"

const DISPLAY1 = document.querySelector("#main .game-holder .game-place.one .place-name");
const DISPLAY2 = document.querySelector("#main .game-holder .game-place.two .place-name");

function csvTextToList(text) {
    const lines = text.split("\n");
    const keys = lines[0].split(",");
    const data = lines.slice(1);
    return data.map((line) => {
        const values = line.split(",");
        const dict = {}
        keys.forEach((key, index) => {
            dict[key.trim()] = values[index].replace("\r", "");
        });
        return dict;
    });
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
    const locationRequest = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${placeToString(place)}&limit=${1}&appid=${API_KEY}`);
    const locationRequestJson= await locationRequest.json();
    const location = [locationRequestJson[0]['lat'], locationRequestJson[0]['lon']];
    const weatherRequest = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location[0]}&lon=${location[1]}&units=${UNITS}&appid=${API_KEY}`);
    const weatherRequestJson = await weatherRequest.json();
    const weather = weatherRequestJson["weather"][0]["description"];
    const temperature = weatherRequestJson["main"]["temp"];
    return {weather: weather, temperature: temperature};
}

function displayText(city1, city2) {
    const display1 = document.querySelector("#main .game-holder .game-place.one .place-name");
    display1.innerHTML = city1;
    const display2 = document.querySelector("#main .game-holder .game-place.two .place-name");
    display2.innerHTML = city2;
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

async function animateGuess() {
    return new Promise((resolve) => {
        const handleTransitionEnd = (event) => {
            if (event.target === DISPLAY1 || event.target === DISPLAY2) {
                event.target.removeEventListener("transitionend", handleTransitionEnd);
                resolve();
            }
        }
        DISPLAY1.addEventListener("transitionend", handleTransitionEnd);
        DISPLAY2.addEventListener("transitionend", handleTransitionEnd);
        DISPLAY1.style.marginTop = "30px";
        DISPLAY2.style.marginTop = "30px";
        DISPLAY1.style.fontSize = "42px";
        DISPLAY2.style.fontSize = "42px";
    })
}

async function playGame(c) {
    let score = 0;
    let running = true;
    while (running) {
        let cities = c;
        const place1 = cities[Math.floor(Math.random() * cities.length)];
        const city1Info = await getWeatherTemp(place1);
        cities = cities.slice(0, cities.indexOf(place1)).concat(cities.slice(cities.indexOf(place1) + 1));
        const place2 = cities[Math.floor(Math.random() * cities.length)];
        const city2Info = await getWeatherTemp(place2);

        displayText(
            placeToString(place1).replace(",", ",<br/>"),
            placeToString(place2).replace(",", ",<br/>")
        );
        // console.log(placeToString(place1));
        // console.log(city1Info);
        // console.log(placeToString(place2));
        // console.log(city2Info);

        const num = await waitForUserInput();
        await animateGuess()
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
    gameOver();
    return score;
}

function gameOver() {
    displayText("XXXXXXXXX", "XXXXXXXXX");
}

async function main() {
    const cities = await getPlaces();
    const score = await playGame(cities);
    console.log(`score: ${score}`);
}

main();
