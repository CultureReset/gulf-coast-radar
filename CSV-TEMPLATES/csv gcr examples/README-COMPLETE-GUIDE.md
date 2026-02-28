# Gulf Coast Radar - Complete CSV Import Guide

## 📋 Quick Start

### What's New?
The old CSV templates that crammed everything into one row with pipe/tilde separators are **GONE**!

The new system uses:
- ✅ **One record per row** - Much cleaner and easier to edit
- ✅ **RecordType column** - Each row specifies what type of data it contains
- ✅ **69 columns total** - All data fields properly separated
- ✅ **Excel/Google Sheets friendly** - Edit in any spreadsheet program
- ✅ **Flexible importing** - Add business first, then menus/events later

---

## 📁 Available Templates

### Universal Templates (Use for ALL business types):
1. **1-BUSINESS-PROFILES.csv** - Business basic info (name, address, contact, description)
2. **2-HOURS.csv** - Operating hours (each day separate)
3. **3-HAPPY-HOURS.csv** - Happy hour time windows (drink/food discounts)
4. **4-SPECIALS.csv** - Daily/weekly specials (Taco Tuesday, etc.)
5. **5-MENU-SECTIONS.csv** - Menu organization (Appetizers, Seafood, etc.)
6. **6-FOOD-ITEMS.csv** - Food menu items
7. **7-DRINK-ITEMS.csv** - Drink menu items (separate from food)
8. **8-OPTION-GROUPS.csv** - Menu item modifier groups
9. **9-OPTIONS.csv** - Individual modifier options
10. **10-EVENTS.csv** - Entertainment events (Live Music, Trivia, etc.)
11. **11-POLICIES.csv** - Business policies

### Category Example Files (Complete business examples):
- **EXAMPLE-RESTAURANT.csv** - Full restaurant with food, drinks, events
- **EXAMPLE-COFFEE-SWEETS.csv** - Coffee shop with pastries and ice cream
- **EXAMPLE-THINGS-TO-DO.csv** - Dolphin cruise with ticket pricing
- **EXAMPLE-EVENTS-VENUE.csv** - Live music venue with concerts
- **EXAMPLE-NIGHTLIFE.csv** - Beach bar with happy hours and events
- **EXAMPLE-OTHER.csv** - Boat launch with fees and services

---

## 📊 Complete CSV Column Format

**ALL CSV files must use this exact 69-column header:**

```
RecordType,BusinessID,BusinessName,Category,City,State,Country,Address,Phone,MailingAddress,Website,Email,Facebook,Instagram,Description,Cuisine,Latitude,Longitude,Rating,PriceLevel,ImageURL,ReservationMethod,ReservationPhone,ReservationURL,Tags,Service,Days,StartTimeLocal,EndTimeLocal,WindowName,IsSpecial,SpecialType,MenuID,MealPeriod,SectionID,SectionName,AvailabilityWindow,ItemID,ItemName,ItemDescription,Price,PriceType,Size,OptionGroupIDs,ItemTags,OptionGroupID,OptionGroupName,Required,MinSelections,MaxSelections,OptionName,OptionPriceDelta,OptionDescription,OptionTags,PolicyType,AgeMax,Notes,EventID,EventCategory,EventTitle,StartDate,StartTime,EndTime,Recurrence,ArtistName,EventDescription,Admission,EventPrice,Source
```

---

## 🏷️ Categories & Subcategories

### Main Categories (Use in `Category` column):

**For filtering and page display:**
- `restaurants` - Full-service restaurants
- `coffee-sweets` - Coffee shops, bakeries, ice cream
- `things-to-do` - Activities, attractions, tours
- `nightlife` - Bars, clubs, nightlife venues
- `events` - Event venues, concert halls
- `other` - Everything else (boat launches, parking, shopping, hotels)

### Subcategories (Use in `Cuisine` column):

**Restaurants:**
- Seafood, American, Mexican, Italian, Asian, Pizza, Steakhouse, BBQ, Burgers, Southern, Fine Dining, Casual Dining, Thai, Vietnamese, Japanese, Sushi, Chinese, Indian, Mediterranean, Greek

**Coffee & Sweets:**
- Coffee Shop, Bakery, Ice Cream, Desserts, Donuts, Pastries, Café

**Nightlife:**
- Beach Bar, Sports Bar, Cocktail Bar, Nightclub, Pub, Gastropub, Wine Bar, Beer Garden, Dive Bar, Lounge

**Things to Do:**
- Dolphin Tours, Boat Tours, Watersports, Parasailing, Jet Ski Rentals, Kayak Rentals, Fishing Charters, Mini Golf, Arcade, Go Karts, Zipline, Theme Park, Museum, Aquarium, Zoo

