import requests

API_KEY = "5c26a30700394a02465c639499c61e42"
UNITS = "metric"


def main():
    place = "London, GB"
    location_request = requests.get(f"http://api.openweathermap.org/geo/1.0/direct?q={place}&limit={1}&appid={API_KEY}")
    location_request_json = location_request.json()
    location = (location_request_json[0]['lat'], location_request_json[0]['lon'])

    weather_request = requests.get(f"https://api.openweathermap.org/data/2.5/weather?lat={location[0]}&lon={location[1]}&units={UNITS}&appid={API_KEY}")

    print(weather_request.json())


if __name__ == '__main__':
    main()
