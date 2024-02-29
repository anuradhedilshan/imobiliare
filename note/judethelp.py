import requests
import json

judet_list = [
    "alba", "arad", "arges", "bacau", "bihor", "bistrita-nasaud", "botosani", "braila", "brasov",
    "buzau", "calarasi", "caras-severin", "cluj", "constanta", "covasna", "dambovita", "dolj",
    "galati", "giurgiu", "gorj", "harghita", "hunedoara", "ialomita", "iasi", "ilfov", "maramures",
    "mehedinti", "mures", "neamt", "olt", "prahova", "salaj", "satu-mare", "sibiu", "suceava",
    "teleorman", "timis", "tulcea", "valcea", "vaslui", "vrancea"
]

base_url = "https://www.imobiliare.ro/sugestii-v2/tranzactie-2/{}"
result_data = []

for judet in judet_list:
    url = base_url.format(judet)
    response = requests.get(url)

    if response.status_code == 200:
        try:
            data = response.json()
            sugestii_list = data.get("sugestii", [])

            for sugestie in sugestii_list:
                if "nume_localitate" not in sugestie:
                    result_data.append({
                        "judet_name": judet,
                        "id": sugestie["id"]
                    })

        except ValueError as e:
            print(f"Error parsing JSON: {e}")
    else:
        print(f"Error fetching data for {judet}. Status code: {response.status_code}")

# Save the result_data to a JSON file
with open("judet_id_data.json", "w") as json_file:
    json.dump(result_data, json_file, indent=2)

print("Data saved to judet_id_data.json")
