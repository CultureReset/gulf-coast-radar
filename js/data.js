// CyberCheck Inc - Business Data
// Orange Beach & Gulf Shores Complete Directory

const businessData = [
  {
    id: "the-hangout",
    name: "The Hangout",
    category: "restaurants",
    cuisine: "American • Seafood • Burgers",
    location: "Gulf Shores",
    address: "101 E Beach Blvd, Gulf Shores, AL 36542",
    coordinates: { lat: 30.2472, lng: -87.6348 },
    phone: "(251) 948-3030",
    website: "https://www.thehangoutal.com",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Beach Bar", "Live Music", "Family Friendly", "Outdoor Seating", "Happy Hour"],
    description: "Family-friendly beach bar and restaurant with live music, fresh seafood, burgers, and a fun atmosphere right on the beach.",
    hours: "Sun-Thu 11am-9pm; Fri-Sat 11am-11pm",
    reservation: {
      method: 'phone', // Primary method
      phone: '(251) 948-3030'
    },
    happyHour: "Daily 3 PM–6 PM",
    happyHourSpecials: [
      { name: "$3 Off Appetizers", category: "Food Specials", description: "$3 off select appetizers during happy hour" },
      { name: "$2 Off Draft Beer", category: "Beer Specials", description: "$2 off all draft beers" },
      { name: "$4 House Wines", category: "Wine Specials", description: "House red and white wines" },
      { name: "$5 Well Drinks", category: "Cocktail Specials", description: "All well liquor cocktails" }
    ],
    specials: [
      {
        name: "🌮 Taco Tuesday",
        description: "$2 tacos all day! Choice of fish, shrimp, or chicken.",
        day: "Every Tuesday",
        time: "All Day",
        schedule: "Every Tuesday All Day"
      }
    ],
    events: [
      { name: "🎸 Live Music Every Weekend", description: "Live bands and acoustic performances on the beach. Check website for schedule.", day: "Friday–Sunday", time: "6:00 PM – 10:00 PM" }
    ],
    menu: [
      { name: "Hangout Burger", price: "$14.99", category: "Burgers", description: "½ lb Angus beef, lettuce, tomato, onion, pickles" },
      { name: "Blackened Mahi Tacos", price: "$15.99", category: "Seafood", description: "3 tacos with cabbage slaw and chipotle mayo" },
      { name: "Fried Shrimp Basket", price: "$16.99", category: "Seafood", description: "Hand-breaded shrimp with fries and coleslaw" },
      { name: "Buffalo Chicken Sandwich", price: "$13.99", category: "Sandwiches", description: "Crispy chicken tossed in buffalo sauce" },
      { name: "Beach Nachos", price: "$12.99", category: "Appetizers", description: "Loaded nachos with cheese, jalapeños, sour cream" },
      { name: "Caesar Salad", price: "$11.99", category: "Salads", description: "Romaine, parmesan, croutons, caesar dressing" }
    ],
    drinks: [
      { name: "Bushwacker", price: "$10.99", category: "Frozen Drinks", description: "Famous frozen cocktail with rum and Kahlua" },
      { name: "Margarita", price: "$9.99", category: "Cocktails", description: "Classic lime margarita on the rocks" },
      { name: "Draft Beer", price: "$5.99", category: "Beer", description: "Rotating selection of local and domestic" },
      { name: "Rum Punch", price: "$10.99", category: "Cocktails", description: "Tropical rum punch" }
    ]
  },
  {
    id: "the-gulf",
    name: "The Gulf",
    category: "restaurants",
    cuisine: "Seafood • Steaks • Fine Dining",
    location: "Orange Beach",
    address: "27500 Perdido Beach Blvd, Orange Beach, AL 36561",
    coordinates: { lat: 30.2765, lng: -87.5577 },
    phone: "(251) 974-1100",
    website: "https://thegulfal.com",
    image: "https://picsum.photos/seed/the-gulf/400/300",
    rating: 4.8,
    priceLevel: "$$$",
    tags: ["Fine Dining", "Gulf Views", "Romantic", "Craft Cocktails"],
    description: "Upscale Gulf Coast dining featuring fresh seafood, premium steaks, and stunning views of the Gulf of Mexico.",
    hours: "Mon-Sun 5pm-10pm",
    reservation: {
      method: 'opentable',
      openTableId: '123456', // Example OpenTable Restaurant ID
      phone: '(251) 974-1100'
    },
    menu: [
      { name: "Grilled Redfish", price: "$32.99", category: "Seafood", description: "Gulf redfish with lemon butter and seasonal vegetables" },
      { name: "Filet Mignon", price: "$42.99", category: "Steaks", description: "8oz center-cut filet with red wine reduction" },
      { name: "Lobster Tail", price: "$48.99", category: "Seafood", description: "Broiled Maine lobster tail with drawn butter" },
      { name: "Shrimp & Grits", price: "$28.99", category: "Southern", description: "Gulf shrimp over creamy stone-ground grits" },
      { name: "Oysters Rockefeller", price: "$18.99", category: "Appetizers", description: "Baked oysters with spinach and parmesan" },
      { name: "Crab Cakes", price: "$22.99", category: "Appetizers", description: "Pan-seared jumbo lump crab cakes" }
    ],
    drinks: [
      { name: "Gulf Breeze Martini", price: "$14.99", category: "Cocktails", description: "Vodka, blue curaçao, grapefruit juice" },
      { name: "Old Fashioned", price: "$13.99", category: "Whiskey", description: "Classic bourbon cocktail" },
      { name: "Chardonnay", price: "$12.99", category: "Wine", description: "California chardonnay by the glass" },
      { name: "Craft Beer Flight", price: "$15.99", category: "Beer", description: "Sample 4 local craft beers" }
    ]
  },
  {
    id: "cobalt-restaurant",
    name: "Cobalt Restaurant",
    category: "restaurants",
    cuisine: "Coastal • Seafood • Contemporary",
    location: "Orange Beach",
    address: "27842 Canal Rd, Orange Beach, AL 36561",
    coordinates: { lat: 30.2789, lng: -87.5521 },
    phone: "(251) 981-9891",
    website: "https://cobalttherestaurant.com",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    rating: 4.7,
    priceLevel: "$$$",
    tags: ["Waterfront", "Craft Cocktails", "Award-Winning", "Happy Hour"],
    description: "Award-winning waterfront dining with Southern coastal cuisine and innovative craft cocktails.",
    hours: "Tue-Sun 4pm-9pm; Closed Mon",
    reservation: {
      method: 'phone',
      phone: '(251) 981-9891',
      email: 'reservations@cobalttherestaurant.com'
    },
    happyHour: "Tue–Fri 4 PM–6 PM",
    happyHourSpecials: [
      { name: "$5 Select Cocktails", category: "Cocktail Specials", description: "House margaritas, martinis, and mojitos" },
      { name: "$3 Draft Beer", category: "Beer Specials", description: "All draft beers" },
      { name: "$6 Wine by Glass", category: "Wine Specials", description: "Select wines by the glass" },
      { name: "$8 Appetizers", category: "Food Specials", description: "Crab dip, tuna tartare, and more" }
    ],
    specials: [
      {
        name: "🍷 Wine Down Wednesday",
        description: "50% off all bottles of wine. Perfect for date night!",
        day: "Every Wednesday",
        time: "4:00 PM – 9:00 PM",
        schedule: "Every Wednesday 4:00 PM – 9:00 PM"
      },
      {
        name: "🌅 Sunset Menu",
        description: "Special early dinner pricing on select entrees and appetizers. Enjoy waterfront dining during golden hour!",
        day: "Daily",
        time: "4:00 PM – 6:00 PM",
        schedule: "Daily 4:00 PM – 6:00 PM",
        price: "Select entrees starting at $19.99"
      }
    ],
    events: [
      {
        name: "🎶 Live Jazz Brunch",
        description: "Sunday brunch with live jazz on the waterfront. Reservations recommended.",
        day: "Every Sunday",
        time: "11:00 AM – 2:00 PM"
      }
    ],
    menu: [
      { name: "Crab Dip", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Hot crab dip with crackers and vegetables" },
      { name: "Tuna Tartare", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Fresh yellowfin tuna with avocado and ginger" },
      { name: "Coconut Shrimp", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Crispy coconut-crusted shrimp with orange marmalade" },
      { name: "Ahi Tuna Nachos", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Wonton chips topped with seared tuna and wasabi aioli" },
      { name: "Buffalo Cauliflower", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Crispy cauliflower tossed in buffalo sauce with ranch" },
      { name: "Oysters Rockefeller", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Baked oysters with spinach, herbs, and parmesan" },
      { name: "Calamari Fritti", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Crispy fried calamari with marinara and lemon aioli" },
      { name: "Pork Belly Sliders", price: "$8.00", category: "Happy Hour", type: "Sliders", description: "Three mini sliders with braised pork belly and pickled slaw" },
      { name: "Fish Tacos", price: "$8.00", category: "Happy Hour", type: "Tacos", description: "Two blackened fish tacos with cabbage slaw and chipotle crema" },
      { name: "Lobster Mac & Cheese Bites", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Crispy fried lobster mac and cheese balls" },
      { name: "Bruschetta Trio", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Three varieties: tomato basil, mushroom truffle, and whipped feta" },
      { name: "Wings", price: "$8.00", category: "Happy Hour", type: "Appetizers", description: "Six wings with choice of buffalo, BBQ, or teriyaki sauce" },
      { name: "Crab Claws", price: "$18.99", category: "DINNER", type: "Appetizers", description: "Steamed blue crab claws with drawn butter" },
      { name: "Grouper Pontchartrain", price: "$34.99", category: "DINNER", type: "Seafood", description: "Grilled grouper with crabmeat and béarnaise" },
      { name: "Rack of Lamb", price: "$38.99", category: "DINNER", type: "Entrees", description: "Herb-crusted lamb with mint chimichurri" },
      { name: "Shrimp & Scallops", price: "$36.99", category: "DINNER", type: "Seafood", description: "Sautéed shrimp and scallops over risotto" },
      { name: "Tuna Tartare", price: "$16.99", category: "DINNER", type: "Appetizers", description: "Fresh yellowfin tuna with avocado and ginger" },
      { name: "Wedge Salad", price: "$12.99", category: "DINNER", type: "Salads", description: "Iceberg wedge with bacon and blue cheese" },
      { name: "Filet Mignon", price: "$42.99", category: "DINNER", type: "Steaks", description: "8oz filet with garlic mashed potatoes and asparagus" },
      { name: "Chilean Sea Bass", price: "$39.99", category: "DINNER", type: "Seafood", description: "Pan-seared sea bass with lemon beurre blanc" },
      { name: "Lobster Tail", price: "$44.99", category: "DINNER", type: "Seafood", description: "Broiled Maine lobster tail with drawn butter" }
    ],
    drinks: [
      { name: "House Margarita", price: "$5.00", category: "Happy Hour", type: "Margaritas", description: "Classic margarita with lime and salt rim" },
      { name: "House Mojito", price: "$5.00", category: "Happy Hour", type: "Cocktails", description: "Fresh mint, rum, lime, and soda" },
      { name: "House Martini", price: "$5.00", category: "Happy Hour", type: "Martinis", description: "Classic vodka martini with olives or lemon twist" },
      { name: "Draft Beer", price: "$3.00", category: "Happy Hour", type: "Beer", description: "All draft beers on tap" },
      { name: "House Wine", price: "$6.00", category: "Happy Hour", type: "Wine", description: "Select red, white, or rosé by the glass" },
      { name: "Well Drinks", price: "$5.00", category: "Happy Hour", type: "Cocktails", description: "Rum, vodka, gin, or whiskey with mixer" },
      { name: "Cobalt Margarita", price: "$11.99", category: "DINNER", type: "Margaritas", description: "House margarita with blue curaçao" },
      { name: "Cucumber Mojito", price: "$12.99", category: "DINNER", type: "Cocktails", description: "Fresh cucumber, mint, rum, lime" },
      { name: "Watermelon Martini", price: "$13.99", category: "DINNER", type: "Martinis", description: "Fresh watermelon vodka martini" },
      { name: "Local IPA", price: "$6.99", category: "DINNER", type: "Beer", description: "Alabama craft IPA" },
      { name: "Cabernet Sauvignon", price: "$9.99", category: "DINNER", type: "Wine", description: "Full-bodied red wine" },
      { name: "Chardonnay", price: "$9.99", category: "DINNER", type: "Wine", description: "Crisp white wine" }
    ]
  },
  {
    id: "tacky-jacks",
    name: "Tacky Jacks",
    category: "restaurants",
    cuisine: "Seafood • Casual • Waterfront",
    location: "Orange Beach",
    address: "27206 Safe Harbor Dr, Orange Beach, AL 36561",
    coordinates: { lat: 30.2904, lng: -87.5482 },
    phone: "(251) 981-4144",
    website: "https://tackyjacks.com",
    image: "https://picsum.photos/seed/tacky-jacks/400/300",
    rating: 4.3,
    priceLevel: "$$",
    tags: ["Waterfront", "Live Music", "Casual", "Outdoor Seating"],
    description: "Casual waterfront restaurant serving fresh seafood, burgers, and cold drinks with live music.",
    hours: "Sun-Thu 11am-9pm; Fri-Sat 11am-10pm",
    menu: [
      { name: "Fried Oyster Basket", price: "$17.99", category: "Seafood", description: "Hand-breaded oysters with fries" },
      { name: "Fish Tacos", price: "$14.99", category: "Tacos", description: "Grilled or fried fish with slaw" },
      { name: "Po' Boy Sandwich", price: "$15.99", category: "Sandwiches", description: "Shrimp or oyster po' boy with remoulade" },
      { name: "Grouper Sandwich", price: "$16.99", category: "Sandwiches", description: "Grilled or blackened grouper" },
      { name: "Steamed Shrimp", price: "$19.99", category: "Seafood", description: "1 lb steamed gulf shrimp" },
      { name: "Crab Dip", price: "$13.99", category: "Appetizers", description: "Hot crab dip with crackers" }
    ],
    drinks: [
      { name: "Painkillers", price: "$9.99", category: "Frozen Drinks", description: "Rum, coconut, pineapple, orange" },
      { name: "Bloody Mary", price: "$8.99", category: "Cocktails", description: "Classic vodka bloody mary" },
      { name: "Bucket of Beer", price: "$19.99", category: "Beer", description: "5 domestic beers on ice" },
      { name: "Rum Runner", price: "$10.99", category: "Frozen Drinks", description: "Tropical frozen rum drink" }
    ]
  },
  {
    id: "the-wharf",
    name: "The Wharf",
    category: "shopping",
    location: "Orange Beach",
    address: "4851 Wharf Pkwy, Orange Beach, AL 36561",
    phone: "(251) 224-1000",
    website: "https://alwharf.com",
    image: "https://picsum.photos/seed/the-wharf/400/300",
    rating: 4.6,
    priceLevel: "Varies",
    tags: ["Shopping", "Dining", "Entertainment", "Amphitheater"],
    description: "Premier shopping, dining, and entertainment destination with boutiques, restaurants, and an amphitheater.",
    hours: "Mon-Sun 10am-9pm",
    menu: [],
    drinks: []
  },
  {
    id: "adventure-island",
    name: "Adventure Island",
    category: "activities",
    location: "Gulf Shores",
    address: "24559 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 981-4034",
    website: "https://adventureislandgulfshores.com",
    image: "https://picsum.photos/seed/adventure-island/400/300",
    rating: 4.4,
    priceLevel: "$$",
    tags: ["Family Fun", "Mini Golf", "Go-Karts", "Arcade"],
    description: "Fun-filled amusement park featuring mini golf, go-karts, arcade games, and family entertainment.",
    hours: "Mon-Sun 10am-10pm",
    menu: [],
    drinks: []
  },
  {
    id: "gulf-state-park",
    name: "Gulf State Park",
    category: "activities",
    location: "Gulf Shores",
    address: "20115 AL-135, Gulf Shores, AL 36542",
    phone: "(251) 948-7275",
    website: "https://www.alapark.com/gulf-state-park",
    image: "https://picsum.photos/seed/gulf-state-park/400/300",
    rating: 4.8,
    priceLevel: "$",
    tags: ["Nature", "Beach", "Hiking", "Fishing"],
    description: "Beautiful state park with beaches, hiking trails, fishing pier, and nature center.",
    hours: "Daily 6am-10pm",
    menu: [],
    drinks: []
  },
  {
    id: "beach-club-resort",
    name: "The Beach Club Resort & Spa",
    category: "hotels",
    location: "Gulf Shores",
    address: "925 Beach Club Trail, Gulf Shores, AL 36542",
    phone: "(251) 224-2424",
    website: "https://www.beachclubresort.com",
    image: "https://picsum.photos/seed/beach-club-resort/400/300",
    rating: 4.7,
    priceLevel: "$$$",
    tags: ["Luxury", "Spa", "Beachfront", "Pool"],
    description: "Luxury beachfront resort with full-service spa, multiple pools, and elegant accommodations.",
    hours: "Check-in 4pm; Check-out 11am",
    menu: [],
    drinks: []
  },
  {
    id: "perdido-beach-resort",
    name: "Perdido Beach Resort",
    category: "hotels",
    location: "Orange Beach",
    address: "27200 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 981-9811",
    website: "https://www.perdidobeachresort.com",
    image: "https://picsum.photos/seed/perdido-beach-resort/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Beachfront", "Restaurant", "Pool", "Family Friendly"],
    description: "Full-service beachfront resort with restaurants, pool, and spacious rooms with Gulf views.",
    hours: "Check-in 4pm; Check-out 11am",
    menu: [],
    drinks: []
  },
  {
    id: "orange-beach-museum",
    name: "Orange Beach Indian & Sea Museum",
    category: "activities",
    location: "Orange Beach",
    address: "25850 John M Snook Dr, Orange Beach, AL 36561",
    phone: "(251) 981-8545",
    website: "https://orangebeachal.gov/museum",
    image: "https://picsum.photos/seed/orange-beach-museum/400/300",
    rating: 4.3,
    priceLevel: "$",
    tags: ["Museum", "History", "Educational", "Indoor"],
    description: "Local history museum showcasing Native American artifacts and maritime heritage.",
    hours: "Tue-Sat 9am-5pm; Closed Sun-Mon",
    menu: [],
    drinks: []
  },
  {
    id: "carmelos",
    name: "Ristorante Carmelo",
    category: "restaurants",
    cuisine: "Italian • Fine Dining",
    location: "Orange Beach",
    address: "25747 Perdido Beach Blvd Suite 1, Orange Beach, AL",
    phone: "(251) 200-4375",
    website: "https://carmeloitalian.com",
    image: "https://picsum.photos/seed/carmelos/400/300",
    rating: 4.5,
    priceLevel: "$$$",
    tags: ["Fine Dining", "Italian", "Romantic", "Wine Selection"],
    description: "Italian dining in Orange Beach",
    hours: "Monday — Sunday 3pm — 10pm",
    menu: [
      { name: "Bruschette", price: "$14/$18", category: "Appetizers", description: "Country bread topped with tomato, mozzarella, and fresh basil or saut\u00e9ed wild mushrooms" },
      { name: "Scampi", price: "$20", category: "Appetizers", description: "Shrimp saut\u00e9ed with butter, garlic, and white wine. Served over crostini" },
      { name: "Cozze", price: "$18", category: "Appetizers", description: "Native mussels saut\u00e9ed with fresh garlic, extra virgin olive oil, and white wine. Served with crostini" },
      { name: "Carrozza", price: "$16", category: "Appetizers", description: "Lightly breaded, pan fried mozzarella stuffed with prosciutto. Served with marinara sauce" },
      { name: "Caprese", price: "$16", category: "Appetizers", description: "Beef steak tomato, mozzarella di bufala, fresh basil, aged balsamic vinegar, sea salt, olive oil" },
      { name: "Calamari", price: "$16", category: "Appetizers", description: "Fried calamari served with marinara dipping sauce" },
      { name: "Italian Meat & Cheese Platter", price: "$34", category: "Appetizers", description: "Cured meats, gourmet cheese, assorted fruit, hot crostini bread" },
      { name: "Shrimp Oreganata", price: "$18", category: "Appetizers", description: "3 crab-stuffed prawns with lump crab, served with white wine sauce" },
      { name: "Stuffed Meatballs", price: "$12", category: "Appetizers", description: "Veal, pork, and beef meatballs stuffed with mozzarella & provolone in red gravy" },
      { name: "Carpaccio", price: "$16", category: "Appetizers", description: "CAB beef tenderloin with arugula, lemon, capers, hot sauce, garlic aioli & Parmesan" },
      { name: "Zuppa del Giorno", price: "$11", category: "Soups", description: "Prepared fresh daily with market fresh ingredients" },
      { name: "Minestra di Fagioli", price: "$9", category: "Soups", description: "Rustic country soup made from the stock of prosciutto, beans & pasta" },
      { name: "Insalata Carmelo", price: "$16", category: "Salads", description: "Mix of greens, radicchio, arugula, romaine, endive, grape tomatoes, pecorino, imported dry salami, house dressing" },
      { name: "Caesar", price: "$12", category: "Salads", description: "Romaine lettuce, Caesar dressing, croutons, shaved Parmigiano" },
      { name: "Insalata Mista", price: "$9", category: "Salads", description: "Seasonal greens, tomato, red onion, Carmelo\u2019s house dressing" },
      { name: "Scaloppine Abruzzese", price: "$26", category: "Pasta Dishes", description: "Veal and chicken saut\u00e9ed with butter, white wine, broccoli, cheese, penne rigate" },
      { name: "Brigante di Penne", price: "$21", category: "Pasta Dishes", description: "Penne rigate in a light cream, vodka and tomato sauce" },
      { name: "Maccheroni Amatriciana", price: "$26", category: "Pasta Dishes", description: "House made spaghetti chitarra with pancetta, pecorino, red pepper flakes, onion, tomato sauce" },
      { name: "Carbonara", price: "$25", category: "Pasta Dishes", description: "Spaghetti with bacon, onion, egg yolk, grated Grano Padano" },
      { name: "Maielando", price: "$27", category: "Pasta Dishes", description: "Fusilli in a cream sauce with Bel Paese and Pecorino cheeses, black truffle cream" },
      { name: "Ammazzafame", price: "$25", category: "Pasta Dishes", description: "Penne rigate, porcini mushrooms, sausage, broccoli, sun-dried tomato, capers" },
      { name: "Quattro Formaggi", price: "$22", category: "Pasta Dishes", description: "Pappardelle in a cheese sauce of Romano, Mozzarella, Bel Paese, Parmigiano" },
      { name: "Lasagna Carmelo", price: "$26", category: "Pasta Dishes", description: "Pasta layered with egg, veal, beef, pork, mozzarella, ricotta, tomato sauce" },
      { name: "Gnocchi Abruzzese", price: "$25", category: "Pasta Dishes", description: "Tomato sauce, fresh basil, pecorino" },
      { name: "Mare e Monte", price: "$24", category: "Pasta Dishes", description: "Linguine with clams and mushrooms in tomato sauce" },
      { name: "Tortellini Pesto", price: "$28", category: "Pasta Dishes", description: "Tortellini, pesto cream sauce, pine nuts, basil, Parmigiano, olive oil" },
      { name: "Chitarra al Tartufo", price: "$24", category: "Pasta Dishes", description: "Chitarra-cut pasta with wild mushrooms, sausage, white truffle oil" },
      { name: "Spaghetti E Polpette", price: "$25", category: "Pasta Dishes", description: "Tomato sauce with veal, pork, beef meatballs" },
      { name: "Gnocchi Spezzatino", price: "$22", category: "Pasta Dishes", description: "Gnocchi saut\u00e9ed with capers, sun-dried tomatoes, mushrooms, veal" },
      { name: "Melanzane Parmigiana", price: "", category: "Pasta Dishes", description: "Baked eggplant, tomato sauce, mozzarella cheese" },
      { name: "Veal Piccata", price: "$30", category: "Veal Dishes", description: "Lightly dusted veal saut\u00e9ed with butter, capers, shallots, white wine, lemon juice, over angel hair pasta" },
      { name: "Braciolettine", price: "$29", category: "Veal Dishes", description: "Veal rolled with prosciutto, mozzarella, mushrooms, citrus white wine sauce, over angel hair pasta" },
      { name: "Vitello Marsala", price: "$30", category: "Veal Dishes", description: "Veal, saut\u00e9ed mushrooms, marsala wine sauce, linguine" },
      { name: "Vitello Parmigiana", price: "$28", category: "Veal Dishes", description: "Breaded veal cutlet, tomato sauce, mozzarella cheese" },
      { name: "Carrozzella", price: "$28", category: "Veal Dishes", description: "Veal topped with mozzarella, fried sage, white wine sauce" },
      { name: "Lombata di Manzo", price: "$35", category: "Grilled Steaks", description: "Grilled New York Sirloin topped with dolce gorgonzola sauce, linguine" },
      { name: "Bistecca alla Arrabiata", price: "$38", category: "Grilled Steaks", description: "Grilled New York Sirloin steak, spicy marinara sauce, mushrooms, capers, anchovies, olives, linguine" },
      { name: "Pollo Carmelo", price: "$28", category: "Chicken Dishes", description: "Boneless chicken breast saut\u00e9ed with artichoke hearts, mushrooms, lemon sauce" },
      { name: "Pollo Marsala", price: "$26", category: "Chicken Dishes", description: "Chicken breast, saut\u00e9ed mushrooms, marsala wine sauce, linguine" },
      { name: "Saggittario", price: "$28", category: "Chicken Dishes", description: "Boneless chicken, asparagus, olives, artichoke, anchovy, roasted tomato, house salad" },
      { name: "Pollo Francesco", price: "$29", category: "Chicken Dishes", description: "Boneless chicken breast, prosciutto, mozzarella, spicy marinara, mushrooms, black olives" },
      { name: "Pollo Focaccia", price: "$28", category: "Chicken Dishes", description: "Boneless chicken breast, prosciutto, mozzarella, olives, sun-dried tomatoes, fried artichokes, white wine sauce" },
      { name: "Pollo Parmigiana", price: "$27", category: "Chicken Dishes", description: "Baked chicken cutlet, tomato sauce, mozzarella cheese" },
      { name: "Marco Polo", price: "$44", category: "Seafood Dishes", description: "Shrimp, clams, mussels, filet of sole, calamari, scallops, marinara sauce, pappardelle" },
      { name: "Scampi Francavillese", price: "$30", category: "Seafood Dishes", description: "Shrimp saut\u00e9ed with butter, garlic, white wine sauce, spaghetti" },
      { name: "Salmone", price: "$31", category: "Seafood Dishes", description: "Wild salmon, grilled, Italian white bean salad, asparagus" },
      { name: "Sogliola Pescarese", price: "$32", category: "Seafood Dishes", description: "Filet of sole, egg-dipped, fried with lemon, limoncello, asparagus" },
      { name: "Guazzetto di Mare", price: "$30", category: "Seafood Dishes", description: "Calamari, baby clams, shrimp, filet of sole, tomato sauce, pappardelle" },
      { name: "Tiramisu", price: "", category: "Desserts", description: "Savoiardi cookies, whipped eggs, mascarpone, espresso, cocoa powder" },
      { name: "Panna Cotta", price: "", category: "Desserts", description: "Cooked cream, sugar, seasonal macerated berries" },
      { name: "Lemon Ricotta Cake", price: "", category: "Desserts", description: "Limoncello cream cheese frosting, blueberry curd" },
      { name: "Dolce del Giorno", price: "", category: "Desserts", description: "Chef\u2019s dessert selection" },
      { name: "Cannoli Siciliana", price: "", category: "Desserts", description: "Pastry shell, ricotta cheese, chocolate, vanilla, pistachios, powdered sugar, cinnamon" },
      { name: "Gelato & Sorbetto", price: "", category: "Desserts", description: "Rotating flavors" },
      { name: "Torta Savoia", price: "", category: "Desserts", description: "Three layers of chocolate mousse between chocolate cake, ganache, mocha rum sauce" }
    ],
    drinks: [

    ]
  },
  {
    id: "mikees-seafood",
    name: "Mikee's Seafood",
    category: "restaurants",
    cuisine: "Seafood • Cajun • Southern",
    location: "Orange Beach",
    address: "251 Gulf Shores Pkwy, Gulf Shores, AL 36542",
    phone: "(251) 948-6452",
    website: "https://mikeesseafood.com",
    image: "https://picsum.photos/seed/mikees-seafood/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Seafood", "Cajun", "Family Friendly", "Local Favorite"],
    description: "Seafood dining in Orange Beach",
    hours: "",


    menu: [
      { name: "Fresh Shucked Oysters", price: "1/2 DZ \u2013 $12.99, 1 DZ \u2013 $19.99", category: "Oysters", description: "" },
      { name: "Steamed Oysters", price: "1/2 DZ \u2013 $13.99, 1 DZ \u2013 $20.99", category: "Oysters", description: "" },
      { name: "Parmesan Oysters", price: "1/2 DZ \u2013 $15.99, 1 DZ \u2013 $25.99", category: "Oysters", description: "Parmesan seasoning and butter" },
      { name: "Mikee\u2019s Own Baked Oysters", price: "1/2 DZ \u2013 $15.99, 1 DZ \u2013 $25.99", category: "Oysters", description: "Fresh shucked, spiced and topped with scallions, bread crumbs, parmesan cheese and bacon." },
      { name: "EJ\u2019s Oysters", price: "1/2 DZ \u2013 $15.99, 1 DZ \u2013 $25.99", category: "Oysters", description: "Prepared with garlic, jalape\u00f1os, scallions and topped with bacon and cheese." },
      { name: "Jumbo Shrimp", price: "1/2 lb \u2013 $13.99, 1 lb \u2013 $20.99", category: "Appetizers", description: "Pan-grilled, broiled, fried, sauteed, blackened, or steamed" },
      { name: "Fried or Sauteed Crab Claws", price: "Small $29.99, Large $39.99", category: "Appetizers", description: "" },
      { name: "Seafood Gumbo", price: "Cup $5.99, Bowl $7.99", category: "Appetizers", description: "" },
      { name: "Red Beans and Rice", price: "Cup $5.99, Bowl $7.99", category: "Appetizers", description: "" },
      { name: "Fried Jalapeno Peppers", price: "$8.99", category: "Appetizers", description: "" },
      { name: "Fried Green Tomatoes", price: "$9.99", category: "Appetizers", description: "" },
      { name: "Potato Skins", price: "$11.99", category: "Appetizers", description: "Topped with cheddar cheese, chives, and bacon" },
      { name: "Old Fashioned Onion Rings", price: "\u00bd foot $8.99, 1 foot $15.99", category: "Appetizers", description: "" },
      { name: "Fried Clam Strips", price: "$9.99", category: "Appetizers", description: "Sauce for dipping" },
      { name: "Italian Fried Cheese Sticks", price: "$13.99", category: "Appetizers", description: "Lightly fried, marinara sauce for dipping" },
      { name: "Buffalo Chicken/Shrimp", price: "$12.99", category: "Appetizers", description: "" },
      { name: "Crab Cakes (2)", price: "$15.99", category: "Appetizers", description: "Grilled or Fried" },
      { name: "Seafood Dip", price: "$13.99", category: "Appetizers", description: "" },
      { name: "Parmesan Garlic Bread", price: "$7.99", category: "Appetizers", description: "" },
      { name: "Pan Fried Veggies", price: "$8.99", category: "Appetizers", description: "" },
      { name: "New Orleans Baked French Bread", price: "$5.99", category: "Appetizers", description: "" },
      { name: "Reuben Egg Rolls", price: "$9.99", category: "Appetizers", description: "" },
      { name: "Spinach Dip", price: "$10.99", category: "Appetizers", description: "" },
      { name: "House Salad", price: "$6.99", category: "Salads", description: "Fresh lettuce with special toppings" },
      { name: "Soup and Salad", price: "$11.99", category: "Salads", description: "Cup of fresh soup and house salad" },
      { name: "Blackened or Grilled Chicken Salad", price: "$14.99", category: "Salads", description: "Tender breast meat grilled and topped with fresh bacon, Parmesan and crisp salad vegetables" },
      { name: "Mikee\u2019s Chef Salad", price: "$15.99", category: "Salads", description: "Crisp lettuce topped with vegetables, roast beef, boiled bay shrimp and cheeses" },
      { name: "Shrimp Tossed Salad", price: "$14.99", category: "Salads", description: "Crisp lettuce topped with boiled bay shrimp, bacon bits and fresh Parmesan" },
      { name: "Golden Fried Shrimp Po-Boy", price: "$15.99", category: "Po-Boys & Burgers", description: "" },
      { name: "Catfish Fillet Po-Boy", price: "$15.99", category: "Po-Boys & Burgers", description: "" },
      { name: "Fried Chicken Breast Po-Boy", price: "$15.99", category: "Po-Boys & Burgers", description: "" },
      { name: "Tender Fried Oyster Po-Boy", price: "$19.99", category: "Po-Boys & Burgers", description: "" },
      { name: "Whitefish Po-Boy", price: "$15.99", category: "Po-Boys & Burgers", description: "" },
      { name: "Fresh Fish Po-Boy", price: "Market Price", category: "Po-Boys & Burgers", description: "" },
      { name: "Island Burger*", price: "$17.99", category: "Po-Boys & Burgers", description: "" },
      { name: "French Loaf Burger*", price: "$14.99", category: "Po-Boys & Burgers", description: "" },
      { name: "Mikee\u2019s Seafood Platter", price: "$26.99", category: "Seafood Dinners", description: "Fried shrimp, oysters, and fish fillets. Served with gumbo and two sides." },
      { name: "Whitefish Plate", price: "$16.99", category: "Seafood Dinners", description: "" },
      { name: "Fried Clam Strips", price: "$17.99", category: "Seafood Dinners", description: "Fried to perfection" },
      { name: "Golden Fried Catfish Strips", price: "$17.99", category: "Seafood Dinners", description: "Crisp fried in corn meal" },
      { name: "Chicken Strips", price: "$18.99", category: "Seafood Dinners", description: "Southern-fried, delicious" },
      { name: "Traditional Fried Shrimp (No Tails)", price: "$17.99", category: "Seafood Dinners", description: "" },
      { name: "Tender Fried Oysters", price: "$23.99", category: "Seafood Dinners", description: "Crisp fried in corn meal" },
      { name: "Crab Cake (Grilled or Fried)", price: "$22.99", category: "Seafood Dinners", description: "" },
      { name: "Shrimp & Catfish Plate or Whitefish", price: "$18.99", category: "Seafood Dinners", description: "Great combination" },
      { name: "Shrimp & Oyster Plate", price: "$23.99", category: "Seafood Dinners", description: "Fresh fried, delicious" },
      { name: "Shrimp & Clam Strips", price: "$18.99", category: "Seafood Dinners", description: "" },
      { name: "Crab Claw Dinner", price: "$27.99", category: "Seafood Dinners", description: "Freshly breaded and fried to a golden brown" },
      { name: "Blackened Redfish", price: "$25.99", category: "Favorites & Specialties", description: "Topped with a creamy shrimp and crab sauce over a bed of rice." },
      { name: "Fresh Catch of the Day", price: "Market", category: "Favorites & Specialties", description: "Fried, broiled, blackened, saut\u00e9ed, or pan grilled. Served over a bed of rice, with choice of one side and house salad." },
      { name: "Fresh Catch Captain Ed\u2019s Style", price: "Market", category: "Favorites & Specialties", description: "Fried, broiled, blackened, saut\u00e9ed, or pan grilled. Topped with hollandaise sauce, green onions, mushrooms, and bay shrimp over rice. Served with a house salad (contains pecans)." },
      { name: "Coconut Shrimp", price: "$19.99", category: "Favorites & Specialties", description: "Served with marmalade" },
      { name: "Stuffed Catfish w/ Tangy Cream Sauce", price: "$25.99", category: "Favorites & Specialties", description: "Catfish fillets with shrimp and crabmeat stuffing, topped with cream sauce" },
      { name: "Island Baked Chicken", price: "$18.99", category: "Favorites & Specialties", description: "With parmesan, green onions, homemade bread crumbs" },
      { name: "Choice Ribeye", price: "$37.99", category: "Favorites & Specialties", description: "Cooked to order" },
      { name: "6 oz. Filet", price: "$25.99", category: "Favorites & Specialties", description: "Cooked to order" },
      { name: "Sauteed Beef Tips", price: "$25.99", category: "Favorites & Specialties", description: "Tenderloin pieces spiced and cooked to perfection" },
      { name: "Snow Crab Dinner", price: "$39.99", category: "Favorites & Specialties", description: "" },
      { name: "Jumbo Shrimp (Tail On)", price: "$19.99", category: "Favorites & Specialties", description: "Fried, broiled, saut\u00e9ed, blackened, or pan grilled" },
      { name: "Blackened or Grilled Chicken Breast", price: "$17.99", category: "Favorites & Specialties", description: "Lightly seasoned" },
      { name: "Saut\u00e9ed Scallops", price: "$19.99", category: "Favorites & Specialties", description: "Seasoned and lightly breaded" },
      { name: "Stuffed Shrimp w/ Tangy Cream Sauce", price: "$19.99", category: "Favorites & Specialties", description: "Shrimp with crab meat stuffing, topped with cream sauce" },
      { name: "Fettuccine Alfredo", price: "$15.99", category: "Rice & Pasta Dishes", description: "Tender pasta in a creamy Alfredo sauce" },
      { name: "Bay Shrimp Alfredo*", price: "$17.99", category: "Rice & Pasta Dishes", description: "A locals favorite!" },
      { name: "Jumbo Shrimp Alfredo*", price: "$19.99", category: "Rice & Pasta Dishes", description: "Grilled" },
      { name: "Grilled Chicken Alfredo*", price: "$18.99", category: "Rice & Pasta Dishes", description: "" },
      { name: "Blackened Chicken Alfredo*", price: "$18.99", category: "Rice & Pasta Dishes", description: "" },
      { name: "Sauteed Scallop Alfredo*", price: "$21.99", category: "Rice & Pasta Dishes", description: "" },
      { name: "Captain Ed\u2019s Saut\u00e9ed Scallops*", price: "$20.99", category: "Rice & Pasta Dishes", description: "Served over a bed of rice" },
      { name: "Shrimp & Grits", price: "$18.99", category: "Rice & Pasta Dishes", description: "Grilled shrimp over cheesy grits" },
      { name: "Red Beans & Rice", price: "$17.99", category: "Rice & Pasta Dishes", description: "Served with Conecuh sausage" },
      { name: "Kellie\u2019s Saut\u00e9ed Chicken", price: "$18.99", category: "Rice & Pasta Dishes", description: "Chicken saut\u00e9ed with special cream sauce" },
      { name: "Seafood and Broccoli Stir Fry", price: "$19.99", category: "Rice & Pasta Dishes", description: "Scallops and shrimp saut\u00e9ed with vegetables and broccoli in a light sauce" },
      { name: "Sweet & Sour Chicken", price: "$19.99", category: "Rice & Pasta Dishes", description: "Fried chicken with bell pepper and onions in sweet and sour sauce over rice" },
      { name: "Sweet & Sour Shrimp", price: "$19.99", category: "Rice & Pasta Dishes", description: "Fried shrimp with bell pepper and onions in sweet and sour sauce over rice" },
      { name: "Wine and Garlic Seafood Pasta*", price: "$19.99", category: "Rice & Pasta Dishes", description: "Shrimp and oysters saut\u00e9ed with vegetables in garlic butter over imported fettuccine" },
      { name: "Chicken Mikee*", price: "$19.99", category: "Rice & Pasta Dishes", description: "Saut\u00e9ed breast with scallions, mushrooms, and shrimp in a buttery wine sauce over rice" },
      { name: "Bay Shrimp and Garlic Butter*", price: "$19.99", category: "Rice & Pasta Dishes", description: "Bay shrimp saut\u00e9ed with scallions and mushrooms in garlic butter over rice" },
      { name: "Catfish", price: "$19.99", category: "All You Can Eat", description: "Served with puppies, fritter, and choice of two sides. Substitute salad $2.50." },
      { name: "Whitefish", price: "$18.99", category: "All You Can Eat", description: "Served with puppies, fritter, and choice of two sides. Substitute salad $2.50." },
      { name: "Shrimp (no tails)", price: "$19.99", category: "All You Can Eat", description: "Served with puppies, fritter, and choice of two sides. Substitute salad $2.50." },
      { name: "Clams", price: "$19.99", category: "All You Can Eat", description: "Served with puppies, fritter, and choice of two sides. Substitute salad $2.50." },
      { name: "Snow Crab", price: "$59.99", category: "All You Can Eat", description: "Served with puppies, fritter, and choice of two sides. Substitute salad $2.50." },
      { name: "Cheese Grits", price: "$2.99", category: "Sides", description: "" },
      { name: "Red Beans", price: "$2.99", category: "Sides", description: "" },
      { name: "Golden Brown Hush Puppies", price: "$2.99", category: "Sides", description: "" },
      { name: "Fried Corn Fritters", price: "$2.99", category: "Sides", description: "" },
      { name: "Mikee\u2019s Own Marinated Cabbage", price: "$2.99", category: "Sides", description: "" },
      { name: "Home Style Baked Beans", price: "$2.99", category: "Sides", description: "" },
      { name: "Fries or Boiled New Potatoes", price: "$2.99", category: "Sides", description: "" },
      { name: "Turnip Greens", price: "$2.99", category: "Sides", description: "" },
      { name: "Potato Salad", price: "$2.99", category: "Sides", description: "" },
      { name: "Fried Okra", price: "$2.99", category: "Sides", description: "" },
      { name: "Kiddy Burger", price: "$8.99", category: "Kids Meals", description: "On bun with lettuce, tomato, pickle, and mayo" },
      { name: "Fried Shrimpy", price: "$8.99", category: "Kids Meals", description: "" },
      { name: "Fried Fishy", price: "$8.99", category: "Kids Meals", description: "" },
      { name: "Fried Chicky", price: "$8.99", category: "Kids Meals", description: "" },
      { name: "Fettuccini Alfredo", price: "$8.99", category: "Kids Meals", description: "" },
      { name: "Grilled Cheese", price: "$8.99", category: "Kids Meals", description: "" },
      { name: "Peanut Butter Pie", price: "$8.99", category: "Desserts", description: "" }
    ],
    drinks: [

    ]
  },
  {
    id: "oso-bear-point",
    name: "OSO Bear Point",
    category: "restaurants",
    cuisine: "American • Seafood • Steaks",
    location: "Orange Beach",
    address: "5749 Bay La Launch Ave., Orange Beach, AL 36561",
    phone: "251-345-6738",
    website: "https://osobearpoint.com",
    image: "https://picsum.photos/seed/oso-bear-point/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Waterfront", "Casual", "Outdoor Seating", "Live Music"],
    description: "Seafood / American dining in Orange Beach",
    hours: "Mon-Thu 11am-9pm | Fri 11am-10pm | Sat 11am-10pm | Sun 11am-9pm",


    menu: [
      { name: "Fried Pickles", price: "$12", category: "Appetizers", description: "Creole Fried Pickles & Comeback Sauce" },
      { name: "Peel & Eat Shrimp", price: "", category: "Appetizers", description: "1/2 lb $18 | 1 lb $28, Tossed in Viet Cajun Butter" },
      { name: "Nacho Libre", price: "$15", category: "Appetizers", description: "Tortilla Chips or Tots, Queso, Black Bean Corn Salsa, Pickled Onions, Candied Jalape\u00f1os, Avocado Salsa" },
      { name: "Chip & Dip Trio", price: "$12", category: "Appetizers", description: "Chips + Guacamole, Salsa & Queso" },
      { name: "Fried Crab Claws", price: "MP", category: "Appetizers", description: "1/2 lb MP, Served with Cocktail Sauce" },
      { name: "Grouper Nuggets", price: "$15", category: "Appetizers", description: "8 oz Fried Grouper Bites + Comeback Sauce" },
      { name: "Big Ass Pretzel", price: "$13", category: "Appetizers", description: "Beer Cheese + Creole Mustard" },
      { name: "Wings", price: "$19", category: "Appetizers", description: "Buffalo, BBQ, Sweet Chili, Cajun Sweet Soy" },
      { name: "Crab Cake Bites", price: "$19", category: "Appetizers", description: "Mini Fried Crab Cake + Comeback Sauce" },
      { name: "On The Rocks", price: "Market", category: "Oysters", description: "Served with Saltines and Mignonette" },
      { name: "Smoke on the Water", price: "Market", category: "Oysters", description: "Chipotle Garlic Compound Butter, Parmesan, Bacon, Green Onion" },
      { name: "Parmageddon", price: "Market", category: "Oysters", description: "Butter, Parmesan, Roasted Garlic Lemon Zest, Parsley" },
      { name: "Cheesin", price: "$14", category: "Flatbreads", description: "Ricotta, Roasted Garlic, 3 Cheese Blend, Red Pepper Flakes, Hot Honey Drizzle" },
      { name: "Taco", price: "$15", category: "Flatbreads", description: "Southwest Ranch, Black Bean Corn Salsa, Avocado Cream, Cheese Blend, Lettuce, Tomato, Pickled Onions" },
      { name: "Blazed Bird", price: "$15", category: "Flatbreads", description: "Buffalo Chicken Dip, 3 Cheese Blend, Blue Cheese Crumble, Hot Sauce Drizzle, Green Onion" },
      { name: "Gumbo", price: "Cup $7, Bowl $13", category: "Gumbo & Etouffee", description: "Homemade Gumbo served with Rice and Saltines" },
      { name: "Etouffee", price: "Cup $7, Bowl $13", category: "Gumbo & Etouffee", description: "Homemade Etouffee served with Rice and Saltines" },
      { name: "Caesar", price: "$12", category: "Salads", description: "Romaine, Tomato, Onion, Parmesan, Crouton, Fried Jalapeno, Caesar Dressing" },
      { name: "Summer Salad", price: "$13", category: "Salads", description: "Spinach, Strawberry, Blue Cheese, Onion, Candied Nuts, Champagne Vinaigrette" },
      { name: "Fiesta", price: "$13", category: "Salads", description: "Romaine, Cheddar Jack, Salsa, Black Bean Corn Salsa, Sour Cream, Guacamole, Tortilla Crisps, Southwest Ranch" },
      { name: "King of the Swamp", price: "$20", category: "Burritos", description: "Conecuh, Jambalaya Rice, Blackened Shrimp & Crawfish, Collard Green Slaw, Creole Cream" },
      { name: "OSO Gordo", price: "$18", category: "Burritos", description: "Blackened Mahi, Black Bean Corn Salsa, White Rice, Pepper Jack Cheese, Creamy Avocado Sauce" },
      { name: "Fish or Shrimp", price: "$18", category: "Tacos", description: "3 tacos, grilled or fried, Southwest Slaw, Fried Jalapenos, Cilantro Cream" },
      { name: "BBQ Brisket", price: "$17", category: "Tacos", description: "BBQ Brisket, Corn Tortilla, White BBQ, Pickled Onion, Cotija Cheese" },
      { name: "Ground Beef", price: "$15", category: "Tacos", description: "Ground Beef, Cheddar Jack, Avo Cream, Lettuce, Tomato" },
      { name: "Cajadilla", price: "$18", category: "Quesadillas", description: "Blackened Shrimp & Crawfish, Shredded Cheese Blend, Black Bean Corn Salsa, Cajun Dip" },
      { name: "El Pollo Loco", price: "$16", category: "Quesadillas", description: "Blackened Chicken, Cheese Blend, Peppers, Onions, Southwest Ranch" },
      { name: "Fettuccine Alfredo", price: "$20", category: "Entrees", description: "Served with Garlic Bread" },
      { name: "Fettuccine Alfredo + Chicken", price: "$23", category: "Entrees", description: "Served with Garlic Bread" },
      { name: "Fettuccine Alfredo + Shrimp", price: "$25", category: "Entrees", description: "Served with Garlic Bread" },
      { name: "Blackened Snapper & Etouffee", price: "$27", category: "Entrees", description: "Blackened Snapper over Etouffee, Rice" },
      { name: "Ribeye", price: "$40", category: "Entrees", description: "Grilled Ribeye, Baked Potato, Grilled Veggies" },
      { name: "Fire on the Bayou", price: "$28", category: "Entrees", description: "Crab Cakes, Fried Green Tomatoes, Creole Cream, Fried Crawfish, Green Onion" },
      { name: "Bang Bang Shrimp Bowl", price: "$22", category: "Entrees", description: "Panko Fried Shrimp, Ginger Garlic Rice, Marinated Cucumbers, Asian Slaw, Sesame Seed" },
      { name: "The Big Tuna", price: "$24", category: "Entrees", description: "Seared Tuna, Ginger Garlic Rice, Mango Salsa, Candied Jalapenos, Cilantro" },
      { name: "BBQ Brisket Mac", price: "$22", category: "Entrees", description: "Beer Cheese, Macaroni, BBQ Brisket, Fried Onion, Alabama White BBQ Sauce, Candied Jalapenos" },
      { name: "Stuffed Potato", price: "$10", category: "Entrees", description: "Baked Potato, Cheese, Queso, Green Onion" },
      { name: "Build Yo' Own Burger", price: "$15", category: "Everything on a Bun", description: "Double Beef Patty + Add-ons" },
      { name: "Build Yo' Own Chicken Sandwich", price: "$15", category: "Everything on a Bun", description: "Fried, Grilled or Blackened + Add-ons" },
      { name: "Turkey Bacon Gouda", price: "$16", category: "Everything on a Bun", description: "Turkey Breast, Smoked Gouda, Bacon, Lettuce, Tomato, Roasted Garlic Aioli, Grilled Roll" },
      { name: "Smoked Brisket French Dip", price: "$19", category: "Everything on a Bun", description: "Shaved Brisket, Smoked Gouda, Grilled Roll, French Onion Dip" },
      { name: "The Big Easy", price: "$18", category: "Everything on a Bun", description: "Fried, Grilled, or Blackened Grouper or Shrimp, Lettuce, Tomato, Dill Pickles, Tartar" },
      { name: "Buffalo Caesar Wrap", price: "$16", category: "Everything on a Bun", description: "Fried Chicken, Buffalo Sauce, Romaine, Onion, Tomato, Caesar, Parmesan, Tortilla" },
      { name: "Hoosier Daddy", price: "$16", category: "Everything on a Bun", description: "Giant Fried Pork Loin, Lettuce, Tomato, Onion, Toasted Bun" },
      { name: "Grouper", price: "$25", category: "Platters", description: "Choice of 2 Sides + Hushpuppies" },
      { name: "Shrimp", price: "$25", category: "Platters", description: "Choice of 2 Sides + Hushpuppies" },
      { name: "Snapper", price: "$25", category: "Platters", description: "Choice of 2 Sides + Hushpuppies" },
      { name: "Chicken", price: "$21", category: "Platters", description: "Choice of 2 Sides + Hushpuppies" },
      { name: "Combo", price: "$28", category: "Platters", description: "Choice of 2 Proteins + 2 Sides + Hushpuppies" },
      { name: "Bushwacker Cheesecake", price: "$10", category: "Desserts", description: "Coconut Cream / Cherry" },
      { name: "Key Lime Pie", price: "$9", category: "Desserts", description: "Whipped Cream, Charred Lime" },
      { name: "Beignets", price: "$9", category: "Desserts", description: "Fried & powdered sugar; dipping sauces: caramel, raspberry, chocolate, coconut" },
      { name: "Two Beef Tacos", price: "$12", category: "Kids Menu", description: "Served with French Fries or Tater Tots" },
      { name: "Chicken Tenders", price: "$12", category: "Kids Menu", description: "Served with French Fries or Tater Tots" },
      { name: "Fried Shrimp", price: "$12", category: "Kids Menu", description: "Served with French Fries or Tater Tots" },
      { name: "Fish Fish", price: "$12", category: "Kids Menu", description: "Served with French Fries or Tater Tots" },
      { name: "Burger", price: "$12", category: "Kids Menu", description: "Served with French Fries or Tater Tots" },
      { name: "French Fries", price: "$4", category: "Sides", description: "" },
      { name: "Tater Tots", price: "$4", category: "Sides", description: "" },
      { name: "White Rice", price: "$4", category: "Sides", description: "" },
      { name: "Hushpuppies", price: "$4", category: "Sides", description: "" },
      { name: "Ginger Garlic Rice", price: "$4", category: "Sides", description: "" },
      { name: "Asian Slaw", price: "$4", category: "Sides", description: "" },
      { name: "Chips & Salsa", price: "$4", category: "Sides", description: "" },
      { name: "Sweet Potato Fries", price: "$5", category: "Premium Sides", description: "" },
      { name: "Grilled Veggies", price: "$5", category: "Premium Sides", description: "" },
      { name: "Baked Potato", price: "$5", category: "Premium Sides", description: "" },
      { name: "Chips & Queso", price: "$5", category: "Premium Sides", description: "" },
      { name: "Side Salad", price: "$5", category: "Premium Sides", description: "" }
    ],
    drinks: [

    ]
  },
  {
    id: "pelican-grill",
    name: "Pelican Grill",
    category: "restaurants",
    cuisine: "Seafood • Coastal • Fine Dining",
    location: "Orange Beach",
    address: "27267 Perdido Beach Blvd., Orange Beach, AL 36561",
    phone: "(251) 483-3665",
    website: "",
    image: "https://picsum.photos/seed/pelican-grill/400/300",
    rating: 4.5,
    priceLevel: "$$$",
    tags: ["Fine Dining", "Gulf Views", "Seafood", "Upscale"],
    description: "Seafood / Grill dining in Orange Beach",
    hours: "7 Days a Week 11AM - 9PM",


    menu: [
      { name: "All You Can Eat Grouper Fingers", price: "MP", category: "All You Can Eat", description: "" },
      { name: "Breadsticks", price: "$8", category: "Appetizers", description: "Served with Raspberry Butter" },
      { name: "Shrimp & Avocado", price: "$15", category: "Appetizers", description: "Peeled cold shrimp, avocado, remoulade sauce" },
      { name: "Shrimp & Crab Dip", price: "$18", category: "Appetizers", description: "Served warm with breadsticks" },
      { name: "Cheese Curds", price: "$14", category: "Appetizers", description: "Breaded and deep fried golden" },
      { name: "Grouper Fingers", price: "$16", category: "Appetizers", description: "Hand-breaded Gulf grouper fingers, tartar sauce" },
      { name: "Kickin' Shrimp", price: "$14", category: "Appetizers", description: "Lightly breaded Gulf shrimp with spicy honey sauce, ranch" },
      { name: "Fried Green Tomatoes", price: "$16", category: "Appetizers", description: "Topped with crawfish tails and remoulade sauce" },
      { name: "Fried Dill Pickles", price: "$12", category: "Appetizers", description: "Served with house ranch" },
      { name: "Crab Claws", price: "MP", category: "Appetizers", description: "Fried or saut\u00e9ed, market price" },
      { name: "Raw", price: "1/2 Dozen $20, 1 Dozen $29", category: "Oysters", description: "" },
      { name: "Rockefeller", price: "8 $20, 12 $29", category: "Oysters", description: "Spinach, bacon, garlic, onions, Romano & Parmesan cheese" },
      { name: "House", price: "8 $20, 12 $29", category: "Oysters", description: "Andouille sausage, peppers, onions, smoked Gouda" },
      { name: "Garlic Parmesan", price: "8 $20, 12 $29", category: "Oysters", description: "Garlic, Parmesan & Romano in butter sauce" },
      { name: "Fresno Tequila", price: "8 $20, 12 $29", category: "Oysters", description: "Raw oyster, pickled Fresno chili, red onion, lime tequila brine" },
      { name: "Strawberry Pecan Salad", price: "$15", category: "Salads", description: "Mixed greens, mandarin oranges, strawberries, onions, tomatoes, pecans, feta, raspberry vinaigrette" },
      { name: "Seared Tuna Salad", price: "$16", category: "Salads", description: "Mixed greens, carrots, radish, cucumber, sesame dressing" },
      { name: "Side Salad", price: "$7", category: "Salads", description: "Mixed greens, tomatoes, cucumber, cheese. Add Chicken $6, Shrimp $8, Grouper $8, Tuna $8" },
      { name: "Seafood Gumbo", price: "Cup $6, Bowl $10", category: "Lunch Menu", description: "Shrimp & crawfish with rice" },
      { name: "Crab Melt", price: "$18", category: "Lunch Menu", description: "Crab cake, white American cheese, grilled tomato, remoulade on sourdough + 1 side" },
      { name: "Tacos (Mahi or Shrimp)", price: "$18", category: "Lunch Menu", description: "Slaw & mango salsa + 1 side" },
      { name: "Po'Boys", price: "$18", category: "Lunch Menu", description: "Shrimp, Grouper, Chicken, Oyster; fried, grilled, or blackened; lettuce, tomato, remoulade + 1 side" },
      { name: "Blackened Shrimp Bowl", price: "$18", category: "Lunch Menu", description: "Shrimp, avocado, rice, mango salsa, remoulade; sub Tuna +$2" },
      { name: "Chicken Tenders & Fries", price: "$14", category: "Lunch Menu", description: "" },
      { name: "Tuna Nachos", price: "$20", category: "Lunch Menu", description: "House chips, raw tuna, mango salsa, sesame dressing, sriracha aioli; sub chicken +$2" },
      { name: "Shrimp Roll", price: "$17", category: "Lunch Menu", description: "Shrimp, mayo, celery, seafood seasoning + 1 side" },
      { name: "Pelican's Nest", price: "$14", category: "Lunch Menu", description: "Fries topped with cheese & grilled chicken, white BBQ sauce; sub shrimp +$2" },
      { name: "Shrimp & Avocado Wrap", price: "$15", category: "Lunch Menu", description: "Shrimp, avocado, lettuce, tomato, remoulade + 1 side" },
      { name: "Fried Green Tomato BLT Wrap", price: "$14", category: "Lunch Menu", description: "FGT, bacon, lettuce, tomato, cheese, ranch + 1 side" },
      { name: "Lobster Mac-N-Cheese Burger", price: "$18", category: "Lunch Menu", description: "Beef patty, lobster mac, lettuce, tomato + 1 side" },
      { name: "San Roc Burger", price: "$15", category: "Lunch Menu", description: "Beef patty, lettuce, tomato, cheese, pickle + 1 side" },
      { name: "Cajun Patty Melt", price: "$15", category: "Lunch Menu", description: "Beef patty, grilled onions, cheese, Cajun sauce, sourdough + 1 side" },
      { name: "Snow Crab Legs", price: "MP", category: "Seafood Boil", description: "1.5 lbs, drawn butter" },
      { name: "Royal Reds", price: "MP", category: "Seafood Boil", description: "Head-on Royal Red shrimp, 1 lb (seasonal)" },
      { name: "Gulf Shrimp", price: "$18", category: "Seafood Boil", description: "Head-off peel & eat, 1 lb" },
      { name: "8 oz. Filet Oscar", price: "$48", category: "From the Charbroiler", description: "Topped with fried green tomatoes, lump crab, Hollandaise; 2 sides" },
      { name: "8 oz. Bourbon Filet", price: "$39", category: "From the Charbroiler", description: "Bourbon glaze; 2 sides" },
      { name: "14 oz. Ribeye", price: "$42", category: "From the Charbroiler", description: "Charbroiled with Chef seasoning; 2 sides" },
      { name: "Surf-n-Turf", price: "$46", category: "From the Charbroiler", description: "5 oz. filet, 5 shrimp, 1/2 lb snow crab legs; 2 sides" },
      { name: "Fettuccine Alfredo", price: "$20", category: "Pasta Dishes", description: "Parmesan Alfredo sauce" },
      { name: "Cajun Pasta", price: "$22", category: "Pasta Dishes", description: "Peppers, onions, andouille sausage, Creole cream sauce" },
      { name: "Shrimp Scampi", price: "$26", category: "Pasta Dishes", description: "Shrimp, garlic, lemon, wine butter sauce, Parmesan, angel hair pasta" },
      { name: "Twin Lobster Tails", price: "MP", category: "Entrees", description: "Broiled; 2 sides" },
      { name: "Grouper Filet", price: "$34", category: "Entrees", description: "Fried, blackened, or grilled; topped with lump crab & lemon beurre blanc; 2 sides" },
      { name: "Blackened Mahi", price: "$29", category: "Entrees", description: "Signature mango salsa; 2 sides" },
      { name: "Stuffed Shrimp", price: "$29", category: "Entrees", description: "Crab meat stuffing, lemon beurre blanc; 2 sides" },
      { name: "Apricot Glazed Chicken", price: "$20", category: "Entrees", description: "Grilled chicken breast, apricot glaze, pecans; 2 sides" },
      { name: "Chicken Breast", price: "$18", category: "Entrees", description: "Breaded, blackened, or lemon pepper; 2 sides" },
      { name: "Shrimp Florentine", price: "$26", category: "Entrees", description: "Grilled shrimp, spinach, creamy garlic Parmesan sauce; 2 sides" },
      { name: "Shrimp", price: "$24", category: "Entrees", description: "Fried, grilled, or blackened; add spicy honey glaze; 2 sides" },
      { name: "Stuffed Pork Chop", price: "$26", category: "Entrees", description: "Apple & bacon stuffing, bourbon glaze; 2 sides" },
      { name: "Shrimp-n-Grits", price: "$27", category: "Entrees", description: "Grilled shrimp, smoked Gouda grits, andouille, green onions; breadstick" },
      { name: "Lobster Mac-N-Cheese", price: "$42", category: "Entrees", description: "Cavatelli pasta, lobster, cheddar cheese sauce, panko Parmesan crust, lobster tail" },
      { name: "Rice Pilaf", price: "", category: "Sides", description: "" },
      { name: "Baked Potato", price: "", category: "Sides", description: "" },
      { name: "Parmesan Risotto", price: "", category: "Sides", description: "" },
      { name: "Whipped Sweet Potatoes", price: "", category: "Sides", description: "" },
      { name: "Mixed Vegetables", price: "", category: "Sides", description: "" },
      { name: "Fried Brussels Sprouts", price: "", category: "Sides", description: "" },
      { name: "French Fries", price: "", category: "Sides", description: "" },
      { name: "Smoked Gouda Cheese Grits", price: "", category: "Sides", description: "" },
      { name: "Garden Salad", price: "", category: "Sides", description: "+ $2 upcharge" },
      { name: "Lobster Mac-n-Cheese", price: "", category: "Sides", description: "+ $4 upcharge" },
      { name: "Key Lime Pie", price: "$8", category: "Desserts", description: "" },
      { name: "Triple Chocolate Mousse Cake", price: "$8", category: "Desserts", description: "" },
      { name: "Bananas Foster", price: "$10", category: "Desserts", description: "Bananas, caramel rum sauce, vanilla ice cream, flamb\u00e9ed tableside" },
      { name: "Hooked & Cooked", price: "$23 per person", category: "Hooked & Cooked", description: "Bring your fresh catch, we fry, grill, or blacken it; includes 2 sides" }
    ],
    drinks: [

    ]
  },
  {
    id: "undertow-bar-grill",
    name: "Undertow Bar & Grill",
    category: "restaurants",
    cuisine: "American • Bar Food • Casual",
    location: "Orange Beach",
    address: "25025 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 981-3331",
    website: "",
    image: "https://picsum.photos/seed/undertow-bar-grill/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Bar", "Casual", "Sports Bar", "Late Night"],
    description: "Bar & Grill dining in Orange Beach",
    hours: "Mon–Sun 10:00 AM – 2:00 AM",


    menu: [
      { name: "Appetizer Sampler", price: "$11.89", category: "Appetizers", description: "3 Cheese Stix, 3 Jalape\u00f1o Poppers, Fries, Mushrooms, Corn Nuggets" },
      { name: "Cheese Stix", price: "$8.79", category: "Appetizers", description: "Mozzarella sticks, fried; served with marinara sauce" },
      { name: "Fried Mushrooms", price: "$9.39", category: "Appetizers", description: "Deep fried; served with ranch or horsey sauce" },
      { name: "Jalape\u00f1o Poppers", price: "$9.39", category: "Appetizers", description: "Deep fried; filled with cream cheese" },
      { name: "Corn Nuggets", price: "$8.19", category: "Appetizers", description: "Very addictive; no sauce needed" },
      { name: "French Fries", price: "$3.79", category: "Appetizers", description: "" },
      { name: "Cheese Fries", price: "$6.89", category: "Appetizers", description: "Crinkle-cut fries smothered in cheddar" },
      { name: "Fried Okra", price: "$6.89", category: "Appetizers", description: "" },
      { name: "Onion Rings", price: "$6.89", category: "Appetizers", description: "" },
      { name: "Hamburger Steak", price: "$14.39", category: "Entrees", description: "1/2 lb patty, chargrilled; caramelized onions, saut\u00e9ed mushrooms, brown gravy; served with fries, okra, toast" },
      { name: "Chicken Tenders", price: "$10.69", category: "Entrees", description: "Beer battered & fried or grilled; choice of sauce" },
      { name: "Chicken Wings (10)", price: "$14.39", category: "Entrees", description: "Fried and tossed in your choice of sauce; served with celery" },
      { name: "The Tow Burger", price: "$11.29", category: "Burgers & Sandwiches", description: "" },
      { name: "Mushroom & Swiss Burger", price: "$13.19", category: "Burgers & Sandwiches", description: "1/2 lb patty charbroiled; Swiss cheese, saut\u00e9ed onions & mushrooms" },
      { name: "Patty Melt", price: "$10.69", category: "Burgers & Sandwiches", description: "1/2 lb patty; 2 slices Swiss; saut\u00e9ed onions on grilled white bread" },
      { name: "Chicken Sandwich", price: "$10.69", category: "Burgers & Sandwiches", description: "Fresh breast, grilled or fried on toasted bun with lettuce, tomato, pickle" },
      { name: "Grilled Cheese Sandwich", price: "$8.19", category: "Burgers & Sandwiches", description: "American & Swiss on white bread, butter-grilled" },
      { name: "The Undertow Club Sandwich", price: "$11.89", category: "Burgers & Sandwiches", description: "Ham, turkey, bacon, American & Swiss; lettuce, tomato on toasted white" },
      { name: "BLT Sandwich", price: "", category: "Burgers & Sandwiches", description: "Bacon, lettuce, tomato on toasted white bread" },
      { name: "All-You-Can-Eat Royal Reds & Crawfish Buffet", price: "", category: "All You Can Eat", description: "Includes corn, smoked sausage, and new potatoes (crawfish seasonal)." },
      { name: "Days", price: "", category: "AYCE Details", description: "Saturday & Sunday" },
      { name: "Time", price: "", category: "AYCE Details", description: "2:00 PM \u2013 7:00 PM (or until they run out)" }
    ],
    drinks: [

    ]
  },
  {
    id: "wolf-bay-orange-beach",
    name: "Wolf Bay Orange Beach",
    category: "restaurants",
    cuisine: "Seafood • American • Casual",
    location: "Orange Beach",
    address: "24131 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 965-5129",
    website: "https://www.wolfbay.com",
    image: "https://picsum.photos/seed/wolf-bay-orange-beach/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Waterfront", "Seafood", "Family Friendly", "Casual"],
    description: "Seafood & Steak dining in Orange Beach",
    hours: "",


    menu: [
      { name: "On the Half Shell*", price: "MP (\u00bd doz / doz)", category: "Oysters", description: "Ice-cold, raw & shucked to order with horseradish, cocktail sauce & saltines." },
      { name: "Rockefeller", price: "MP (\u00bd doz / doz)", category: "Oysters", description: "Baked with creamed spinach & bacon." },
      { name: "Parmesan Garlic", price: "MP (\u00bd doz / doz)", category: "Oysters", description: "Baked, seasoned with garlic & lemon butter, with Parmesan." },
      { name: "Award\u2011Winning Pon Pon!*", price: "MP (\u00bd doz / doz)", category: "Oysters", description: "Raw, shucked to order with cucumber\u2011shallot mignonette, pomegranate arils & fresh dill." },
      { name: "The Meltdown", price: "MP (\u00bd doz / doz)", category: "Oysters", description: "Baked with three cheeses, bacon & fresh jalape\u00f1os." },
      { name: "Cha Cha\u2019s Crab Dip", price: "$14", category: "Appetizers", description: "Signature cream cheese crab dip, Captain Rodney sauce & bacon with fried pita points." },
      { name: "Smoked Tuna Dip", price: "$12", category: "Appetizers", description: "With fried pita points." },
      { name: "Bang Bang Shrimp", price: "$14", category: "Appetizers", description: "Fried Gulf shrimp tossed in sriracha\u2011sweet chili aioli on red cabbage slaw." },
      { name: "Ceviche Lettuce Wraps", price: "$14", category: "Appetizers", description: "Citrus\u2011marinated shrimp with cucumbers, tomatoes, jalape\u00f1os & red onion, topped with avocado." },
      { name: "Black & Blue Bites", price: "$12", category: "Appetizers", description: "Saut\u00e9ed blackened beef tips served with crostini." },
      { name: "Cajun Fried Pickles", price: "$10", category: "Appetizers", description: "With house\u2011made ranch." },
      { name: "Mozzarella Sticks", price: "$11", category: "Appetizers", description: "With marinara." },
      { name: "Coconut Shrimp", price: "$11", category: "Appetizers", description: "With tropical marmalade." },
      { name: "Fried Green Tomatoes", price: "$11", category: "Appetizers", description: "Topped with mornay sauce, tomatoes, green onions, Parmesan & parsley." },
      { name: "Crab Stuffed Mushrooms", price: "$14", category: "Appetizers", description: "Broiled, topped with Parmesan scampi butter." },
      { name: "Bacon Wrapped Jalape\u00f1os", price: "$14", category: "Appetizers", description: "Cream cheese stuffed." },
      { name: "Blue Crab Claws", price: "MP", category: "Appetizers", description: "Fried or saut\u00e9ed." },
      { name: "Peel n\u2019 Eat Shrimp (\u00bd lb)", price: "$13", category: "Appetizers", description: "Boiled shrimp, served hot or cold." },
      { name: "Shrimp Nachos", price: "$14", category: "Appetizers", description: "Mornay over fried pita points with grilled popcorn shrimp, green onions & tomatoes." },
      { name: "Seafood Gumbo", price: "Cup $8 / Bowl $10", category: "Soups & Salads", description: "Dark Creole roux with shrimp, crab meat & fish." },
      { name: "Lobster Chowder", price: "Cup $8 / Bowl $10", category: "Soups & Salads", description: "Light & creamy with lobster, corn & carrots." },
      { name: "Summer Salad", price: "$16", category: "Soups & Salads", description: "Mixed greens, mandarin oranges, almonds, strawberries, blue cheese crumbles, craisins, candied pecans, croutons & sesame Asian dressing." },
      { name: "Iceberg Wedge", price: "$12", category: "Soups & Salads", description: "Iceberg, blue cheese crumbles, bacon, cherry tomatoes & Bayou blue cheese dressing." },
      { name: "Classic Caesar", price: "$12", category: "Soups & Salads", description: "Romaine hearts, creamy Caesar, shredded Parmesan & ground pepper." },
      { name: "Steak Salad", price: "$18", category: "Soups & Salads", description: "Mixed greens, cucumber, corn, cherry tomatoes, pickled red onions, feta & marinated beef tips with balsamic vinaigrette." },
      { name: "Salad Bar \u2013 Lunch One Trip", price: "$12", category: "Soups & Salads", description: "" },
      { name: "Salad Bar \u2013 Lunch All You Can Eat", price: "$14", category: "Soups & Salads", description: "" },
      { name: "Salad Bar \u2013 Lunch To\u2011Go", price: "$10 per lb", category: "Soups & Salads", description: "" },
      { name: "Salad Bar \u2013 Dinner One Trip", price: "$10", category: "Soups & Salads", description: "" },
      { name: "Salad Bar \u2013 Dinner All You Can Eat", price: "$12", category: "Soups & Salads", description: "" },
      { name: "Salad Bar \u2013 Dinner To\u2011Go", price: "$8 per lb", category: "Soups & Salads", description: "" },
      { name: "Captains Platter", price: "$45", category: "Seafood Dinners", description: "Stuffed crab, whitefish, scallops, Gulf shrimp & lobster tail, perfectly broiled." },
      { name: "Wolf Bay Platter", price: "$42", category: "Seafood Dinners", description: "Cup of Seafood Gumbo, stuffed crab, stuffed shrimp, whitefish, Gulf shrimp & oysters, fried to perfection." },
      { name: "Whole Gulf Flounder", price: "$30", category: "Seafood Dinners", description: "Fried or broiled." },
      { name: "Whole Crab Stuffed Flounder", price: "$38", category: "Seafood Dinners", description: "Broiled with lemon\u2011garlic butter & house crab stuffing." },
      { name: "Peel n\u2019 Eat Shrimp (1 lb)", price: "$27", category: "Seafood Dinners", description: "Served hot or cold." },
      { name: "Snow Crab Legs (1 lb)", price: "MP", category: "Seafood Dinners", description: "Seasoned & steamed with corn coblet and baby potatoes." },
      { name: "Stuffed Shrimp", price: "$26", category: "Seafood Dinners", description: "4 Gulf shrimp with house seafood stuffing, fried or broiled." },
      { name: "Lump Crab Cake Dinner", price: "MP", category: "Seafood Dinners", description: "Lump crab cakes over Greek lemon rice with remoulade & red cabbage slaw." },
      { name: "Catfish", price: "$23", category: "Seafood Dinners", description: "Southern fried favorite, Cajun breaded. (USA farm\u2011raised)" },
      { name: "Sea Scallops", price: "$39", category: "Seafood Dinners", description: "Best served broiled or grilled." },
      { name: "Create Your Platter (2 items)", price: "$28", category: "Seafood Dinners", description: "Choose 2: Gulf shrimp, whitefish, oysters, popcorn shrimp, stuffed crab, fried coconut shrimp." },
      { name: "Create Your Platter (3 items)", price: "$34", category: "Seafood Dinners", description: "Choose 3: Gulf shrimp, whitefish, oysters, popcorn shrimp, stuffed crab, fried coconut shrimp." },
      { name: "Filet*", price: "$39", category: "Land Lovers", description: "8 oz hand\u2011cut Black Angus beef tenderloin." },
      { name: "Ribeye*", price: "$38", category: "Land Lovers", description: "14 oz hand\u2011cut Black Angus ribeye." },
      { name: "Pork Chop", price: "$32", category: "Land Lovers", description: "12 oz grilled French\u2011cut chop with honey\u2011garlic\u2011pineapple gastrique & red cabbage slaw." },
      { name: "Chicken Tender Dinner", price: "$22", category: "Land Lovers", description: "Fried or grilled." },
      { name: "Mediterranean Fresh Catch", price: "MP", category: "Perfect Pairings", description: "Blackened fresh catch, heirloom tomatoes, olive tapenade & feta; truffle mashed potatoes & saut\u00e9ed spinach." },
      { name: "Drunken Fresh Catch", price: "MP", category: "Perfect Pairings", description: "Golden panko\u2011crusted fresh catch topped with blueberry\u2011bourbon compote; truffle mashed potatoes & saut\u00e9ed spinach." },
      { name: "Pontchartrain Fresh Catch", price: "MP", category: "Perfect Pairings", description: "Grilled fresh catch over Greek lemon rice with crawfish Julie sauce & seasonal vegetable." },
      { name: "Parmesan Crusted Grouper", price: "MP", category: "Perfect Pairings", description: "Lemon\u2011butter caper sauce over truffle mashed potatoes with saut\u00e9ed spinach." },
      { name: "Chicken Marsala", price: "$28", category: "Perfect Pairings", description: "Pan\u2011seared chicken breast with mushroom\u2011marsala sauce; truffle mashed potatoes & saut\u00e9ed spinach." },
      { name: "Chicken Fried Lobster", price: "$45", category: "Perfect Pairings", description: "Two fried lobster tails, Greek lemon rice, seasonal veg & clarified butter." },
      { name: "Island Mahi Mahi", price: "$30", category: "Perfect Pairings", description: "Blackened, topped with mango\u2011pineapple pico; Greek lemon rice & red cabbage slaw." },
      { name: "Signature Shrimp & Grits", price: "$26", category: "Pasta & Grits", description: "Smoked Gouda grit cake with mornay, saut\u00e9ed shrimp, green onions & diced tomatoes; topped with Parmesan & parsley." },
      { name: "Pasta Alfredo", price: "$16", category: "Pasta & Grits", description: "House alfredo sauce over penne, topped with Parmesan & parsley." },
      { name: "Traditional Seafood Pasta", price: "$27", category: "Pasta & Grits", description: "Scallops, shrimp & Cajun tasso ham with Cajun alfredo over penne; topped with Parmesan & parsley." },
      { name: "Shrimp Scampi", price: "$24", category: "Pasta & Grits", description: "Gulf shrimp in herb\u2011garlic butter over angel hair; green onions, Parmesan & parsley." },
      { name: "Grilled Mahi Sandwich", price: "$16", category: "Sandwiches", description: "Toasted sourdough bun with pickled red onion & remoulade." },
      { name: "Po Boys \u2013 Shrimp", price: "$16", category: "Sandwiches", description: "Hoagie roll, shredded lettuce." },
      { name: "Po Boys \u2013 Whitefish", price: "$16", category: "Sandwiches", description: "Hoagie roll, shredded lettuce." },
      { name: "Po Boys \u2013 Catfish", price: "$16", category: "Sandwiches", description: "Hoagie roll, shredded lettuce." },
      { name: "Po Boys \u2013 Oysters", price: "$19", category: "Sandwiches", description: "Hoagie roll, shredded lettuce." },
      { name: "Grouper Reuben", price: "$22", category: "Sandwiches", description: "Grilled grouper on rye, coleslaw, 1000 island & Swiss." },
      { name: "Lobster Roll", price: "$27", category: "Sandwiches", description: "Garlic\u2011butter toasted roll with lobster, arugula, celery & onion; lemon; side of dill aioli." },
      { name: "Fried Green Tomato BLT", price: "$15", category: "Sandwiches", description: "Texas toast, dill aioli & pecan\u2011smoked bacon." },
      { name: "Wolf Bay Burger*", price: "$16", category: "Sandwiches", description: "Angus steak patty, sourdough bun, white American cheese, caramelized onions & bacon." },
      { name: "Bacon Brie Burger*", price: "$16", category: "Sandwiches", description: "Angus steak patty, sourdough bun, bacon, brie & Chipotle aioli." },
      { name: "BBQ Cheddar Burger*", price: "$15", category: "Sandwiches", description: "Angus steak patty, sourdough bun, BBQ sauce, cheddar & crispy onion straws." },
      { name: "Island Jerk Chicken", price: "$15", category: "Sandwiches", description: "Red cabbage slaw & mango\u2011pineapple pico; spicy peach sauce; toasted sourdough bun." },
      { name: "Small Plates \u2013 Shrimp", price: "$16", category: "Lunch Menu", description: "" },
      { name: "Small Plates \u2013 Oysters", price: "$18", category: "Lunch Menu", description: "" },
      { name: "Small Plates \u2013 Shrimp & Oysters", price: "$18", category: "Lunch Menu", description: "" },
      { name: "Chicken Tenders", price: "$16", category: "Lunch Menu", description: "Grilled or fried." },
      { name: "Shrimp & Grits", price: "$18", category: "Lunch Menu", description: "Smoked Gouda grit cake with mornay, saut\u00e9ed shrimp, green onions & diced tomatoes." },
      { name: "Chicken Parmesan", price: "$18", category: "Lunch Menu", description: "Panko\u2011crusted chicken breast with marinara & mozzarella over angel hair." },
      { name: "Mahi Mahi Tacos", price: "$18", category: "Lunch Menu", description: "Blackened with mango\u2011pineapple pico de gallo." },
      { name: "Bang Bang Tacos", price: "$18", category: "Lunch Menu", description: "Fried Gulf shrimp tossed in sriracha\u2011sweet chili aioli with red cabbage slaw." },
      { name: "Cajun Whitefish", price: "$16", category: "Lunch Menu", description: "Grilled whitefish over Greek lemon rice with Cajun cream sauce." },
      { name: "Hamburger Steak", price: "$16", category: "Lunch Menu", description: "With grilled onion & mushroom gravy." },
      { name: "Bourbon Shrimp", price: "$16", category: "Lunch Menu", description: "Grilled shrimp over Greek lemon rice with bourbon glaze." },
      { name: "Chicken Tenders", price: "$7", category: "Kids Menu", description: "Served with fries or fruit." },
      { name: "Cheese Pizza", price: "$7", category: "Kids Menu", description: "Served with fries or fruit." },
      { name: "Fried Fish", price: "$7", category: "Kids Menu", description: "Served with fries or fruit." },
      { name: "Popcorn Shrimp", price: "$7", category: "Kids Menu", description: "Served with fries or fruit." },
      { name: "Kids Cheeseburger", price: "$7", category: "Kids Menu", description: "White American & pickles. Served with fries or fruit." },
      { name: "Kids Mac & Cheese", price: "$7", category: "Kids Menu", description: "Alfredo or marinara." },
      { name: "Kids Pasta", price: "$10", category: "Kids Menu", description: "Alfredo or marinara sauce." },
      { name: "Kids Smoothies", price: "$6", category: "Kids Menu", description: "Strawberry or pi\u00f1a colada; with or without whipped cream." },
      { name: "Kids Soft Drink", price: "$2", category: "Kids Menu", description: "" },
      { name: "Souvenir Kids Cup \u2013 Soft Drink", price: "$10.95", category: "Kids Menu", description: "Drink included." },
      { name: "Souvenir Kids Cup \u2013 Smoothie", price: "$13.95", category: "Kids Menu", description: "Drink included." },
      { name: "French Fries", price: "$5", category: "Sides", description: "" },
      { name: "Mac & Cheese", price: "$5", category: "Sides", description: "" },
      { name: "Seasonal Veg", price: "$5", category: "Sides", description: "" },
      { name: "Baked Potato", price: "$5", category: "Sides", description: "" },
      { name: "Truffle Mashed Potatoes", price: "$5", category: "Sides", description: "" },
      { name: "Brussel Sprouts", price: "$5", category: "Sides", description: "" },
      { name: "Red Cabbage Slaw", price: "$5", category: "Sides", description: "" },
      { name: "Smoked Gouda Grits", price: "$5", category: "Sides", description: "" }
    ],
    drinks: [

    ]
  },
  {
    id: "sweet-retreat",
    name: "Sweet Retreat Ice Cream & Desserts",
    category: "sweets",
    cuisine: "Ice Cream • Desserts • Treats",
    location: "Orange Beach",
    address: "25900 Perdido Beach Blvd, Orange Beach, AL 36561",
    coordinates: { lat: 30.2760, lng: -87.5650 },
    phone: "(251) 555-0200",
    website: "https://sweetretreat.com",
    image: "https://picsum.photos/seed/sweet-retreat/400/300",
    tags: ["Ice Cream", "Desserts", "Family Friendly", "Outdoor Seating"],
    description: "Premium ice cream shop featuring homemade flavors, sundaes, milkshakes, and decadent desserts. The perfect sweet escape!",
    hours: "Daily 11am-11pm",
    menu: [
      { name: "Single Scoop", price: "$4.50", category: "Ice Cream", description: "Choice of flavor" },
      { name: "Double Scoop", price: "$7.00", category: "Ice Cream", description: "Two scoops, two flavors" },
      { name: "Waffle Cone", price: "+$1.50", category: "Ice Cream", description: "Fresh made waffle cone" },
      { name: "Brownie Sundae", price: "$8.50", category: "Sundaes", description: "Warm brownie with ice cream, hot fudge, whipped cream" },
      { name: "Banana Split", price: "$9.50", category: "Sundaes", description: "Three scoops with toppings" },
      { name: "Milkshake", price: "$6.50", category: "Shakes", description: "Classic thick milkshake" },
      { name: "Cookie Sandwich", price: "$5.50", category: "Desserts", description: "Ice cream between two fresh cookies" }
    ],
    drinks: []
  },
  {
    id: "coastal-bakery",
    name: "Coastal Bakery & Cafe",
    category: "coffee",
    cuisine: "Bakery • Coffee • Sandwiches",
    location: "Gulf Shores",
    address: "1200 Gulf Shores Pkwy, Gulf Shores, AL 36542",
    coordinates: { lat: 30.2680, lng: -87.6900 },
    phone: "(251) 555-0300",
    website: "https://coastalbakery.com",
    image: "https://picsum.photos/seed/coastal-bakery/400/300",
    tags: ["Bakery", "Coffee", "Breakfast", "Lunch"],
    description: "Artisan bakery serving fresh-baked goods, specialty coffee, and made-to-order sandwiches. Everything made from scratch daily!",
    hours: "Daily 7am-3pm",
    menu: [
      { name: "Cinnamon Roll", price: "$4.50", category: "Pastries", description: "Large homemade cinnamon roll with cream cheese frosting" },
      { name: "Chocolate Croissant", price: "$4.00", category: "Pastries", description: "Buttery croissant filled with chocolate" },
      { name: "Scone", price: "$3.50", category: "Pastries", description: "Daily flavors" },
      { name: "Bagel with Cream Cheese", price: "$4.50", category: "Breakfast", description: "Fresh baked bagel" },
      { name: "Avocado Toast", price: "$8.50", category: "Breakfast", description: "Sourdough with avocado, tomato, everything seasoning" },
      { name: "Turkey Club", price: "$9.50", category: "Lunch", description: "Turkey, bacon, lettuce, tomato on fresh bread" },
      { name: "Cappuccino", price: "$4.50", category: "Coffee", description: "Espresso with foamed milk" }
    ],
    drinks: []
  },
  {
    id: "sugar-shack",
    name: "The Sugar Shack",
    category: "sweets",
    cuisine: "Candy • Fudge • Chocolates",
    location: "Orange Beach",
    address: "4851 Wharf Pkwy, Orange Beach, AL 36561",
    coordinates: { lat: 30.2803, lng: -87.5472 },
    phone: "(251) 555-0400",
    website: "https://sugarshack.com",
    image: "https://picsum.photos/seed/sugar-shack/400/300",
    tags: ["Candy Store", "Fudge", "Chocolates", "Gifts"],
    description: "Old-fashioned candy store featuring homemade fudge, salt water taffy, chocolates, and nostalgic candies. A sweet tooth's paradise!",
    hours: "Daily 10am-9pm",
    menu: [
      { name: "Homemade Fudge", price: "$12.99/lb", category: "Fudge", description: "Multiple flavors made fresh daily" },
      { name: "Salt Water Taffy", price: "$8.99/lb", category: "Candy", description: "Classic beach treat" },
      { name: "Chocolate Truffles", price: "$3.50 each", category: "Chocolates", description: "Handmade premium truffles" },
      { name: "Caramel Apples", price: "$6.50", category: "Treats", description: "Fresh apples dipped in caramel" },
      { name: "Pralines", price: "$4.50 each", category: "Candy", description: "Southern pecan pralines" }
    ],
    drinks: []
  }
];

// GCR Imported Businesses
const gcrBusinesses = [
  {
    id: "agave-mexican",
    name: "Agave Mexican Cantina – Gulf Shores",
    category: "restaurants",
    cuisine: "Mexican",
    location: "Gulf Shores",
    address: "1207 Gulf Shores Pkwy, Gulf Shores AL 36542",
    phone: "(251) 968-5055",
    website: "https://agavemexicanrestaurants.com",
    image: "https://picsum.photos/seed/agave-mexican/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Mexican", "Open Late"],
    description: "Trendy Mexican spot with bar scene",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "avenue-pub",
    name: "Avenue Pub (Gulf Shores)",
    category: "restaurants",
    cuisine: "American • Bistro",
    location: "Gulf Shores",
    address: "114 W 2nd Ave, Gulf Shores, AL 36542",
    phone: "(251) 948-2627",
    website: "https://avenuepubgulfshores.com",
    image: "https://picsum.photos/seed/avenue-pub/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Cocktail Lounge", "Open Late", "American"],
    description: "Modern bistro with craft cocktails and elevated bar fare",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "bahama-bobs",
    name: "Bahama Bob's Beach Side Café",
    category: "restaurants",
    cuisine: "Seafood • Waterfront",
    location: "Gulf Shores",
    address: "601 W Beach Blvd, Gulf Shores, AL 36542",
    phone: "(251) 948-2100",
    website: "",
    image: "https://picsum.photos/seed/bahama-bobs/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Seafood", "Happy Hour", "Waterfront"],
    description: "Waterfront; family-friendly; seafood classics",
    hours: "Daily 10am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "beach-girl-coffee",
    name: "Beach Girl Coffee (Orange Beach)",
    category: "coffee",
    cuisine: "Coffee",
    location: "Orange Beach",
    address: "25122 Canal Rd, Orange Beach AL 36561",
    phone: "(251) 233-8249",
    website: "",
    image: "https://picsum.photos/seed/beach-girl-coffee/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour"],
    description: "Drive-thru espresso hut; female-owned",
    hours: "Daily 6am–3pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "beach-house-kitchen",
    name: "The Beach House Kitchen & Cocktails",
    category: "restaurants",
    cuisine: "American • Bar",
    location: "Gulf Shores",
    address: "1154 W Beach Blvd, Gulf Shores AL 36542",
    phone: "(251) 948-2431",
    website: "https://beachhousegs.com",
    image: "https://picsum.photos/seed/beach-house-kitchen/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "American", "Happy Hour", "Casual", "Live Music", "Bars & Taverns"],
    description: "Casual beach bar & grill",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "big-beach-brewing",
    name: "Big Beach Brewing Company",
    category: "restaurants",
    cuisine: "Brewery",
    location: "Gulf Shores",
    address: "300 E 24th Ave, Gulf Shores, AL 36542",
    phone: "(251) 948-2337",
    website: "https://bigbeachbrewing.com",
    image: "https://picsum.photos/seed/big-beach-brewing/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Breweries", "Happy Hour", "Live Music", "Pet Friendly"],
    description: "Pet-friendly beer garden with firepits",
    hours: "Daily 12pm–10pm (11pm Fri–Sat)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "big-fish",
    name: "Big Fish Restaurant & Bar",
    category: "restaurants",
    cuisine: "Seafood • Sushi",
    location: "Orange Beach",
    address: "25814 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 981-5516",
    website: "https://bigfishrestaurantbar.com",
    image: "https://picsum.photos/seed/big-fish/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Sushi", "Seafood", "Happy Hour", "Romantic", "Fine Dining", "Bars & Taverns"],
    description: "Upscale seafood & sushi; romantic ambience",
    hours: "Mon–Sat 4pm–9pm (Closed Sunday)",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "big-mikes-bbq",
    name: "Big Mike's BBQ (Foley)",
    category: "restaurants",
    cuisine: "BBQ",
    location: "Gulf Shores",
    address: "711 N McKenzie St, Foley, AL 36535",
    phone: "(251) 943-6453",
    website: "https://bigmikesbbq.net",
    image: "https://picsum.photos/seed/big-mikes-bbq/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "BBQ"],
    description: "Award-winning ribs & smoked meats",
    hours: "Mon–Sat 11am–8pm (Closed Sun)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "big-mikes-steakhouse",
    name: "Big Mike's Steakhouse (Orange Beach)",
    category: "restaurants",
    cuisine: "Steakhouse",
    location: "Orange Beach",
    address: "25638 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 981-6453",
    website: "https://bigmikessteakhouse.com",
    image: "https://picsum.photos/seed/big-mikes-steakhouse/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Steakhouse"],
    description: "Southern steakhouse",
    hours: "Tue–Sat 4–9pm (Closed Sun–Mon)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "bleus-burger",
    name: "Bleus Burger (Gulf Shores)",
    category: "restaurants",
    cuisine: "Burgers • American",
    location: "Gulf Shores",
    address: "3800 Gulf Shores Pkwy Ste 240, Gulf Shores AL 36542",
    phone: "(251) 948-2538",
    website: "https://bleusburger.com",
    image: "https://picsum.photos/seed/bleus-burger/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "American", "Happy Hour", "Burgers"],
    description: "Family-friendly craft burger spot",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "bolo-steak-seafood",
    name: "Bolo Steak & Seafood",
    category: "restaurants",
    cuisine: "Steakhouse • Seafood",
    location: "Orange Beach",
    address: "27370 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 345-6739",
    website: "https://bolorestaurantoba.com",
    image: "https://picsum.photos/seed/bolo-steak-seafood/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Fine Dining", "Steakhouse"],
    description: "Upscale steak & seafood with Cook Your Catch",
    hours: "Tue–Thu 4–9pm; Fri–Sat 4–10pm; Sun 4–9pm (Closed Mon)",


    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "brick-oven",
    name: "The Brick Oven (Orange Beach)",
    category: "restaurants",
    cuisine: "Pizza • Italian",
    location: "Orange Beach",
    address: "21040 State Hwy 180, Orange Beach AL 36561",
    phone: "(251) 981-3543",
    website: "https://thebrickovenob.com",
    image: "https://picsum.photos/seed/brick-oven/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Happy Hour", "Pizza", "Italian"],
    description: "Brick-fired pizzeria with family dining",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "brick-spoon",
    name: "Brick & Spoon (Orange Beach)",
    category: "restaurants",
    cuisine: "Brunch • Breakfast",
    location: "Orange Beach",
    address: "24705 Canal Rd, Orange Beach AL 36561",
    phone: "(251) 981-7772",
    website: "https://brickandspoon.com",
    image: "https://picsum.photos/seed/brick-spoon/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Fine Dining", "Breakfast / Brunch", "Cocktail Lounge"],
    description: "Upscale brunch & cocktail café",
    hours: "Daily 7am–2pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "buzzcatz-coffee",
    name: "BuzzCatz Coffee & Sweets (Orange Beach)",
    category: "coffee",
    cuisine: "Coffee • Bakery",
    location: "Orange Beach",
    address: "25689 Canal Rd, Orange Beach AL 36561",
    phone: "(251) 980-2899",
    website: "https://buzzcatzcoffee.com",
    image: "https://picsum.photos/seed/buzzcatz-coffee/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour", "Local Favorite"],
    description: "Local bakery café by Cosmo's group",
    hours: "Daily 6:30am–3pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cactus-cantina-gs",
    name: "Cactus Cantina – Gulf Shores",
    category: "restaurants",
    cuisine: "Mexican • Tex-Mex",
    location: "Gulf Shores",
    address: "3849 Gulf Shores Pkwy, Gulf Shores AL 36542",
    phone: "(251) 948-3100",
    website: "https://cactuscantinagulfshores.com",
    image: "https://picsum.photos/seed/cactus-cantina-gs/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Happy Hour", "Mexican", "Outdoor Seating"],
    description: "Family Tex-Mex with colorful patio",
    hours: "Sun–Thu 11am–9:30pm; Fri–Sat 11am–10:30pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cactus-cantina-ob",
    name: "Cactus Cantina – Orange Beach",
    category: "restaurants",
    cuisine: "Mexican",
    location: "Orange Beach",
    address: "25908 Canal Rd, Orange Beach AL 36561",
    phone: "(251) 981-8565",
    website: "https://cactuscantinaob.com",
    image: "https://picsum.photos/seed/cactus-cantina-ob/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Happy Hour", "Mexican", "Waterfront", "Live Music"],
    description: "Waterfront Mexican grill with open-air bar",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cafe-beignet-gs",
    name: "Café Beignet (Gulf Shores)",
    category: "coffee",
    cuisine: "Cafe • Beignets",
    location: "Gulf Shores",
    address: "208 W Fort Morgan Rd, Gulf Shores AL 36542",
    phone: "(251) 948-2311",
    website: "",
    image: "https://picsum.photos/seed/cafe-beignet-gs/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour"],
    description: "French-Quarter style beignet café; cash discount offered",
    hours: "Daily 6:30am–12pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cafe-beignet-ob",
    name: "Café Beignet (Orange Beach)",
    category: "coffee",
    cuisine: "Cafe • Beignets",
    location: "Orange Beach",
    address: "25405 Perdido Beach Blvd Ste 22, Orange Beach AL 36561",
    phone: "(251) 981-2711",
    website: "",
    image: "https://picsum.photos/seed/cafe-beignet-ob/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour", "Outdoor Seating"],
    description: "French pastry café with small patio seating",
    hours: "Daily 6:30am–12pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "chocolate-corner",
    name: "Chocolate Corner & Ice Cream",
    category: "sweets",
    cuisine: "Candy • Ice Cream",
    location: "Gulf Shores",
    address: "200 W Fort Morgan Rd, Gulf Shores AL 36542",
    phone: "(251) 948-2462",
    website: "https://chocolatecorner.net",
    image: "https://picsum.photos/seed/chocolate-corner/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Ice Cream / Desserts", "Local Favorite"],
    description: "Local candy and fudge shop since 2000",
    hours: "Mon–Sat 10am–7pm; Sun 12–6pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "coastal-orange-beach",
    name: "CoastAL (Orange Beach)",
    category: "restaurants",
    cuisine: "Seafood • Beachfront",
    location: "Orange Beach",
    address: "25722 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 240-6001",
    website: "https://coastalorangebeach.com",
    image: "https://picsum.photos/seed/coastal-orange-beach/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Live Music", "Beachfront"],
    description: "Beachfront; retail & restaurant complex",
    hours: "Breakfast 8am–2pm; Beach Bar 11am–10pm; Dinner 4–9pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cosmos-restaurant",
    name: "Cosmo's Restaurant & Bar (Orange Beach)",
    category: "restaurants",
    cuisine: "Seafood • American",
    location: "Orange Beach",
    address: "25753 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 948-9663",
    website: "https://cosmosrestaurantandbar.com",
    image: "https://picsum.photos/seed/cosmos-restaurant/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "American", "Happy Hour", "Bars & Taverns"],
    description: "American-fusion seafood & steaks",
    hours: "Daily 11am–10pm",


    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cottons",
    name: "Cotton's Restaurant & Lounge",
    category: "restaurants",
    cuisine: "Steakhouse • Seafood",
    location: "Orange Beach",
    address: "26009 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 981-9268",
    website: "https://cottonsrestaurant.com",
    image: "https://picsum.photos/seed/cottons/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Steakhouse", "Open Late", "Seafood"],
    description: "Classic steak & seafood house with sunset views",
    hours: "Tue–Sun 4pm–10pm (Closed Mon)",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cove-bar-grill",
    name: "The Cove Bar & Grill (Gulf Shores)",
    category: "restaurants",
    cuisine: "American • Bar",
    location: "Gulf Shores",
    address: "131 E 18th Ave, Gulf Shores AL 36542",
    phone: "(251) 968-5353",
    website: "https://thecovebarandgrill.com",
    image: "https://picsum.photos/seed/cove-bar-grill/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Bars & Taverns", "American"],
    description: "Neighborhood hangout with pub food and games",
    hours: "Mon–Sat 11am–10pm; Sun 11am–8pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "crab-trap-perdido",
    name: "The Crab Trap (Perdido Key)",
    category: "restaurants",
    cuisine: "Seafood • Beachfront",
    location: "Gulf Shores",
    address: "16495 Perdido Key Dr, Pensacola, FL 32507",
    phone: "(850) 492-8888",
    website: "https://crabtrapflorida.com",
    image: "https://picsum.photos/seed/crab-trap-perdido/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Beachfront", "Family Friendly", "Open Late", "Seafood"],
    description: "Beachfront family seafood",
    hours: "Mon–Thu 11am–9pm; Fri–Sat 11am–10pm; Sun 11am–9pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "cricos-pizza",
    name: "Crico's Pizza & Subs",
    category: "restaurants",
    cuisine: "Pizza",
    location: "Gulf Shores",
    address: "309 Gulf Shores Pkwy #68, Gulf Shores AL 36542",
    phone: "(251) 948-3100",
    website: "https://cricospizza.com",
    image: "https://picsum.photos/seed/cricos-pizza/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Casual", "Pizza"],
    description: "Casual counter-service pizzeria",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "desotos-seafood",
    name: "De Soto's Seafood Kitchen (Gulf Shores)",
    category: "restaurants",
    cuisine: "Seafood • Southern",
    location: "Gulf Shores",
    address: "138 W 1st Ave, Gulf Shores, AL 36542",
    phone: "(251) 948-7294",
    website: "",
    image: "https://picsum.photos/seed/desotos-seafood/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Local Favorite", "Seafood"],
    description: "Seafood; Southern; family favorite",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "dippindots-wharf",
    name: "Dippin' Dots (The Wharf)",
    category: "sweets",
    cuisine: "Ice Cream",
    location: "Orange Beach",
    address: "4830 Main St Ste G112, Orange Beach AL 36561",
    phone: "(251) 224-3687",
    website: "",
    image: "https://picsum.photos/seed/dippindots-wharf/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Ice Cream / Desserts", "Open Late"],
    description: "Franchise ice-cream stand on The Wharf boardwalk",
    hours: "Daily 11am–9pm (summer til 10pm)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "docs-seafood",
    name: "Doc's Seafood & Steaks",
    category: "restaurants",
    cuisine: "Seafood • Steaks",
    location: "Orange Beach",
    address: "26029 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 981-6999",
    website: "",
    image: "https://picsum.photos/seed/docs-seafood/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Local Favorite", "Casual", "Steakhouse"],
    description: "Casual seafood & steaks; Locals favorite",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "down-south-bbq",
    name: "Down South BBQ (Foley)",
    category: "restaurants",
    cuisine: "BBQ",
    location: "Gulf Shores",
    address: "19891 Co Rd 10, Foley, AL 36535",
    phone: "(251) 955-6622",
    website: "https://downsouthbbq.com",
    image: "https://picsum.photos/seed/down-south-bbq/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["BBQ", "Casual", "Outdoor Seating"],
    description: "Casual outdoor BBQ hut",
    hours: "Wed–Sat 10:30am–7pm (Closed Sun–Tue)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "efes-greek",
    name: "Efe's Greek Kitchen (Gulf Shores)",
    category: "restaurants",
    cuisine: "Greek",
    location: "Gulf Shores",
    address: "200 W 23rd Ave, Gulf Shores AL 36542",
    phone: "(251) 948-7862",
    website: "https://efesgreekkitchen.com",
    image: "https://picsum.photos/seed/efes-greek/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Greek", "Family Friendly", "Open Late"],
    description: "Authentic Crete-style family restaurant",
    hours: "Mon–Sat 11am–9pm; Sun 11am–8pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "fish-river-grill",
    name: "Fish River Grill #3 (Gulf Shores)",
    category: "restaurants",
    cuisine: "Seafood • Southern",
    location: "Gulf Shores",
    address: "1545 Gulf Shores Pkwy, Gulf Shores, AL 36542",
    phone: "(251) 948-1110",
    website: "https://fishrivergrillgs.com",
    image: "https://picsum.photos/seed/fish-river-grill/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Seafood"],
    description: "Southern comfort & seafood",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "flora-bama-lounge",
    name: "Flora-Bama Lounge & Oyster Bar",
    category: "restaurants",
    cuisine: "Bar • Live Music",
    location: "Gulf Shores",
    address: "17401 Perdido Key Dr, Perdido Key FL 32507",
    phone: "(850) 492-0611",
    website: "https://florabama.com",
    image: "https://picsum.photos/seed/flora-bama-lounge/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Bars & Taverns"],
    description: "World-famous state-line beach bar & festival venue",
    hours: "Daily 9am–3am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "flora-bama-ole-river",
    name: "Flora-Bama Ole River Grill",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Gulf Shores",
    address: "17400 Perdido Key Dr, Perdido Key FL 32507",
    phone: "(850) 483-6272",
    website: "https://florabamaolerivergrill.com",
    image: "https://picsum.photos/seed/flora-bama-ole-river/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Family Friendly", "Open Late", "Seafood"],
    description: "Family restaurant side of Flora-Bama complex",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "flora-bama-yacht",
    name: "Flora-Bama Yacht Club",
    category: "restaurants",
    cuisine: "Seafood • Waterfront",
    location: "Gulf Shores",
    address: "17350 Perdido Key Dr, Perdido Key FL 32507",
    phone: "(850) 483-6272",
    website: "https://florabayachtclub.com",
    image: "https://picsum.photos/seed/flora-bama-yacht/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Waterfront", "Live Music", "Boat Access"],
    description: "Dock-up waterfront dining with tropical menu",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "foam-coffee",
    name: "Foam Coffee (Gulf Shores)",
    category: "coffee",
    cuisine: "Coffee",
    location: "Gulf Shores",
    address: "103 W 18th Ave, Gulf Shores AL 36542",
    phone: "(251) 948-2929",
    website: "https://foamcoffee.com",
    image: "https://picsum.photos/seed/foam-coffee/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour"],
    description: "Modern espresso bar & community space",
    hours: "Daily 7am–3pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "gelato-joes",
    name: "Gelato Joe's (Foley)",
    category: "restaurants",
    cuisine: "Italian • Gelato",
    location: "Gulf Shores",
    address: "202 E Michigan Ave, Foley AL 36535",
    phone: "(251) 943-4845",
    website: "https://gelatojoes.com",
    image: "https://picsum.photos/seed/gelato-joes/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Happy Hour", "Italian", "Live Music", "Pet Friendly", "Ice Cream / Desserts", "Outdoor Seating"],
    description: "Family Italian eatery & gelato bar with large pet-friendly patio",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "groovy-goat",
    name: "Groovy Goat (The Wharf)",
    category: "restaurants",
    cuisine: "Sports Bar • Arcade",
    location: "Orange Beach",
    address: "4776 Main St Ste L208, Orange Beach, AL 36561",
    phone: "(251) 424-1700",
    website: "https://groovygoat.com",
    image: "https://picsum.photos/seed/groovy-goat/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Sports Bar", "Open Late", "Bars & Taverns"],
    description: "Sports bar + arcade",
    hours: "Sun–Thu 11am–10pm; Fri–Sat 11am–12am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "gts-on-the-bay",
    name: "GT's on the Bay",
    category: "restaurants",
    cuisine: "Seafood • Waterfront",
    location: "Orange Beach",
    address: "26189 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 980-8400",
    website: "https://gtsonthebay.com",
    image: "https://picsum.photos/seed/gts-on-the-bay/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Waterfront", "Live Music"],
    description: "Waterfront deck; aquarium bar",
    hours: "Sun–Thu 11am–9:30pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "gulf-island-grill",
    name: "Gulf Island Grill",
    category: "restaurants",
    cuisine: "Seafood • Caribbean",
    location: "Gulf Shores",
    address: "244 E Beach Blvd, Gulf Shores, AL 36542",
    phone: "(251) 968-4440",
    website: "https://gulfislandgrill.co",
    image: "https://picsum.photos/seed/gulf-island-grill/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Caribbean", "Seafood"],
    description: "Caribbean-style seafood & steaks",
    hours: "Daily 11am–Till (~10pm)",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "gulf-shores-steamer",
    name: "Gulf Shores Steamer",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Orange Beach",
    address: "27267 Perdido Beach Blvd #115, Orange Beach, AL 36561",
    phone: "(251) 948-6344",
    website: "https://gulfshoressteamer.com",
    image: "https://picsum.photos/seed/gulf-shores-steamer/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Seafood"],
    description: "All steamed, nothing fried",
    hours: "Daily 12pm–9pm",



    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "hazels-nook",
    name: "Hazel's Nook (Gulf Shores)",
    category: "restaurants",
    cuisine: "Diner • Breakfast",
    location: "Gulf Shores",
    address: "120 E Fort Morgan Rd, Gulf Shores AL 36542",
    phone: "(251) 968-7065",
    website: "https://hazelsnook.com",
    image: "https://picsum.photos/seed/hazels-nook/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Breakfast / Brunch", "Local Favorite"],
    description: "Oldest local diner since 1957",
    hours: "Daily 7am–2pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "high-tide-daiquiris",
    name: "High Tide Daiquiris & Mimosas (Gulf Shores)",
    category: "restaurants",
    cuisine: "Bar • Cocktails",
    location: "Gulf Shores",
    address: "3800 Gulf Shores Pkwy Ste 240, Gulf Shores AL 36542",
    phone: "(251) 968-1410",
    website: "",
    image: "https://picsum.photos/seed/high-tide-daiquiris/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Cocktail Lounge", "Happy Hour", "Karaoke", "Bars & Taverns"],
    description: "Neon-themed cocktail lounge",
    hours: "Daily 10am–12am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "hog-wild-bbq",
    name: "Hog Wild Beach & BBQ (Gulf Shores)",
    category: "restaurants",
    cuisine: "BBQ",
    location: "Gulf Shores",
    address: "911 Gulf Shores Pkwy, Gulf Shores AL 36542",
    phone: "(251) 600-9453",
    website: "https://hogwildbeachandbbq.com",
    image: "https://picsum.photos/seed/hog-wild-bbq/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "BBQ", "Open Late", "Casual"],
    description: "Casual Southern BBQ spot",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "hopes-cheesecake",
    name: "Hope's Cheesecake",
    category: "sweets",
    cuisine: "Bakery • Cheesecake",
    location: "Gulf Shores",
    address: "210 E 20th Ave, Gulf Shores AL 36542",
    phone: "(251) 968-5858",
    website: "https://hopescheesecake.com",
    image: "https://picsum.photos/seed/hopes-cheesecake/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour"],
    description: "Award-winning cheesecake bakery since 1996",
    hours: "Mon 12–6pm; Tue–Sat 9am–7:30pm; Sun Closed",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "island-time-daiquiris",
    name: "Island Time Daiquiris (The Wharf)",
    category: "restaurants",
    cuisine: "Bar",
    location: "Orange Beach",
    address: "4830 Wharf Pkwy G101A, Orange Beach AL 36561",
    phone: "(251) 224-0265",
    website: "",
    image: "https://picsum.photos/seed/island-time-daiquiris/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Bars & Taverns", "Outdoor Seating"],
    description: "Frozen-drink bar with Wharf boardwalk patio",
    hours: "Daily 11am–2am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "island-wing",
    name: "Island Wing Company (Gulf Shores)",
    category: "restaurants",
    cuisine: "Wings • Sports Bar",
    location: "Gulf Shores",
    address: "3800 Gulf Shores Pkwy #100, Gulf Shores AL 36542",
    phone: "(251) 948-2625",
    website: "https://islandwing.com",
    image: "https://picsum.photos/seed/island-wing/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Happy Hour", "Wings", "Sports Bar", "Bars & Taverns"],
    description: "Air-fried sports bar with tropical theme",
    hours: "Sun–Thu 11am–10pm; Fri–Sat 11am–11pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "janinos-pizza",
    name: "Janino's Pizza (Gulf Shores)",
    category: "restaurants",
    cuisine: "Pizza",
    location: "Gulf Shores",
    address: "100 W 6th Ave, Gulf Shores AL 36542",
    phone: "(251) 968-3267",
    website: "https://janinospizza.com",
    image: "https://picsum.photos/seed/janinos-pizza/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Local Favorite", "Open Late", "Pizza"],
    description: "Locally owned since 1994",
    hours: "Mon–Sat 11am–10pm; Sun 12–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "jesses-on-bay",
    name: "Jesse's on the Bay",
    category: "restaurants",
    cuisine: "Fine Dining",
    location: "Gulf Shores",
    address: "1631 Crosswinds Ct, Bon Secour, AL 36511",
    phone: "(251) 965-3827",
    website: "https://jessesrestaurant.com",
    image: "https://picsum.photos/seed/jesses-on-bay/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Fine Dining"],
    description: "Riverfront deck fine dining",
    hours: "Tue–Sat 4pm–9pm (Closed Sun–Mon)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "keg-lounge",
    name: "The Keg Lounge & Grill (Orange Beach)",
    category: "restaurants",
    cuisine: "Bar • Pub",
    location: "Orange Beach",
    address: "26796 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 981-9461",
    website: "",
    image: "https://picsum.photos/seed/keg-lounge/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Bars & Taverns"],
    description: "Dive bar vibe with cheap beer & pub food",
    hours: "Mon–Sat 11am–2am; Sun 12pm–12am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "kilwins-wharf",
    name: "Kilwins (The Wharf)",
    category: "sweets",
    cuisine: "Ice Cream • Candy",
    location: "Orange Beach",
    address: "4751 Main St Unit F113, Orange Beach AL 36561",
    phone: "(251) 981-3120",
    website: "https://kilwins.com",
    image: "https://picsum.photos/seed/kilwins-wharf/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Ice Cream / Desserts", "Open Late"],
    description: "Hand-dipped ice cream & fudge franchise with in-store viewing of candy making",
    hours: "Daily 10am–10pm (seasonal til 11pm summer)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "king-neptunes",
    name: "King Neptune's Seafood Restaurant",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Gulf Shores",
    address: "1137 Gulf Shores Pkwy, Gulf Shores, AL 36542",
    phone: "(251) 968-5464",
    website: "https://kingneptunes.website",
    image: "https://picsum.photos/seed/king-neptunes/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Local Favorite", "Seafood"],
    description: "Family-run local favorite known for Royal Reds",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "kittys-kafe",
    name: "Kitty's Kafé (Gulf Shores)",
    category: "restaurants",
    cuisine: "Breakfast • Southern",
    location: "Gulf Shores",
    address: "Pelican Place Shops, 3800 Gulf Shores Pkwy #100, Gulf Shores AL 36542",
    phone: "(251) 948-5233",
    website: "https://kittyskafe.com",
    image: "https://picsum.photos/seed/kittys-kafe/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Breakfast / Brunch"],
    description: "Southern home-style breakfast and lunch",
    hours: "Mon–Sat 7am–2pm; Sun 7am–1pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "louisiana-lagniappe",
    name: "Louisiana Lagniappe (Orange Beach)",
    category: "restaurants",
    cuisine: "Creole • Fine Dining",
    location: "Orange Beach",
    address: "27267 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 981-2258",
    website: "https://thelouisianalagniappe.com",
    image: "https://picsum.photos/seed/louisiana-lagniappe/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Casual", "Boat Access", "Fine Dining", "Creole"],
    description: "Creole-style fine casual dining over SanRoc Cay Marina",
    hours: "Daily 5pm–9:30pm",


    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "lulus-gulf-shores",
    name: "LuLu's Gulf Shores",
    category: "restaurants",
    cuisine: "Seafood • American • Waterfront",
    location: "Gulf Shores",
    address: "200 E 25th Ave, Gulf Shores, AL 36542",
    phone: "(251) 967-5858",
    website: "https://lulusfunfoodmusic.com",
    image: "https://picsum.photos/seed/lulus-gulf-shores/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Seafood", "American", "Happy Hour", "Waterfront", "Live Music", "Casual", "Arcade", "Play Area", "Outdoor Seating"],
    description: "Waterfront family-friendly restaurant with play area, arcade, live music on the Crazy Sista Stage nightly. Known for fresh seafood, American classics, and a fun, casual atmosphere.",
    hours: "Sun–Thu 11:00 am – 9:00 pm; Fri–Sat 11:00 am – 10:00 pm",

    menu: [
      { name: "", price: "", category: "Starters & Snacks", description: "" },
      { name: "", price: "", category: "Favorites / Entrees", description: "" }
    ],
    drinks: [

    ]
  },
  {
    id: "lunas-eat-drink",
    name: "Luna's Eat & Drink (Orange Beach)",
    category: "restaurants",
    cuisine: "American • Pub",
    location: "Orange Beach",
    address: "25689 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 980-5862",
    website: "https://lunaseatanddrink.com",
    image: "https://picsum.photos/seed/lunas-eat-drink/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Bars & Taverns", "American"],
    description: "Southern pub fare; craft beer",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",


    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "mamma-mia",
    name: "Mamma Mia Pizzeria & Italian Grill",
    category: "restaurants",
    cuisine: "Italian • Pizza",
    location: "Orange Beach",
    address: "24895 Canal Rd, Orange Beach AL 36561",
    phone: "(251) 974-0775",
    website: "https://mammamiaorangebeach.com",
    image: "https://picsum.photos/seed/mamma-mia/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Italian", "Family Friendly", "Pizza"],
    description: "Authentic Neapolitan family Italian",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "matts-ice-cream",
    name: "Matt's Homemade Alabama Ice Cream",
    category: "sweets",
    cuisine: "Ice Cream",
    location: "Gulf Shores",
    address: "1308 Gulf Shores Pkwy, Gulf Shores AL 36542",
    phone: "(251) 948-7098",
    website: "",
    image: "https://picsum.photos/seed/matts-ice-cream/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Ice Cream / Desserts", "Local Favorite"],
    description: "Local favorite for house-made ice cream & banana splits; cash only",
    hours: "Daily 11am–10pm (summer til 11pm)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "mile-marker-158",
    name: "Mile Marker 158 Dockside (The Wharf)",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Orange Beach",
    address: "4673 Wharf Pkwy W, Orange Beach, AL 36561",
    phone: "(251) 224-6500",
    website: "https://milemarker158.com",
    image: "https://picsum.photos/seed/mile-marker-158/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Cocktail Lounge", "Happy Hour", "Boat Access"],
    description: "Marina-side cocktails & seafood",
    hours: "Sun–Wed 11am–9pm; Thu–Sat 11am–10pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "miso-seafood",
    name: "Miso Seafood & Sushi Bar (Gulf Shores)",
    category: "restaurants",
    cuisine: "Sushi • Japanese",
    location: "Gulf Shores",
    address: "3800 Gulf Shores Pkwy #230, Gulf Shores, AL 36542",
    phone: "(251) 948-2228",
    website: "https://misoseafoodandsushi.com",
    image: "https://picsum.photos/seed/miso-seafood/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Sushi", "Bars & Taverns"],
    description: "Sushi; hibachi bowls; tempura",
    hours: "Daily 11am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "nonnas-pizzeria",
    name: "Nonna's Pizzeria (Foley)",
    category: "restaurants",
    cuisine: "Pizza • Italian",
    location: "Gulf Shores",
    address: "112 S McKenzie St, Foley AL 36535",
    phone: "(251) 943-8811",
    website: "https://nonnaspizzafoley.com",
    image: "https://picsum.photos/seed/nonnas-pizzeria/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Happy Hour", "Pizza", "Italian"],
    description: "Family Italian spot with BYOB",
    hours: "Tue–Sun 11am–9pm (Closed Mon)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "original-oyster-house",
    name: "Original Oyster House (Gulf Shores)",
    category: "restaurants",
    cuisine: "Seafood • Southern",
    location: "Gulf Shores",
    address: "701 Gulf Shores Pkwy, Gulf Shores, AL 36542",
    phone: "(251) 948-2445",
    website: "https://originaloysterhouse.com",
    image: "https://picsum.photos/seed/original-oyster-house/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Family Friendly", "Open Late", "Seafood"],
    description: "Seafood/Southern; family dining",
    hours: "Daily 11am–9pm",


    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "papa-roccos-gs",
    name: "Papa Rocco's (Gulf Shores)",
    category: "restaurants",
    cuisine: "Pizza • Oysters",
    location: "Gulf Shores",
    address: "101 W 6th Ave, Gulf Shores, AL 36542",
    phone: "(251) 948-7262",
    website: "https://paparocco.com",
    image: "https://picsum.photos/seed/papa-roccos-gs/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Live Music", "Open Late", "Pizza"],
    description: "Pizza; oysters; Home of warm beer & lousy pizza",
    hours: "Daily 11am–midnight (kitchen open late)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "papas-pizza",
    name: "Papa's Pizza – Orange Beach",
    category: "restaurants",
    cuisine: "Pizza",
    location: "Orange Beach",
    address: "25405 Perdido Beach Blvd #22, Orange Beach AL 36561",
    phone: "(251) 981-6777",
    website: "https://papaspizzaorangebeach.com",
    image: "https://picsum.photos/seed/papas-pizza/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Family Friendly", "Open Late", "Pizza"],
    description: "Family-owned since 1991",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "perch-gulf-state-park",
    name: "Perch at Gulf State Park (The Lodge)",
    category: "restaurants",
    cuisine: "Fine Dining • Steakhouse",
    location: "Gulf Shores",
    address: "21196 E Beach Blvd, Gulf Shores, AL 36542",
    phone: "(251) 540-6100",
    website: "https://perchgsp.com",
    image: "https://picsum.photos/seed/perch-gulf-state-park/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Fine Dining", "Open Late", "Steakhouse"],
    description: "Fine dining steak & seafood; sunset views",
    hours: "Wed–Sun 5pm–11pm (Closed Mon–Tue)",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "picnic-beach",
    name: "Picnic Beach (Gulf Shores)",
    category: "restaurants",
    cuisine: "Healthy • BBQ",
    location: "Gulf Shores",
    address: "128 E 1st Ave, Gulf Shores AL 36542",
    phone: "(251) 540-0117",
    website: "https://picnicbeachgs.com",
    image: "https://picsum.photos/seed/picnic-beach/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "BBQ", "Outdoor Seating"],
    description: "Outdoor picnic-style venue with healthy & BBQ menu",
    hours: "Daily 10am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "pink-pony-pub",
    name: "Pink Pony Pub",
    category: "restaurants",
    cuisine: "Bar • Beachfront",
    location: "Gulf Shores",
    address: "137 E Gulf Pl, Gulf Shores, AL 36542",
    phone: "(251) 948-6371",
    website: "",
    image: "https://picsum.photos/seed/pink-pony-pub/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Happy Hour", "Beachfront", "Karaoke", "Bars & Taverns"],
    description: "Beachfront bar; late-night landmark",
    hours: "Daily 11am–2am",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "point-restaurant",
    name: "The Point Restaurant & Bar (Perdido Key)",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Gulf Shores",
    address: "14340 Innerarity Point Rd, Perdido Key FL 32507",
    phone: "(850) 492-3577",
    website: "https://thepointperdido.com",
    image: "https://picsum.photos/seed/point-restaurant/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Local Favorite", "Live Music", "Pet Friendly", "Bars & Taverns"],
    description: "Dog-friendly deck; local seafood bar",
    hours: "Wed–Sun 11am–10pm (Closed Mon–Tue)",
    menu: [
      { name: "", price: "", category: "Sandwiches", description: "" },
      { name: "", price: "", category: "Poboys", description: "" },
      { name: "", price: "", category: "Appetizers", description: "" },
      { name: "", price: "", category: "Soups & Salads", description: "" },
      { name: "", price: "", category: "Seafood Platters", description: "" },
      { name: "", price: "", category: "Seafood Entr\u00e9es", description: "" },
      { name: "", price: "", category: "Land Fare", description: "" }
    ],
    drinks: [
      { name: "", price: "", category: "Beverages", description: "" },
      { name: "", price: "", category: "Desserts", description: "" }
    ]
  },
  {
    id: "port-zekes-landing",
    name: "The Port at Zeke's Landing",
    category: "restaurants",
    cuisine: "Event Venue",
    location: "Orange Beach",
    address: "26619 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 981-4044",
    website: "https://zekeslanding.com/port",
    image: "https://picsum.photos/seed/port-zekes-landing/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Boat Access"],
    description: "Event venue overlooking marina",
    hours: "By event / private booking",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "portabellas",
    name: "Portabella's Restaurant (Foley)",
    category: "restaurants",
    cuisine: "Italian",
    location: "Gulf Shores",
    address: "321 S McKenzie St, Foley AL 36535",
    phone: "(251) 943-7773",
    website: "https://portabellasrestaurant.net",
    image: "https://picsum.photos/seed/portabellas/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Happy Hour", "Romantic", "Italian", "Live Music"],
    description: "Family-run Italian; Romantic dining",
    hours: "Mon–Thu 11am–8pm; Fri–Sat 11am–9pm; Closed Sun",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "portside-bar",
    name: "Portside Bar (The Wharf)",
    category: "restaurants",
    cuisine: "Bar • Rooftop",
    location: "Orange Beach",
    address: "4851 Wharf Pkwy E, Orange Beach, AL 36561",
    phone: "(251) 981-9891",
    website: "https://thewharfoba.com",
    image: "https://picsum.photos/seed/portside-bar/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Cocktail Lounge", "Happy Hour", "Boat Access", "Bars & Taverns"],
    description: "Rooftop cocktail bar overlooking marina",
    hours: "Daily 11am–12am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "roasted-oak",
    name: "Roasted Oak Restaurant & Wine Bar",
    category: "restaurants",
    cuisine: "Fine Dining",
    location: "Orange Beach",
    address: "25775 Perdido Beach Blvd Ste A1, Orange Beach, AL 36561",
    phone: "(251) 980-8110",
    website: "https://roastedoakoba.com",
    image: "https://picsum.photos/seed/roasted-oak/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Fine Dining", "Bars & Taverns"],
    description: "Fine dining with European flair",
    hours: "Tue–Sat 4pm–9pm (Closed Sun–Mon)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "rotolos-pizzeria",
    name: "Rotolo's Pizzeria (Orange Beach)",
    category: "restaurants",
    cuisine: "Pizza • Sports Bar",
    location: "Orange Beach",
    address: "25755 Perdido Beach Blvd, Orange Beach AL 36561",
    phone: "(251) 981-8891",
    website: "https://rotolos.com",
    image: "https://picsum.photos/seed/rotolos-pizzeria/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Happy Hour", "Pizza", "Sports Bar", "Bars & Taverns"],
    description: "Pizza & sports bar franchise",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "ruby-slipper",
    name: "Ruby Slipper Café (Orange Beach)",
    category: "restaurants",
    cuisine: "Brunch • Breakfast",
    location: "Orange Beach",
    address: "24151 Perdido Beach Blvd, Orange Beach AL 36561",
    phone: "(251) 923-4116",
    website: "https://rubyslippercafe.net",
    image: "https://picsum.photos/seed/ruby-slipper/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Breakfast / Brunch"],
    description: "New Orleans-style brunch spot known for Shrimp & Grits and Eggs Benedict Flight",
    hours: "Daily 7:30am–2pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "sanbar-wharf",
    name: "SanBar at The Wharf",
    category: "restaurants",
    cuisine: "BBQ • Bar",
    location: "Orange Beach",
    address: "4851 Wharf Pkwy E, Orange Beach AL 36561",
    phone: "(251) 981-9891",
    website: "",
    image: "https://picsum.photos/seed/sanbar-wharf/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "BBQ", "Bars & Taverns"],
    description: "BBQ bar & live-music hub in Wharf courtyard",
    hours: "Daily 11am–2am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "sandshaker-wharf",
    name: "The Sandshaker (The Wharf)",
    category: "restaurants",
    cuisine: "Bar",
    location: "Orange Beach",
    address: "4851 Wharf Pkwy E, Orange Beach, AL 36561",
    phone: "(251) 981-9891",
    website: "https://sandshaker.com",
    image: "https://picsum.photos/seed/sandshaker-wharf/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Bars & Taverns", "Cocktail Lounge"],
    description: "Wharf music hub with frozen cocktails",
    hours: "Mon–Fri 11am–12am; Sat–Sun 10am–2am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "sassy-bass",
    name: "Sassy Bass Cookout Tiki Bar",
    category: "restaurants",
    cuisine: "BBQ • Seafood • Tiki",
    location: "Gulf Shores",
    address: "375 Plantation Rd, Gulf Shores, AL 36542",
    phone: "(251) 923-0020",
    website: "",
    image: "https://picsum.photos/seed/sassy-bass/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "BBQ", "Seafood", "Happy Hour", "Live Music", "Beachfront", "Bars & Taverns"],
    description: "Beachfront tiki bar; BBQ/seafood/American",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "scoops-parlor",
    name: "Scoops Olde Fashion Ice Cream Parlor",
    category: "restaurants",
    cuisine: "Ice Cream",
    location: "Gulf Shores",
    address: "601 Gulf Shores Pkwy, Gulf Shores AL 36542",
    phone: "(251) 948-4800",
    website: "",
    image: "https://picsum.photos/seed/scoops-parlor/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Ice Cream / Desserts", "Open Late"],
    description: "Retro ice-cream shop with nostalgic decor and indoor parlor seating",
    hours: "Daily 12pm–9pm (10pm summer)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "sea-n-suds",
    name: "Sea-N-Suds Restaurant & Oyster Bar",
    category: "restaurants",
    cuisine: "Seafood • Oysters • Beachfront",
    location: "Gulf Shores",
    address: "409 E Beach Blvd, Gulf Shores, AL 36542",
    phone: "(251) 948-7894",
    website: "https://sea-n-suds.com",
    image: "https://picsum.photos/seed/sea-n-suds/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Beachfront", "Open Late", "Bars & Taverns", "Seafood"],
    description: "On-sand beachfront; gumbo, shrimp sandwiches, oysters",
    hours: "Daily 10:30am–10pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "shipps-dockside",
    name: "Shipp's Dockside Grill (Orange Beach Marina)",
    category: "restaurants",
    cuisine: "Seafood • Sushi",
    location: "Orange Beach",
    address: "27267 Perdido Beach Blvd (Orange Beach Marina), Orange Beach, AL 36561",
    phone: "(251) 981-5516",
    website: "https://shippsdockside.com",
    image: "https://picsum.photos/seed/shipps-dockside/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Sushi", "Seafood"],
    description: "Reimagined concept (formerly Shipp's Harbour Grill)",
    hours: "Lower deck/casual counter service 11am daily; Upper deck full-service 4pm daily",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "southern-grind-indigo",
    name: "The Southern Grind – Hotel Indigo Location",
    category: "restaurants",
    cuisine: "Coffee • Cafe",
    location: "Orange Beach",
    address: "22843 Perdido Beach Blvd, Orange Beach AL 36561",
    phone: "(251) 923-3265",
    website: "",
    image: "https://picsum.photos/seed/southern-grind-indigo/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour"],
    description: "All-day café with art gallery vibe",
    hours: "Daily 7am–8pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "southern-grind-wharf",
    name: "The Southern Grind Coffee House – The Wharf",
    category: "restaurants",
    cuisine: "Coffee",
    location: "Orange Beach",
    address: "4751 Main St #116, Orange Beach AL 36561",
    phone: "(251) 923-3265",
    website: "https://southerngrindcoffeehouse.com",
    image: "https://picsum.photos/seed/southern-grind-wharf/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour"],
    description: "Artisan coffee & gift shop",
    hours: "Daily 7am–6pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "southern-shores-coffee",
    name: "Southern Shores Coffee (Gulf Shores)",
    category: "restaurants",
    cuisine: "Coffee",
    location: "Gulf Shores",
    address: "17287 Hwy 59, Gulf Shores AL 36542",
    phone: "(251) 923-0049",
    website: "https://southernshorescoffee.com",
    image: "https://picsum.photos/seed/southern-shores-coffee/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Coffee & Bakery", "Happy Hour", "Local Favorite"],
    description: "Local roaster selling beans wholesale",
    hours: "Daily 6am–2pm",


    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "steamer-baked-oyster",
    name: "The Steamer & Baked Oyster Bar (Gulf Shores)",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Gulf Shores",
    address: "Behind Souvenir City, W 1st Ave, Gulf Shores, AL",
    phone: "(251) 948-4042",
    website: "https://gulfcoaststeamer.com",
    image: "https://picsum.photos/seed/steamer-baked-oyster/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Seafood", "Happy Hour", "Casual", "Live Music", "Bars & Taverns"],
    description: "Steamed/baked seafood; family casual",
    hours: "Daily 11am–9pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "sunliner-diner",
    name: "Sunliner Diner (Gulf Shores)",
    category: "restaurants",
    cuisine: "Diner • Breakfast",
    location: "Gulf Shores",
    address: "100 E 2nd Ave, Gulf Shores AL 36542",
    phone: "(251) 937-6600",
    website: "https://sunlinerdiner.com",
    image: "https://picsum.photos/seed/sunliner-diner/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Breakfast / Brunch"],
    description: "Retro 1950s diner with breakfast all day",
    hours: "Daily 7am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "surfside-pizza",
    name: "Surfside Pizza (Orange Beach)",
    category: "restaurants",
    cuisine: "Pizza",
    location: "Orange Beach",
    address: "25241 Perdido Beach Blvd, Orange Beach AL 36561",
    phone: "(251) 974-1010",
    website: "https://surfsidepizza.com",
    image: "https://picsum.photos/seed/surfside-pizza/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Open Late", "Pizza"],
    description: "New York-style takeout & delivery",
    hours: "Daily 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "sweet-cone",
    name: "Sweet Cone Alabama (Candy & Ice Cream)",
    category: "restaurants",
    cuisine: "Candy • Ice Cream",
    location: "Orange Beach",
    address: "26651 Perdido Beach Blvd Ste C, Orange Beach AL 36561",
    phone: "(251) 981-1675",
    website: "",
    image: "https://picsum.photos/seed/sweet-cone/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Ice Cream / Desserts", "Local Favorite", "Open Late"],
    description: "Tourist-favorite candy and ice-cream store near the beach",
    hours: "Daily 11am–10pm (11pm summer)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "tacky-jacks-gulf-shores",
    name: "Tacky Jack's – Gulf Shores",
    category: "restaurants",
    cuisine: "Seafood • Waterfront",
    location: "Gulf Shores",
    address: "240 E 24th Ave, Gulf Shores, AL 36542",
    phone: "(251) 948-8881",
    website: "https://tackyjacks.com",
    image: "https://picsum.photos/seed/tacky-jacks-gulf-shores/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Family Friendly", "Seafood", "Happy Hour", "Waterfront", "Casual", "Live Music", "Boat Access", "Karaoke"],
    description: "Waterfront; boat access; breakfast–seafood; family casual",
    hours: "Daily 7am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "tacky-jacks-orange-beach",
    name: "Tacky Jack's – Orange Beach",
    category: "restaurants",
    cuisine: "Seafood • Waterfront",
    location: "Orange Beach",
    address: "27206 Safe Harbor Dr, Orange Beach, AL 36561",
    phone: "(251) 981-4144",
    website: "https://tackyjacks.com",
    image: "https://picsum.photos/seed/tacky-jacks-orange-beach/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Waterfront", "Live Music", "Boat Access", "Karaoke"],
    description: "Waterfront; marina deck",
    hours: "Daily 7am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "tequila-mexican",
    name: "Tequila Mexican Restaurant – Orange Beach",
    category: "restaurants",
    cuisine: "Mexican",
    location: "Orange Beach",
    address: "25405 Perdido Beach Blvd Ste 1, Orange Beach AL 36561",
    phone: "(251) 981-5350",
    website: "https://tequilamexicanoba.com",
    image: "https://picsum.photos/seed/tequila-mexican/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Mexican", "Family Friendly", "Open Late"],
    description: "Authentic family Mexican cuisine",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–10pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "the-point",
    name: "The Point Restaurant",
    category: "restaurants",
    cuisine: "Seafood • American • Southern",
    location: "Gulf Shores",
    address: "14340 Innerarity Point Road, Perdido Key, FL 32507",
    phone: "(850) 492-3577",
    website: "https://thepointperdido.com",
    image: "https://picsum.photos/seed/the-point/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Seafood", "American", "Southern", "Oysters", "Fresh Catch", "Waterfront", "Bay View", "Casual Dining", "Family-Friendly", "Group-Friendly", "Outdoor Seating", "Full Bar", "Fried Seafood", "Gumbo", "Kids Menu", "Carry-Out Available", "Famous Mullet Sandwich", "Crab Cakes", "Burgers"],
    description: "Casual waterfront seafood restaurant located on Perdido Key. Famous for fresh mullet sandwich, house-smoked tuna dip, and generous seafood platters. Features daily fresh catch and Royal Red shrimp. Available for dine-in or carry-out.",
    hours: "Sun 12pm–9pm; Tue–Thu 11am–9pm; Fri–Sat 11am–10pm; Closed Mon",



    menu: [
      { name: "", price: "", category: "Appetizers", description: "" },
      { name: "", price: "", category: "Soups & Salads", description: "" },
      { name: "", price: "", category: "Sandwiches", description: "" },
      { name: "", price: "", category: "Poboys", description: "" },
      { name: "", price: "", category: "Seafood Platters", description: "" },
      { name: "", price: "", category: "Seafood Entr\u00e9es", description: "" },
      { name: "", price: "", category: "Land Fare", description: "" },
      { name: "", price: "", category: "Sides", description: "" },
      { name: "", price: "", category: "Desserts", description: "" }
    ],
    drinks: [
      { name: "", price: "", category: "Soft Drinks", description: "" }
    ]
  },
  {
    id: "tin-top",
    name: "Tin Top Restaurant & Oyster Bar (Bon Secour)",
    category: "restaurants",
    cuisine: "Seafood • Steaks • Southern",
    location: "Gulf Shores",
    address: "17451 County Rd 49 S, Bon Secour, AL 36511",
    phone: "(251) 949-5086",
    website: "https://tintoprestaurant.com",
    image: "https://picsum.photos/seed/tin-top/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Seafood", "Happy Hour", "Live Music", "Bars & Taverns", "Steakhouse"],
    description: "Southern-coastal seafood & steaks",
    hours: "Mon–Sat 11am–10pm; Sun 10am–9pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "ugly-diner",
    name: "The Ugly Diner (Gulf Shores)",
    category: "restaurants",
    cuisine: "Diner • Breakfast",
    location: "Gulf Shores",
    address: "2200 E 2nd St Ste F, Gulf Shores, AL 36542",
    phone: "(251) 948-0034",
    website: "",
    image: "https://picsum.photos/seed/ugly-diner/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Breakfast / Brunch"],
    description: "Retro diner",
    hours: "Daily 7am–2pm",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "undertow-bar",
    name: "The Undertow Bar & Grill (Orange Beach)",
    category: "restaurants",
    cuisine: "Bar • Pub",
    location: "Orange Beach",
    address: "25025 Canal Rd, Orange Beach, AL 36561",
    phone: "(251) 981-9811",
    website: "https://undertowob.com",
    image: "https://picsum.photos/seed/undertow-bar/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Happy Hour", "Local Favorite", "Karaoke", "Bars & Taverns"],
    description: "Local late-night hangout with pool tables",
    hours: "Daily 11am–2am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "villaggio-grille",
    name: "Villaggio Grille (The Wharf)",
    category: "restaurants",
    cuisine: "Italian",
    location: "Orange Beach",
    address: "4790 Main St Ste F108, Orange Beach, AL 36561",
    phone: "(251) 224-6510",
    website: "https://villaggiogrille.com",
    image: "https://picsum.photos/seed/villaggio-grille/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Italian", "Fine Dining", "Open Late"],
    description: "Upscale Italian-fusion bistro; wood-fired pizza & steaks",
    hours: "Daily 11am–9pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "voyagers-perdido",
    name: "Voyagers (Perdido Beach Resort)",
    category: "restaurants",
    cuisine: "Fine Dining • Seafood",
    location: "Orange Beach",
    address: "27200 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 981-9811",
    website: "https://perdidobeachresort.com/voyagers",
    image: "https://picsum.photos/seed/voyagers-perdido/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Seafood", "Happy Hour", "Romantic", "Beach View", "Fine Dining"],
    description: "Fine dining; romantic gulf view",
    hours: "Daily 5–9pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "wolf-bay-foley",
    name: "Wolf Bay Restaurant – Foley",
    category: "restaurants",
    cuisine: "Seafood",
    location: "Gulf Shores",
    address: "20801 Miflin Rd, Foley, AL 36535",
    phone: "(251) 965-5129",
    website: "https://wolfbaylodge.com",
    image: "https://picsum.photos/seed/wolf-bay-foley/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Happy Hour", "Family Friendly", "Open Late", "Seafood"],
    description: "Historic seafood family restaurant",
    hours: "Daily 11am–9pm",

    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "woodside-restaurant",
    name: "Woodside Restaurant (Gulf State Park)",
    category: "restaurants",
    cuisine: "American",
    location: "Gulf Shores",
    address: "20249 State Park Rd, Gulf Shores AL 36542",
    phone: "(251) 923-3100",
    website: "https://woodsideatgsp.com",
    image: "https://picsum.photos/seed/woodside-restaurant/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Pet Friendly", "Outdoor Seating", "American"],
    description: "Park venue with pet-friendly patio and yard games",
    hours: "Daily 8am–8pm (Breakfast 8–10:45, Lunch 10:45–4, Dinner 4–8)",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "yoho-rum-tacos",
    name: "YoHo Rum & Tacos – The Wharf",
    category: "restaurants",
    cuisine: "American",
    location: "Orange Beach",
    address: "4851 Wharf Pkwy E, Orange Beach AL 36561",
    phone: "(251) 981-8282",
    website: "https://yohorumandtacos.com",
    image: "https://picsum.photos/seed/yoho-rum-tacos/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Caribbean", "Happy Hour", "Tacos", "Waterfront", "Live Music"],
    description: "Waterfront island-style bar with Caribbean menu",
    hours: "Daily 11am–10pm",
    menu: [
      { name: "Guacamole Sampler", price: "$10", category: "Starters", description: "House guacamole topped with pineapple mango salsa, pico, mixed chilies, chips" },
      { name: "Smoked Brisket Queso", price: "$8", category: "Starters", description: "" },
      { name: "Nacho Platter", price: "$14", category: "Starters", description: "Ground beef or chicken, lettuce, black olives, pico, jalape\u00f1os, sour cream. Add Smoked Brisket or Barbacoa Beef +$5" },
      { name: "Jerk Chicken Quesadilla", price: "$14", category: "Starters", description: "" },
      { name: "Street Corn Dip", price: "$9", category: "Starters", description: "" },
      { name: "Cannon Ball Shrimp", price: "$14", category: "Starters", description: "" },
      { name: "Mexican Pizza", price: "$14", category: "Starters", description: "" },
      { name: "Traditional Bone-In (10)", price: "$14", category: "Wings", description: "Served with Fries. Sauces: Buffalo, BBQ, Jamaican Jerk, Teriyaki, Firecracker, Naked" },
      { name: "Boneless (1 lb)", price: "$16", category: "Wings", description: "Served with Fries. Sauces: Buffalo, BBQ, Jamaican Jerk, Teriyaki, Firecracker, Naked" },
      { name: "Fried Chicken", price: "$6", category: "Tacos", description: "" },
      { name: "Chimichurri Steak", price: "$6", category: "Tacos", description: "" },
      { name: "Barbacoa Beef", price: "$6", category: "Tacos", description: "" },
      { name: "Fried Grouper", price: "$6", category: "Tacos", description: "" },
      { name: "Blackened Mahi", price: "$6", category: "Tacos", description: "" },
      { name: "Firecracker Shrimp", price: "$6", category: "Tacos", description: "" },
      { name: "Buffalo Chicken", price: "$6", category: "Tacos", description: "" },
      { name: "Peanut Ginger Chicken", price: "$6", category: "Tacos", description: "" },
      { name: "Tuna Poke", price: "$6", category: "Tacos", description: "" },
      { name: "Street Taco", price: "$6", category: "Tacos", description: "" },
      { name: "Classic (Ground Beef or Chicken)", price: "$5", category: "Tacos", description: "" },
      { name: "Veggie", price: "$5", category: "Tacos", description: "" },
      { name: "Tuna Poke Bowl", price: "$16", category: "Plates", description: "" },
      { name: "Peanut Ginger Chicken Bowl", price: "$16", category: "Plates", description: "" },
      { name: "Chipotle Shrimp Burrito", price: "$16", category: "Plates", description: "" },
      { name: "Honey Lime Chicken Burrito", price: "$16", category: "Plates", description: "" },
      { name: "Beef Burrito Supreme", price: "$14", category: "Plates", description: "" },
      { name: "Taco Salad", price: "$14", category: "Plates", description: "" },
      { name: "Surf & Turf Quesadilla", price: "$16", category: "Plates", description: "" },
      { name: "Blackened Salmon", price: "$16", category: "Plates", description: "" },
      { name: "Shrimp Avocado Bowl", price: "$16", category: "Plates", description: "" },
      { name: "YoHo Bacon Cheeseburger", price: "$16", category: "Sandwiches", description: "" },
      { name: "Jerk Chicken Sandwich", price: "$16", category: "Sandwiches", description: "" },
      { name: "Mexican Street Corn", price: "$4", category: "Sides", description: "" },
      { name: "Cilantro Lime Rice", price: "$3", category: "Sides", description: "" },
      { name: "Mexican Rice", price: "$3", category: "Sides", description: "" },
      { name: "Black Beans (with cheese)", price: "$3", category: "Sides", description: "" },
      { name: "Pinto Beans", price: "$3", category: "Sides", description: "" },
      { name: "Caribbean Rice", price: "$4", category: "Sides", description: "" },
      { name: "Mexican Macaroni Salad", price: "$3", category: "Sides", description: "" },
      { name: "French Fries", price: "$3", category: "Sides", description: "" },
      { name: "Flour or Corn Tortillas", price: "$3", category: "Sides", description: "" },
      { name: "Queso", price: "$8", category: "Sides", description: "" },
      { name: "Guacamole", price: "$8", category: "Sides", description: "" },
      { name: "Tres Leche", price: "$8", category: "Desserts", description: "" },
      { name: "Pina Colada Cheesecake", price: "$8", category: "Desserts", description: "" },
      { name: "Dessert Nachos", price: "$8", category: "Desserts", description: "" },
      { name: "Chicken Tenders", price: "", category: "Kids Menu", description: "Served with Fries" },
      { name: "Kids Beef Taco", price: "", category: "Kids Menu", description: "Served with Fries" },
      { name: "Cheese Quesadilla", price: "", category: "Kids Menu", description: "Served with Fries" },
      { name: "Popcorn Shrimp", price: "", category: "Kids Menu", description: "Served with Fries" },
      { name: "Mini Corn Dogs", price: "", category: "Kids Menu", description: "Served with Fries" }
    ],
    drinks: [
      { name: "YoHo Margarita", price: "$10", category: "Signature Cocktails", description: "" },
      { name: "YoHo Rum Punch", price: "$10", category: "Signature Cocktails", description: "" },
      { name: "Mango Strawberry Margarita", price: "$10", category: "Signature Cocktails", description: "" },
      { name: "Cucumber Jalape\u00f1o Margarita", price: "$11", category: "Signature Cocktails", description: "" },
      { name: "Pain Eraser", price: "$10", category: "Signature Cocktails", description: "" },
      { name: "OB Hurricane", price: "$12", category: "Signature Cocktails", description: "" },
      { name: "Mai Tai", price: "$10", category: "Signature Cocktails", description: "" },
      { name: "Dark & Stormy", price: "$9", category: "Signature Cocktails", description: "" },
      { name: "Blue Marlin Bucket", price: "$18", category: "Signature Cocktails", description: "" },
      { name: "Island Girl Bucket", price: "$18", category: "Signature Cocktails", description: "" },
      { name: "Watermelon Mojito", price: "$10", category: "Signature Cocktails", description: "" },
      { name: "Cherry Limeade", price: "$8", category: "Signature Cocktails", description: "" },
      { name: "Match Made in Haven", price: "$9", category: "Signature Cocktails", description: "" },
      { name: "Margarita Tree", price: "$60", category: "Margarita Tree", description: "Four 12oz Margaritas, perfect for sharing. Flavors: YoHo Margarita (Patron Cristalino), Strawberry Mango Margarita (Patron Cristalino), Watermelon Margarita (Patron Reposado), Pineapple Jalape\u00f1o Margarita (Patron Reposado)" },
      { name: "Mangonada", price: "$12", category: "From the Blender", description: "" },
      { name: "Boat Whacker", price: "$12", category: "From the Blender", description: "" },
      { name: "Daiquiris (Strawberry, Banana, Blue Hawaiian, Pi\u00f1a Colada)", price: "$10", category: "From the Blender", description: "Virgin Daiquiri $5" },
      { name: "Key Lime Colada", price: "$12", category: "From the Blender", description: "" },
      { name: "Appleton Signature (Jamaica)", price: "$9", category: "Rum", description: "" },
      { name: "Appleton 12 Year Rare Casks", price: "$12", category: "Rum", description: "" },
      { name: "Appleton 15 Year Black River Casks", price: "$15", category: "Rum", description: "" },
      { name: "Bumbu (Barbados)", price: "$9", category: "Rum", description: "" },
      { name: "Don Q Anejo (Puerto Rico)", price: "$10", category: "Rum", description: "" },
      { name: "Plantation 3 Stars (Caribbean)", price: "$10", category: "Rum", description: "" },
      { name: "Papa's Pilar (Key West, FL)", price: "$14", category: "Rum", description: "" },
      { name: "Flor de Ca\u00f1a (Nicaragua)", price: "$12", category: "Rum", description: "" },
      { name: "Diplomatico (Venezuela)", price: "$14", category: "Rum", description: "" },
      { name: "Zaya (Trinidad & Tobago)", price: "$14", category: "Rum", description: "" },
      { name: "La Hechicera (Colombia)", price: "$12", category: "Rum", description: "" },
      { name: "Dictador (Colombia)", price: "$12", category: "Rum", description: "" },
      { name: "Rhum Barbancourt (Haiti)", price: "$12", category: "Rum", description: "" },
      { name: "Duquesne (West Indies)", price: "$12", category: "Rum", description: "" },
      { name: "Ron Zacapa No. 23 (Guatemala)", price: "$18", category: "Rum", description: "" },
      { name: "Kirk and Sweeney 18 Yr (Dominican)", price: "$14", category: "Rum", description: "" },
      { name: "Mount Gay XO Triple Cask (Barbados)", price: "$18", category: "Rum", description: "" },
      { name: "Appleton Rum", price: "$18", category: "Flights", description: "" },
      { name: "Espolon Tequila", price: "$18", category: "Flights", description: "" },
      { name: "Elijah Craig Bourbon", price: "$22", category: "Flights", description: "" },
      { name: "Espolon Blanco", price: "$9", category: "Tequila", description: "" },
      { name: "Espolon Reposado", price: "$10", category: "Tequila", description: "" },
      { name: "Espolon Anejo", price: "$12", category: "Tequila", description: "" },
      { name: "Patron Silver", price: "$10", category: "Tequila", description: "" },
      { name: "Patron Reposado", price: "$12", category: "Tequila", description: "" },
      { name: "Patron Anejo", price: "$14", category: "Tequila", description: "" },
      { name: "Patron Cristalino", price: "$16", category: "Tequila", description: "" },
      { name: "Patron El Cielo", price: "$30", category: "Tequila", description: "" },
      { name: "Don Julio Blanco", price: "$12", category: "Tequila", description: "" },
      { name: "Don Julio Reposado", price: "$13", category: "Tequila", description: "" },
      { name: "Don Julio Anejo", price: "$14", category: "Tequila", description: "" },
      { name: "Don Julio 1942", price: "$30", category: "Tequila", description: "" }
    ]
  },
  {
    id: "zekes-restaurant",
    name: "Zeke's Restaurant & Landing (Orange Beach)",
    category: "restaurants",
    cuisine: "Seafood • Waterfront",
    location: "Orange Beach",
    address: "26619 Perdido Beach Blvd, Orange Beach, AL 36561",
    phone: "(251) 280-8008",
    website: "https://zekeslanding.com",
    image: "https://picsum.photos/seed/zekes-restaurant/400/300",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Open Late", "Waterfront", "Casual", "Seafood"],
    description: "Waterfront casual",
    hours: "Opens daily at 11am",
    menu: [

    ],
    drinks: [

    ]
  },
  {
    id: "tee-off-wharf",
    name: "Tee Off at The Wharf",
    category: "restaurants",
    cuisine: "American",
    location: "Orange Beach",
    address: "4619 Main Street Suite A102, Orange Beach, Alabama 36561",
    phone: "(251) 228-4899",
    website: "https://teeoffatthewharf.com",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop",
    rating: 4.5,
    priceLevel: "$$",
    tags: ["Entertainment", "Sports Bar", "Indoor", "Family Friendly", "Groups", "Happy Hour"],
    description: "Dining & entertainment venue powered by Topgolf Swing Suite, featuring golf simulators and multi-sport games. Perfect for team-building, birthdays, and corporate outings.",
    hours: "Sun–Thu 11am–9pm; Fri–Sat 11am–11pm",
    happyHour: "Mon–Fri 11 AM–5 PM",
    happyHourSpecials: [
      { name: "$2 Off Draft Beer", category: "Beer Specials", description: "$2 off all draft beers during happy hour" },
      { name: "$3 Off Cocktails", category: "Cocktail Specials", description: "$3 off all house cocktails" },
      { name: "$5 Select Appetizers", category: "Food Specials", description: "Wings, Nachos, Pork Skins, and more" },
      { name: "$4 Domestic Bottles", category: "Beer Specials", description: "All domestic bottled beers" },
      { name: "$6 Wine by Glass", category: "Wine Specials", description: "Select wines by the glass" }
    ],
    events: [
      { name: "🎃 Halloween Costume Contest", description: "Live music • Costume contest • Food & Drinks • Top 3 winners receive Tee Off merch + $25 gift card.", day: "Thursday, October 30", time: "5:00 PM – 9:00 PM" },
      { name: "🏆 Cornhole Tournament", description: "Hosted by Tee Off. Benefiting the Beach Bombers Baseball Organization.\n\nRegistration Fees:\n• 12 & Under $10 / $20 team\n• Amateur $15 / $30 team\n• Competitive $20 / $40 team\n\nPrizes for all divisions • Food & Drinks available • Football streaming all day • Family-friendly event.", day: "Saturday, November 8", time: "Warm-ups & Sign-ups 10 AM – 11 AM" }
    ],

    menu: [
      { name: "Boiled Peanuts", price: "$10.50", category: "Bites & Shareables", description: "Alabama peanuts boiled in smoked ham stock." },
      { name: "Finger Sandwiches", price: "$12", category: "Bites & Shareables", description: "Pimento & egg salad finger sandwiches." },
      { name: "Wings or Tenders", price: "$17", category: "Bites & Shareables", description: "8 beer-brined jumbo wings or 6 tenders with choice of sauce." },
      { name: "Dips Trio", price: "$15", category: "Bites & Shareables", description: "Boiled peanut hummus, warm spinach dip & beer cheese." },
      { name: "Nachos", price: "$19", category: "Bites & Shareables", description: "Braised pork, queso, onions, jalape\u00f1o, avocado crema, salsas verde & roja." },
      { name: "Pork Skins", price: "$13", category: "Bites & Shareables", description: "With candied jalape\u00f1o jam & ranch." },
      { name: "Smashed Potatoes", price: "$16.50", category: "Bites & Shareables", description: "Gold potatoes with cheddar, bacon, jalape\u00f1os & sour cream." },
      { name: "Conecuh Bratwurst", price: "$15", category: "Handhelds (with Fries)", description: "Beer-poached Conecuh sausage, caramelized onion, beer mustard." },
      { name: "Tee Off Burger", price: "$18", category: "Handhelds (with Fries)", description: "Pimento, caramelized onions & dill pickles." },
      { name: "Medianoche", price: "$18", category: "Handhelds (with Fries)", description: "Pork, ham, beer mustard, Swiss, sweet pickles." },
      { name: "Fish Tacos", price: "$18", category: "Handhelds (with Fries)", description: "Gulf fish, slaw, pickled onions, lime crema, queso fresco." },
      { name: "Wedge Salad", price: "$15.50", category: "Salads", description: "Bacon lardons, tomatoes, pickled onion, bleu cheese." },
      { name: "Spinach Salad", price: "$15.50", category: "Salads", description: "Pecans, queso fresco, tangerines, honey bacon vinaigrette." },
      { name: "Fried Green Tomato Salad", price: "$15.50", category: "Salads", description: "Lettuce, bacon, goat cheese, grilled corn, peppercorn ranch." },
      { name: "Chicken Tenders", price: "$9", category: "Kids", description: "Served with French fries & a drink." },
      { name: "Mac & Cheese", price: "$9", category: "Kids", description: "Served with French fries & a drink." },
      { name: "Cheeseburger", price: "$9", category: "Kids", description: "Served with French fries & a drink." },
      { name: "Conecuh Hot Dog", price: "$9", category: "Kids", description: "Served with French fries & a drink." },
      { name: "\u201cFirestone\u201d Crunchy Cream Pie", price: "$12", category: "Desserts", description: "Vanilla custard pie with pecan & coconut crumble; whipped cream." },
      { name: "Basque Cheesecake", price: "$12", category: "Desserts", description: "Traditional Basque-style baked cheesecake." },
      { name: "Warm Chocolate Chip Cookie", price: "$12", category: "Desserts", description: "Served warm with vanilla ice cream." },
      { name: "Seasonal Bread Pudding", price: "$12", category: "Desserts", description: "Rotating flavor bread pudding." }
    ],
    drinks: [
      { name: "Soft Drinks & Teas", price: "$4", category: "Non-Alcoholic", description: "Coke, Diet Coke, Coke Zero, Sprite, Dr Pepper, Lemonade, Sweet/Unsweet Tea." },
      { name: "Coffee", price: "$5", category: "Non-Alcoholic", description: "Fresh-brewed coffee." },
      { name: "Espresso Shot", price: "$5", category: "Non-Alcoholic", description: "Single espresso." },
      { name: "Red Bull (Original / Sugar-Free / Blueberry)", price: "$5", category: "Non-Alcoholic", description: "Energy drink selection." },
      { name: "Athletic Golden Ale (N/A)", price: "$5", category: "Non-Alcoholic", description: "Non-alcoholic golden ale." },
      { name: "Run Wild IPA (N/A)", price: "$5", category: "Non-Alcoholic", description: "Non-alcoholic IPA." },
      { name: "Azalea", price: "$16", category: "Cocktails \u2013 Golf Course Series", description: "Vodka, pineapple, lemon, grenadine, cherry." },
      { name: "Transfusion", price: "$16", category: "Cocktails \u2013 Golf Course Series", description: "Vodka, grape juice, lime, ginger ale." },
      { name: "Mother of Pearl", price: "$16", category: "Cocktails \u2013 Golf Course Series", description: "Gin, celery bitters, tonic, celery salt rim." },
      { name: "Southside", price: "$16", category: "Cocktails \u2013 Golf Course Series", description: "Gin, lemon juice, mint syrup, soda." },
      { name: "Green Margarita", price: "$16", category: "Cocktails \u2013 Traditional", description: "Blanco tequila, orange liqueur, lime, agave, kiwi." },
      { name: "Paloma", price: "$16", category: "Cocktails \u2013 Traditional", description: "Reposado tequila, grapefruit, lime, agave, soda (chili rim)." },
      { name: "Dirty Martini", price: "$17", category: "Cocktails \u2013 Traditional", description: "Vodka, olive brine, blue cheese olive." },
      { name: "Espresso Martini", price: "$17", category: "Cocktails \u2013 Traditional", description: "Vodka, coffee liqueur, espresso, toasted marshmallow." },
      { name: "Bloody Mary", price: "$15", category: "Cocktails \u2013 Traditional", description: "Vodka, bold Charleston mix, pickle-stuffed olives, pickled okra." },
      { name: "Bushwhacker White Russian", price: "$16", category: "Cocktails \u2013 Traditional", description: "Dark rum, coconut liqueur, coffee liqueur, cream, shaved chocolate." },
      { name: "Old Fashioned", price: "$16 (+$2 smoked)", category: "Cocktails \u2013 Traditional", description: "Bourbon, sugar, bitters, orange zest. +$2 'SMOKE IT' option." },
      { name: "Draft \u2013 Paulaner Hefe-Weizen", price: "$9", category: "Beer", description: "German Hefeweizen on tap." },
      { name: "Domestic Beers", price: "$6", category: "Beer", description: "Miller Lite, Coors Lite, Corona Premier, Modelo, Blue Moon Light, Yuengling, Twisted Tea, Austin Eastciders, Michelob Ultra, Bud Light." },
      { name: "Craft Beers", price: "$8", category: "Beer", description: "White Claw, Dr. Juice IPA, SweetWater Day Trip IPA, Fat Tire, Good People Muchacho, Destin Blood Orange Blonde, Dogfish Grateful Dead Pale Ale, Dogfish SeaQuench Sour, Deschutes Black Butte Porter." },
      { name: "Non-Alcoholic Beer", price: "$5", category: "Beer", description: "Athletic Golden Ale, Run Wild IPA." },
      { name: "Pinot Grigio (Mezzacorona Domenic)", price: "$12", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Sauvignon Blanc (Drylands)", price: "$13", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Chardonnay (Carmel Road)", price: "$10", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Prosecco (La Marca)", price: "$11", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Moscato d\u2019Asti (Ceretoo)", price: "$14", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Pinot Noir (La Crema)", price: "$14", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Cabernet Sauvignon (H3)", price: "$12", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Ros\u00e9 (Ch\u00e2teau La Mascaronne Folly)", price: "$11", category: "Wine \u2013 Glass", description: "By the glass." },
      { name: "Justin Sauvignon Blanc", price: "$42", category: "Wine \u2013 Bottle (White/Sparkling)", description: "" },
      { name: "Tomatore Etna Bianco", price: "$54", category: "Wine \u2013 Bottle (White/Sparkling)", description: "" },
      { name: "Chandon Brut", price: "$54", category: "Wine \u2013 Bottle (White/Sparkling)", description: "" },
      { name: "Santa Margherita Pinot Grigio", price: "$58", category: "Wine \u2013 Bottle (White/Sparkling)", description: "" },
      { name: "Rombauer Chardonnay", price: "$98", category: "Wine \u2013 Bottle (White/Sparkling)", description: "" },
      { name: "Grand Veneur La Fontaine (Ch\u00e2teauneuf-du-Pape Blanc)", price: "$165", category: "Wine \u2013 Bottle (White/Sparkling)", description: "" },
      { name: "Tomatore Etna Rosso", price: "$58", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Trefethen Napa Merlot", price: "$67", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Department 66 Others (GSM blend)", price: "$72", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Robert Mondavi Napa Cabernet Sauvignon", price: "$88", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Orin Swift 8 Years in the Desert (Zin/Petite Syrah/Syrah)", price: "$88", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Patz & Hall Pinot Noir", price: "$96", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Stag\u2019s Leap Artemis Cabernet Sauvignon", price: "$197", category: "Wine \u2013 Bottle (Red)", description: "" },
      { name: "Ch\u00e2teau d\u2019Esclans Whispering Angel Ros\u00e9", price: "$62", category: "Wine \u2013 Bottle (Ros\u00e9)", description: "" },
      { name: "Elijah Craig", price: "$12", category: "Spirits \u2013 Whiskey", description: "" },
      { name: "Calumet Farm 18 Yr", price: "$157", category: "Spirits \u2013 Whiskey", description: "" },
      { name: "Johnnie Walker (various)", price: "$15\u2013$776", category: "Spirits \u2013 Scotch", description: "Range includes Black to Blue." },
      { name: "The Macallan Double Cask 15 Yr", price: "$62", category: "Spirits \u2013 Scotch", description: "" },
      { name: "Tito\u2019s", price: "$11", category: "Spirits \u2013 Vodka", description: "" },
      { name: "Belvedere", price: "$16", category: "Spirits \u2013 Vodka", description: "" },
      { name: "Corazon Blanco", price: "$12", category: "Spirits \u2013 Tequila/Mezcal", description: "" }
    ],
    packages: [
      { name: "Bay Rental (Per Hour)", price: "$75", category: "Simulator Rentals", description: "Rent a bay by the hour. Play golf, baseball, zombie dodgeball, and more! Up to 6 guests per bay." },
      { name: "Bay Rental (2 Hours)", price: "$140", category: "Simulator Rentals", description: "2-hour bay rental with access to all games and sports. Perfect for small groups." },
      { name: "Birthday Party Package", price: "$500", category: "Events & Parties", description: "2-hour bay rental for up to 10 guests. Includes food & beverage credit, party host, and decorations." },
      { name: "Corporate Event Package", price: "$1200", category: "Events & Parties", description: "4-hour venue rental for up to 30 guests. Includes multiple bays, catering options, and dedicated event coordinator." },
      { name: "Team Building Package", price: "$800", category: "Events & Parties", description: "3-hour experience for up to 20 guests. Includes bay rentals, tournament setup, food & drinks." },
      { name: "Date Night Special", price: "$120", category: "Specials", description: "1.5-hour bay rental for 2 guests with appetizer platter and 2 cocktails. Available Sun-Thu after 5pm." },
      { name: "Family Fun Package", price: "$250", category: "Specials", description: "2-hour bay rental for up to 6 guests. Includes kids menu items and family-friendly game selections." }
    ]
  }
];

// Merge all businesses
const allBusinesses = [...businessData, ...gcrBusinesses];