**Other:**
- Boat Launch, Marina, Parking, Shopping, Retail, Hotels, Lodging, Services, Spa, Salon

**You can combine subcategories with bullets:**
Example: `American • Seafood • Steaks`

---

## 📝 RecordType Guide

### 1. BUSINESS (Required - Start Here)

**What it is:** The main business profile with all basic information.

**Required Fields:**
- `RecordType` = `BUSINESS`
- `BusinessID` = unique-slug-id (lowercase, dashes only: `johns-restaurant`)
- `BusinessName` = Display name (`John's Restaurant`)
- `Category` = Main category (see list above)
- `City` = `Gulf Shores` or `Orange Beach`
- `State` = `AL` or `FL`
- `Country` = `USA`
- `Address` = Full street address with zip
- `Phone` = `(251) 555-1234`
- `Description` = Full business description
- `Cuisine` = Subcategory/type (see list above)
- `Latitude` = GPS latitude (`30.2472`)
- `Longitude` = GPS longitude (`-87.6348`)
- `Rating` = Star rating 0-5 (`4.5`)
- `PriceLevel` = `$`, `$$`, `$$$`, or `$$$$`
- `ImageURL` = Main business photo URL

**Optional Fields:**
- `Website`, `Email`, `Facebook`, `Instagram`
- `ReservationMethod` = `phone`, `opentable`, `resy`, `website`
- `ReservationPhone`, `ReservationURL`
- `Tags` = Pipe-separated features: `beachfront|family friendly|outdoor seating`

**Leave blank:** All fields from `Service` through `Source`

---

### 2. HOURS

**What it is:** Operating hours for the business. **Each day gets its own row!**

**Required Fields:**
- `RecordType` = `HOURS`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS record
- `Service` = Type of service (`Lunch+Dinner`, `Brunch`, `Breakfast`, `Bar`)
- `Days` = **Single day:** `Monday`, `Tuesday`, `Wednesday`, etc. (NOT ranges like "Monday-Thursday")
- `StartTimeLocal` = Opening time in 24-hour format (`11:00`)
- `EndTimeLocal` = Closing time in 24-hour format (`21:00`)

**Example:**
```csv
HOURS,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,Lunch+Dinner,Monday,11:00,21:00
HOURS,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,Lunch+Dinner,Tuesday,11:00,21:00
HOURS,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,Lunch+Dinner,Friday,11:00,23:00
HOURS,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,Brunch+Dinner,Sunday,10:00,21:00
```

**Leave blank:** `MailingAddress` through `Source`

---

### 3. SERVICE_WINDOW (Happy Hours & Specials)

**What it is:** Time windows for happy hours, sunset menus, brunch service, daily specials.

**Required Fields:**
- `RecordType` = `SERVICE_WINDOW`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `Days` = When window occurs (`Monday`, `Daily`, `Monday-Friday`)
- `StartTimeLocal` = Window start (`15:00`)
- `EndTimeLocal` = Window end (`18:00`)
- `WindowName` = Display name (`Happy Hour`, `Taco Tuesday`, `Sunset Menu`)
- `IsSpecial` = `TRUE` for price specials, `FALSE` for just service times
- `SpecialType` = Type: `happy_hour`, `daily_special`, `brunch_special`, `sunset_specials`

**Example:**
```csv
SERVICE_WINDOW,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,Monday,15:00,18:00,Happy Hour,TRUE,happy_hour
SERVICE_WINDOW,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,Tuesday,11:00,21:00,Taco Tuesday,TRUE,daily_special
```

**Leave blank:** `MailingAddress` through `ItemTags`, `OptionGroupID` through `Source`

---

### 4. MENU_SECTION

**What it is:** Organize menu items into sections (Appetizers, Seafood, Desserts, etc.).

**Required Fields:**
- `RecordType` = `MENU_SECTION`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `MenuID` = Menu identifier (`menu_lunch`, `menu_dinner`, `menu_cocktails`, `menu_beer`, `menu_wine`)
- `MealPeriod` = Display name (`Lunch`, `Dinner`, `Cocktails & Drinks`)
- `SectionID` = Unique section ID (`sec_appetizers`, `sec_seafood`)
- `SectionName` = Display name (`Appetizers`, `Fresh Seafood`, `Signature Cocktails`)

**Common Section Names:**
- Appetizers, Salads, Soups, Oysters
- Seafood, Steaks & Chops, Entrées, Pasta
- Burgers & Sandwiches, Tacos, Pizza
- Sides, Desserts, Kids Menu
- Signature Cocktails, Frozen Drinks, Wine Selection, Draft Beer

