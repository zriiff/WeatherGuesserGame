import random
import requests
import csv

API_KEY = "5c26a30700394a02465c639499c61e42"


def get_places():
    places = []
    with open("src/places.csv", mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            places.append(f"{row['city']}, {row['country']}")
    return places


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


def play_game(c: list):
    score = 0
    while True:
        cities = c
        city1 = cities[random.randint(0, len(cities) - 1)]
        cities.remove(city1)
        city2 = cities[random.randint(0, len(cities) - 1)]
        weather1, temp1 = get_weather_temp(city1)
        weather2, temp2 = get_weather_temp(city2)
        print(f"{city1} vs {city2}")
        num = int(input("Which place has a higher temp (1,2): "))
        if num == 1:
            if temp1 > temp2:
                print(f"You win! ({temp1}°F > {temp2}°F)\n")
                score += 1
            else:
                print(f"You lose ({temp1}°F > {temp2}°F)\n")
                break
        else:
            if temp2 > temp1:
                print(f"You win! ({temp1}°F < {temp2}°F)\n")
                score += 1
            else:
                print(f"You lose ({temp1}°F < {temp2}°F)\n")
                break
    return score


def main():
    cities = get_places()
    score = play_game(cities)
    print(f"Score: {score}")


if __name__ == '__main__':
    main()
