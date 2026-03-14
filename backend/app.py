from flask import Flask, request, jsonify
import openmeteo_requests
import pandas as pd
import requests_cache
import json
from retry_requests import retry
from datetime import datetime

app = Flask(__name__)

cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

@app.route('/weather', methods=['POST'])
def weather():
    data = request.get_json()
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    print(f"Received coords: latitude={latitude}, longitude={longitude}")
    if latitude is None or longitude is None:
        return jsonify({'error': 'Missing latitude or longitude'}), 400

    url = "https://marine-api.open-meteo.com/v1/marine"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["wave_height", "swell_wave_height", "wind_wave_height", "sea_level_height_msl"],
        "forecast_days": 3,
    }
    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]
    hourly = response.Hourly()
    hourly_wave_height = hourly.Variables(0).ValuesAsNumpy().tolist()
    hourly_swell_height = hourly.Variables(1).ValuesAsNumpy().tolist()
    hourly_wind_wave_height = hourly.Variables(1).ValuesAsNumpy().tolist()
    hourly_sea_level_height = hourly.Variables(1).ValuesAsNumpy().tolist()
    dates = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    ).strftime('%Y-%m-%dT%H:%M:%SZ').tolist()
    heights = hourly_wave_height
    swells = hourly_swell_height
    wind_waves = hourly_wind_wave_height
    sea_levels = hourly_sea_level_height
    result = [
        {"date": date, "height": height, "swell": swell, "wind_wave_height": wind_wave, "sea_level_height": sea_level}
        for date, height, swell, wind_wave, sea_level in zip(dates, heights, swells, wind_waves, sea_levels)
    ]
    print(json.dumps(result, indent=2))
    return calculateScore(result)

def calculateScore(result):
    max_wave = 2.0
    max_swell = 2.0
    max_wind_wave = 2.0
    max_sea_level = 1.0
    w_wave = 0.4
    w_swell = 0.2
    w_wind = 0.2
    w_sea = 0.2

    interval = 3
    n = len(result)
    interval_scores = []
    for i in range(0, n, interval):
        chunk = result[i:i+interval]
        chunk_scores = []
        for entry in chunk:
            wave_score = max(0, 1 - (entry['height'] / max_wave))
            swell_score = max(0, 1 - (entry['swell'] / max_swell))
            wind_score = max(0, 1 - (entry['wind_wave_height'] / max_wind_wave))
            sea_score = max(0, 1 - (abs(entry['sea_level_height']) / max_sea_level))
            total = w_wave * wave_score + w_swell * swell_score + w_wind * wind_score + w_sea * sea_score
            chunk_scores.append(total)
        avg_score = sum(chunk_scores) / len(chunk_scores) if chunk_scores else 0

        def format_hour(dt_str):
            dt = datetime.strptime(dt_str, '%Y-%m-%dT%H:%M:%SZ')
            h = dt.hour
            ampm = 'am' if h < 12 else 'pm'
            hour = h % 12
            if hour == 0:
                hour = 12
            return f"{hour}{ampm}"
        interval_label = None
        if chunk:
            interval_label = f"{format_hour(chunk[0]['date'])}-{format_hour(chunk[-1]['date'])}"
        interval_scores.append({
            "interval_start": chunk[0]["date"] if chunk else None,
            "interval_end": chunk[-1]["date"] if chunk else None,
            "interval_label": interval_label,
            "score": avg_score
        })
    return interval_scores

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
