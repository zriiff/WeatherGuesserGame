# Weather Game
This html/js program is a game where you have the choice between to randomly selected cities and have to guess which place has a higher temperature.

## Background
I've always enjoyed symple online browser games, like the higher lower game. I decided to make a symple, unique game similar to this. 

## Download
This code is available at [repository on github](https://github.com/zriiff) This can be cloned, downloaded as a zip file, or forked.

## Requirements
Python 3
A search engine

## Execution
First run the following command while in the directory containing index.html
### Mac
`python3 -m http.server 8080`
### Windows/Linux
`python -m http.server 8080`

Then in your search engine, go to the website [localhost:8080](http://localhost:8080)


## Troubleshooting
 - Make sure to not rearange the contents of the website (js, assets, etc.)
 - Be sure to run the terminal command while inside the directory containing index.html. It will not work if you try and run this from any other directory.
 - If you keep getting an error that something is wrong with the API, then you can try getting your own key at [Open Weather](https://openweathermap.org/). Replace the key in the first line of the `js/weather_game.js` file.

## Authors
Zach Riiff

## Bibliography
GeoNames - [https://www.geonames.org/](https://www.geonames.org/) - [https://download.geonames.org/export/dump/](https://download.geonames.org/export/dump/)

OpenWeather - [https://openweathermap.org/](https://openweathermap.org/)
