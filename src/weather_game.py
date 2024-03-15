import requests

API_KEY = "5c26a30700394a02465c639499c61e42"


def get_weather_temp(place):
    location_request = requests.get(f"http://api.openweathermap.org/geo/1.0/direct?q={place}&limit={1}&appid={API_KEY}")
    location_request_json = location_request.json()
    location = (location_request_json[0]['lat'], location_request_json[0]['lon'])
    units = "imperial"
    weather_request = requests.get(f"https://api.openweathermap.org/data/2.5/weather?lat={location[0]}&lon={location[1]}&units={units}&appid={API_KEY}")
    weather_request_json = weather_request.json()
    weather = weather_request_json["weather"][0]["description"]
    tempurature = weather_request_json["main"]["temp"]
    return weather, tempurature


def main():
    andover = "Andover, Massachusetts, US"
    place = "Torraca, Italy"
    andover_weather, andover_temp = get_weather_temp(place)
    print(f"In {place}, it is currently \"{andover_weather}\" with a temperature of {andover_temp}°F")


if __name__ == '__main__':
    main()
