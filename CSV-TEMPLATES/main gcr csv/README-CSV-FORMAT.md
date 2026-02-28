# Gulf Coast Radar - CSV Import Templates

## 📋 How to Use These Templates

### Available Templates:
1. **MASTER-ALL-BUSINESSES.csv** - Complete template with all fields (use this for most businesses)
2. **RESTAURANTS.csv** - Restaurants & dining
3. **COFFEE-SHOPS.csv** - Coffee shops & cafes
4. **SWEETS-BAKERY.csv** - Bakeries, ice cream, dessert shops
5. **ACTIVITIES-THINGS-TO-DO.csv** - Activities, attractions, tours
6. **BARS-NIGHTLIFE.csv** - Bars, nightclubs, entertainment venues

---

## 📝 Field Definitions

### Basic Info (Required)
- **id**: Unique identifier (lowercase, use dashes: `johns-restaurant`)
- **name**: Business name (`John's Restaurant`)
- **category**: Main category (see categories below)
- **cuisine**: Type of food/service (`American • Seafood • Burgers`)
- **location**: City (`Gulf Shores` or `Orange Beach`)
- **address**: Full address (`123 Main St, Gulf Shores, AL 36542`)
- **lat**: Latitude (`30.2472`)
- **lng**: Longitude (`-87.6348`)

### Contact Info
- **phone**: Phone number `(251) 555-1234`
- **email**: Email address
- **website**: Full URL `https://example.com`
- **facebook**: Facebook URL or leave blank
- **instagram**: Instagram handle `@username` or leave blank

### Details
- **rating**: Star rating `4.5` (0-5)
- **priceLevel**: Price range (`$`, `$$`, `$$$`, `$$$$`)
- **description**: Short description of business
- **hours**: Operating hours (`Mon-Thu 11am-9pm; Fri-Sun 11am-11pm`)
- **image**: Image URL (optional)

### Tags (Pipe-separated)
Use pipe `|` to separate multiple tags:
```
Beach Bar|Live Music|Family Friendly|Outdoor Seating
```

### Reservations
- **reservation_method**: `phone`, `opentable`, `resy`, `website`, or leave blank
- **reservation_phone**: Phone for reservations
- **reservation_opentable_id**: OpenTable ID (if applicable)

### Happy Hour
- **happyHour**: Time description (`Daily 3pm-6pm` or `Mon-Fri 4pm-7pm`)
- **happyHourSpecials**: Format: `Name~Category~Description|Name~Category~Description`
  ```
  $3 Off Appetizers~Food Specials~$3 off select appetizers|$2 Off Draft Beer~Beer Specials~$2 off all draft beers
  ```

### Specials (Pipe-separated, Tilde-delimited)
Format: `Name~Description~Day~Time|Name~Description~Day~Time`
```
Taco Tuesday~$2 tacos all day!~Every Tuesday~All Day|Wing Wednesday~50¢ wings~Every Wednesday~5pm-9pm
```

### Events (Pipe-separated, Tilde-delimited)
Format: `Name~Description~Day~Time|Name~Description~Day~Time`
```
Live Music Weekend~Live bands every weekend~Friday-Sunday~6pm-10pm|Trivia Night~Weekly trivia~Every Wednesday~7pm-9pm
```

### Menu Items (Pipe-separated, Tilde-delimited)
Format: `Name~Price~Category~Description|Name~Price~Category~Description`
```
Burger~$14.99~Burgers~½ lb Angus beef burger|Fish Tacos~$15.99~Seafood~3 tacos with slaw|Caesar Salad~$11.99~Salads~Romaine, parmesan, croutons
```

### Drinks (Pipe-separated, Tilde-delimited)
Format: `Name~Price~Category~Description|Name~Price~Category~Description`
```
Margarita~$9.99~Cocktails~Classic lime margarita|Draft Beer~$5.99~Beer~Local selection|House Wine~$8.99~Wine~Red or white
```

---

## 🏷️ Categories

Use ONE of these for the **category** field:
- `restaurants` - All restaurants
- `coffee` - Coffee shops & cafes
- `sweets` - Bakeries, ice cream, desserts
- `bars` - Bars & nightlife
- `activities` - Things to do, attractions
- `shopping` - Retail stores
- `services` - Services (salons, spas, etc.)
- `hotels` - Hotels & accommodations
- `other` - Other businesses

---

## 💡 Tips

1. **Keep it simple**: You don't need to fill every field. Basic info + menu is usually enough.

2. **Use the separators correctly**:
   - Pipe `|` separates items in a list
   - Tilde `~` separates fields within an item

3. **Latitude/Longitude**: Get coordinates from Google Maps (right-click on location)

4. **Images**: Use Unsplash for free images: `https://images.unsplash.com/photo-XXXXX?w=800`

5. **Test with one row first**: Add one business, import it, check if it works, then add more.

---

## 📤 How to Import

1. Fill out your CSV file
2. Go to admin dashboard: `http://localhost:8083/admin-dashboard.html`
3. Click **"GCR Businesses"** tab
4. Click **"Import CSV"** button
5. Select your CSV file
6. Data will be uploaded to Supabase

---

## ✅ Example Row (COPY THIS!)

```csv
example-restaurant,The Example Restaurant,restaurants,American • Seafood,Gulf Shores,"101 Beach Blvd, Gulf Shores, AL 36542",30.2472,-87.6348,(251) 555-1234,info@example.com,https://example.com,https://facebook.com/example,@example,4.5,$$,"Beach Bar|Live Music|Family Friendly",Fresh seafood and American classics on the beach,Mon-Thu 11am-9pm; Fri-Sun 11am-11pm,phone,(251) 555-1234,,Daily 3pm-6pm,"$3 Off Apps~Food~$3 off appetizers|$2 Beer~Beer~$2 off draft","Taco Tuesday~$2 tacos~Every Tuesday~All Day","Live Music~Bands on weekend~Fri-Sun~6pm-10pm","Burger~$14.99~Burgers~Angus beef burger|Tacos~$15.99~Seafood~Fish tacos|Salad~$11.99~Salads~Caesar salad","Margarita~$9.99~Cocktails~Classic margarita|Beer~$5.99~Beer~Draft selection",https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800
```

---

**Questions?** Check the example in MASTER-ALL-BUSINESSES.csv or contact support.