**Example:**
```csv
MENU_SECTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,menu_lunch,Lunch,sec_appetizers,Appetizers
MENU_SECTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,menu_lunch,Lunch,sec_seafood,Fresh Seafood
MENU_SECTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,menu_cocktails,Cocktails,sec_signature,Signature Cocktails
```

**Leave blank:** `MailingAddress` through `ItemTags`, `OptionGroupID` through `Source`

---

### 5. MENU_ITEM (Food & Drinks)

**What it is:** Individual menu items - both food and drinks.

**Required Fields:**
- `RecordType` = `MENU_ITEM`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `MenuID` = Which menu (`menu_lunch`, `menu_dinner`, `menu_cocktails`, `menu_beer`)
- `MealPeriod` = Menu display name
- `SectionName` = Which section (must match a MENU_SECTION)
- `ItemID` = Unique item ID (`item_wings`, `item_margarita`)
- `ItemName` = Display name (`Buffalo Wings`, `Classic Margarita`)
- `ItemDescription` = Full description
- `Price` = Price amount (`12.99`) OR `market` for market price
- `PriceType` = `fixed` or `market`

**Optional Fields:**
- `Size` = Portion size (`Half Dozen`, `Pint`, `Glass`, `8oz`)
- `OptionGroupIDs` = Pipe-separated modifier group IDs (`og_cooking_style|og_side_choice`)
- `ItemTags` = Pipe-separated tags (`appetizer|spicy|shareable`, `cocktail|frozen`)

**Menu Types:**
- **Food:** `menu_lunch`, `menu_dinner`, `menu_brunch`, `menu_breakfast`, `menu_happyhour`
- **Drinks:** `menu_cocktails`, `menu_beer`, `menu_wine`, `menu_spirits`

**Example:**
```csv
MENU_ITEM,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,menu_lunch,Lunch,sec_seafood,Fresh Seafood,,item_fish_tacos,Fish Tacos,Three blackened mahi tacos with slaw and chipotle aioli,15.99,fixed,,,seafood|tacos
MENU_ITEM,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,menu_cocktails,Cocktails,sec_signature,Signature Cocktails,,item_margarita,Classic Margarita,Tequila triple sec fresh lime juice with salt rim,9.99,fixed,,,cocktail
```

**Leave blank:** `MailingAddress` through `AvailabilityWindow`, `OptionGroupID` through `Source`

---

### 6. OPTION_GROUP

**What it is:** Groups of choices for menu items (e.g., "Cooking Style", "Side Choice", "Coffee Size").

**Required Fields:**
- `RecordType` = `OPTION_GROUP`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `OptionGroupID` = Unique ID (`og_cooking_style`, `og_side_choice`, `og_coffee_size`)
- `OptionGroupName` = Display name (`Cooking Style`, `Choose Your Side`)
- `Required` = `TRUE` if customer must select, `FALSE` if optional
- `MinSelections` = Minimum selections required (usually `1`)
- `MaxSelections` = Maximum selections allowed (`1` for single choice, `5` for multi-select)

**Example:**
```csv
OPTION_GROUP,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,og_cooking_style,Cooking Style,TRUE,1,1
OPTION_GROUP,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,og_burger_toppings,Add Burger Toppings,FALSE,0,5
```

**Leave blank:** `MailingAddress` through `OptionGroupIDs`, `OptionName` through `Source`

---

### 7. OPTION

**What it is:** Individual choices within option groups.

**Required Fields:**
- `RecordType` = `OPTION`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `OptionGroupID` = Which group (must match an OPTION_GROUP)
- `OptionName` = Display name (`Grilled`, `French Fries`, `Extra Cheese`)
- `OptionPriceDelta` = Price modifier (`0.00` for no charge, `2.00` for +$2.00, `-5.00` for -$5.00)
- `OptionDescription` = Details about the option

**Optional:**
- `OptionTags` = Tags if applicable

**Example:**
```csv
OPTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,og_cooking_style,,,,,Grilled,0.00,Grilled to perfection
OPTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,og_cooking_style,,,,,Blackened,0.00,Cajun blackened seasoning
OPTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,og_burger_toppings,,,,,Extra Cheese,1.50,Add cheddar cheese
OPTION,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,og_burger_toppings,,,,,Bacon,2.00,Add crispy bacon
```

**Leave blank:** `MailingAddress` through `MaxSelections`, `PolicyType` through `Source`

---

### 8. EVENT

**What it is:** Entertainment events - live music, trivia, concerts, festivals (NOT price specials).

