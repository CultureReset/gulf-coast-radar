import requests
import json

response = requests.get('http://localhost:3002/api/gcr/businesses')
data = response.json()

if data.get('success'):
    businesses = data.get('businesses', [])
    
    # Find Cobalt
    cobalt = [b for b in businesses if 'cobalt' in b.get('name', '').lower()]
    
    if cobalt:
        print('Found Cobalt!\n')
        business = cobalt[0]
        
        print('=== BUSINESS LEVEL TIME FIELDS ===')
        time_fields = ['happyHour', 'happyHourDays', 'happyHourStartTime', 'happyHourEndTime', 
                       'happy_hour', 'happy_hour_start', 'happy_hour_end', 'happyHourTime']
        for field in time_fields:
            if field in business:
                print(f'{field}: {business[field]}')
        
        print('\n=== HAPPY HOUR DATA ===')
        hh_fields = ['happyHourSpecials', 'happy_hour', 'happyHours']
        for field in hh_fields:
            if field in business:
                data = business[field]
                print(f'\n{field} type: {type(data)}')
                if isinstance(data, list) and len(data) > 0:
                    print(f'First item: {json.dumps(data[0], indent=2)}')
                elif isinstance(data, dict):
                    print(f'Data: {json.dumps(data, indent=2)[:500]}')
        
        print('\n=== MENU STRUCTURE ===')
        if 'menu' in business and isinstance(business['menu'], dict):
            if 'happyhour' in business['menu']:
                hh_menu = business['menu']['happyhour']
                print(f'menu.happyhour keys: {hh_menu.keys()}')
                if 'schedule' in hh_menu:
                    print(f'schedule: {hh_menu["schedule"]}')
                if 'time' in hh_menu:
                    print(f'time: {hh_menu["time"]}')
                if 'name' in hh_menu:
                    print(f'name: {hh_menu["name"]}')