**Required Fields:**
- `RecordType` = `EVENT`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `EventID` = Unique event ID (`ev_live_music_fri`, `ev_concert_july4`)
- `EventCategory` = Type (`Live Music`, `Trivia`, `Karaoke`, `Concert`, `Festival`)
- `EventTitle` = Display name (`Live Jazz Friday`, `4th of July Beach Bash`)
- `StartDate` = Specific date **YYYY-MM-DD** (`2026-07-04`) OR leave blank for recurring
- `StartTime` = Event start in 24-hour format (`19:00`)
- `EndTime` = Event end in 24-hour format (`22:00`)
- `Recurrence` = `Weekly (Friday)`, `Weekly (Wednesday)`, `Daily`, `Monthly`, `One-time`
- `EventDescription` = Full event details
- `Admission` = `Free` or admission details

**Optional:**
- `ArtistName` = Performer/band name
- `EventPrice` = Cover charge amount if any (`10.00`)

**Date Format Examples:**
- Specific event on July 4th 2026: `StartDate` = `2026-07-04`, `Recurrence` = `One-time`
- Weekly Friday event: `StartDate` = blank, `Recurrence` = `Weekly (Friday)`
- Every Monday: `StartDate` = blank, `Recurrence` = `Weekly (Monday)`

**Example:**
```csv
EVENT,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,ev_live_fri,Live Music,Live Jazz Friday,2026-02-21,19:00,22:00,Weekly (Friday),The Jazz Trio,Live jazz on our beachfront patio,Free,
EVENT,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,ev_july4,Concert,4th of July Concert,2026-07-04,18:00,23:00,One-time,Beach Band,Special Independence Day celebration with fireworks,Free,
EVENT,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,ev_trivia_wed,Trivia,Trivia Night,2026-02-19,20:00,22:00,Weekly (Wednesday),,Weekly trivia with prizes,Free,
```

**Leave blank:** `MailingAddress` through `OptionTags`, `PolicyType` through `Notes`, `Source`

---

### 9. POLICY

**What it is:** Business policies (age restrictions, dress codes, parking, etc.).

**Required Fields:**
- `RecordType` = `POLICY`
- `BusinessID`, `BusinessName`, `City`, `State`, `Country` = Must match BUSINESS
- `PolicyType` = Type of policy (`age_restriction`, `dress_code`, `pet_policy`, `parking`, `cancellation_policy`, `wifi`, `accessibility`)
- `Notes` = Policy details

**Optional:**
- `AgeMax` = Maximum age if age restriction policy

**Example:**
```csv
POLICY,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,age_restriction,12,Kids menu for ages 12 and under
POLICY,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,dress_code,,Casual beachwear welcome. No shirt no shoes no service.
POLICY,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,pet_policy,,Leashed pets welcome on outdoor patio.
POLICY,johns-restaurant,John's Restaurant,Gulf Shores,AL,USA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,parking,,Free parking lot on-site.
```

**Leave blank:** `MailingAddress` through `OptionTags`, `OptionGroupID` through `EventPrice`, `Source`

---

## 🗺️ How to Get GPS Coordinates

**Option 1: Google Maps (Easiest)**
1. Go to Google Maps
2. Right-click on the business location
3. Click the coordinates at the top (they'll copy automatically)
4. Paste into your CSV - format is: `30.2472,-87.6348`
5. First number is Latitude, second is Longitude

**Option 2: Address Lookup**
1. Use https://www.latlong.net/
2. Enter the business address
3. Copy the Latitude and Longitude values

---

## 📤 How to Import Your CSV Files

### Step 1: Prepare Your Files
- Use the universal templates (1-11) OR category examples (12-17) as starting points
- Fill in your business data
- Save as CSV format

### Step 2: Import via Admin Dashboard
1. Go to: `http://localhost:8083/admin-dashboard.html`
2. Click **"GCR Businesses"** tab
3. Click **"Import CSV"** button
4. Select your CSV file
5. Choose import mode:
   - **REPLACE** - Delete all existing data and replace with CSV
   - **MERGE** - Add new records, skip duplicates (matches on BusinessID)
   - **UPDATE** - Update existing records, add new ones (matches on BusinessID)
6. Click Import
7. Data will sync to Supabase

### Import Order (Recommended):
1. Import Business Profiles first (creates the businesses)
2. Import Hours (adds operating hours)
3. Import Happy Hours & Specials (adds time windows)
4. Import Menu Sections (creates menu structure)
5. Import Food Items (adds food to menu)
6. Import Drink Items (adds drinks to menu)
7. Import Option Groups & Options (adds modifiers)
8. Import Events (adds entertainment)
9. Import Policies (adds business policies)

**OR:** Import one complete example file with all record types together!

---

## 💡 Tips & Best Practices

### 1. Start Simple
- Just fill in BUSINESS record with basic info
- Add HOURS records for operating hours
- Add MENU_ITEM records for your top items
- Everything else is optional!

### 2. Use the Examples
- Open the `EXAMPLE-*.csv` files to see complete working examples
- Copy the format exactly
- Modify the data for your business

### 3. Excel/Google Sheets Tips
- Each column is properly separated - no pipe/tilde separators needed!
- Leave cells blank instead of typing "blank" or "empty"
- For text with commas, Excel will auto-quote it (that's fine)
- Save as CSV when done

### 4. Testing
- Test with ONE business first
- Import it and verify it displays correctly on the site
- Once it works, add more businesses

### 5. BusinessID Naming
- Use lowercase letters and dashes only
- Make it descriptive: `the-coastal-grill` not `tcg` or `restaurant1`
- Must be unique across all businesses
- This becomes part of the URL: `/business/the-coastal-grill`

### 6. Tags Best Practices
Use pipe `|` to separate tags (no spaces around pipes):
```
Good: beachfront|family friendly|outdoor seating|live music
Bad: beachfront | family friendly | outdoor seating
```

Common useful tags:
- `beachfront`, `waterfront`, `ocean view`
- `family friendly`, `kids menu`, `pet friendly`
- `outdoor seating`, `patio`, `rooftop`
- `live music`, `happy hour`, `dancing`
- `full bar`, `craft cocktails`, `local beer`
- `vegan options`, `gluten free`, `vegetarian`
- `takeout`, `delivery`, `catering`
- `free wifi`, `reservations accepted`

### 7. Images
Use high-quality images (recommended 800-1200px wide):
- Unsplash: `https://images.unsplash.com/photo-XXXXX?w=800`
- Your own server: `https://yourdomain.com/images/business.jpg`
- Make sure images are web-accessible (public URLs)

---

## ❓ Common Questions

### Q: Do I need to fill in ALL 69 columns?
**A:** No! Most columns are blank for most record types. Each RecordType only uses specific columns. See the examples.

### Q: Can I have multiple menus (Lunch, Dinner, Cocktails)?
**A:** Yes! Use different `MenuID` values:
- `menu_lunch` for lunch menu
- `menu_dinner` for dinner menu
- `menu_cocktails` for cocktails
- `menu_beer` for beer menu
- `menu_wine` for wine list

### Q: How do I separate food and drinks?
**A:** Use file `6-FOOD-ITEMS.csv` for food (MenuID = menu_lunch, menu_dinner) and file `7-DRINK-ITEMS.csv` for drinks (MenuID = menu_cocktails, menu_beer, menu_wine).

### Q: What's the difference between Happy Hours and Specials?
**A:** Both use SERVICE_WINDOW records, but:
- **Happy Hours** = Drink/food discounts during specific times (daily 3-6pm)
- **Specials** = Daily deals like Taco Tuesday, Wing Wednesday, Early Bird specials

### Q: Can I upload just one category at a time?
**A:** Yes! The `Category` field determines which page the business appears on:
- Fill out CSV with only `restaurants` category businesses → Upload
- Later, fill out CSV with only `things-to-do` category businesses → Upload
- The system will add new businesses and keep existing ones (if using MERGE mode)

### Q: What if I make a mistake?
**A:** Just fix the CSV and re-import using UPDATE mode. It will update existing records that match the BusinessID.

### Q: How do I delete a business?
**A:** Currently you need to delete from the admin dashboard or Supabase directly. CSV import only adds/updates.

---

## 📞 Support

Questions or issues?
- Check the example CSV files in this folder
- Review this guide
- Contact support: [Add your support contact]

---

## 🎯 Quick Reference

### RecordTypes Summary:
- `BUSINESS` - Business profile (Required first)
- `HOURS` - Operating hours (each day separate)
- `SERVICE_WINDOW` - Happy hours & specials
- `MENU_SECTION` - Menu organization
- `MENU_ITEM` - Food & drink items
- `OPTION_GROUP` - Modifier groups
- `OPTION` - Individual modifier choices
- `EVENT` - Entertainment & activities
- `POLICY` - Business policies

### Time Format:
- 24-hour format: `09:00`, `14:30`, `21:00`, `23:59`

### Date Format:
- YYYY-MM-DD: `2026-07-04`, `2026-12-31`

### Price Format:
- Numbers with 2 decimals: `12.99`, `0.75`
- OR `market` for market price

### Boolean Values:
- `TRUE` or `FALSE` (all caps)

---

**Happy importing! 🎉**
