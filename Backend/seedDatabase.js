// seedDatabase.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require('bcryptjs');
const { Category, User } = require("./models/users");

dotenv.config();

// Coastal Kenya locations (Malindi, Kilifi, Mombasa)
const coastalLocations = [
  // Malindi Area (15 locations)
  { lng: 40.1200, lat: -3.2168, city: "Malindi", area: "Town Center" },
  { lng: 40.1167, lat: -3.2294, city: "Malindi", area: "Beach Area" },
  { lng: 40.1250, lat: -3.2100, city: "Malindi", area: "North Malindi" },
  { lng: 40.1100, lat: -3.2250, city: "Malindi", area: "South Malindi" },
  { lng: 40.1300, lat: -3.2050, city: "Malindi", area: "Airport Area" },
  { lng: 40.1180, lat: -3.2200, city: "Malindi", area: "Central Malindi" },
  { lng: 40.1220, lat: -3.2150, city: "Malindi", area: "Malindi Market" },
  { lng: 40.1150, lat: -3.2300, city: "Malindi", area: "Casuarina" },
  { lng: 40.1280, lat: -3.2080, city: "Malindi", area: "Malindi North" },
  { lng: 40.1120, lat: -3.2280, city: "Malindi", area: "Silversands" },
  
  // Kilifi Area (15 locations)
  { lng: 39.8499, lat: -3.6305, city: "Kilifi", area: "Town Center" },
  { lng: 39.8600, lat: -3.6200, city: "Kilifi", area: "Kilifi Creek" },
  { lng: 39.8400, lat: -3.6400, city: "Kilifi", area: "South Kilifi" },
  { lng: 39.8500, lat: -3.6100, city: "Kilifi", area: "North Kilifi" },
  { lng: 39.8300, lat: -3.6500, city: "Kilifi", area: "Beach Area" },
  { lng: 39.8470, lat: -3.6320, city: "Kilifi", area: "Kilifi Bay" },
  { lng: 39.8550, lat: -3.6250, city: "Kilifi", area: "Mnarani" },
  { lng: 39.8450, lat: -3.6350, city: "Kilifi", area: "Bofa Beach" },
  { lng: 39.8350, lat: -3.6450, city: "Kilifi", area: "Takaungu" },
  { lng: 39.8420, lat: -3.6280, city: "Kilifi", area: "Kilifi Hospital" },
  
  // Mombasa Area (20 locations)
  { lng: 39.6720, lat: -4.0435, city: "Mombasa", area: "Island CBD" },
  { lng: 39.6682, lat: -4.0544, city: "Mombasa", area: "Old Town" },
  { lng: 39.6500, lat: -4.0300, city: "Mombasa", area: "Nyali" },
  { lng: 39.6800, lat: -4.0700, city: "Mombasa", area: "Likoni" },
  { lng: 39.6300, lat: -4.0100, city: "Mombasa", area: "Mtwapa" },
  { lng: 39.6900, lat: -4.0800, city: "Mombasa", area: "Diani Beach" },
  { lng: 39.6200, lat: -4.0000, city: "Mombasa", area: "Bamburi" },
  { lng: 39.7000, lat: -4.0900, city: "Mombasa", area: "Ukunda" },
  { lng: 39.6750, lat: -4.0500, city: "Mombasa", area: "Tudor" },
  { lng: 39.6650, lat: -4.0600, city: "Mombasa", area: "Changamwe" },
  { lng: 39.6550, lat: -4.0350, city: "Mombasa", area: "Kizingo" },
  { lng: 39.6850, lat: -4.0750, city: "Mombasa", area: "Shelly Beach" },
  { lng: 39.6350, lat: -4.0150, city: "Mombasa", area: "Kongowea" },
  { lng: 39.6950, lat: -4.0850, city: "Mombasa", area: "Galu Beach" },
  { lng: 39.6250, lat: -4.0050, city: "Mombasa", area: "Shanzu" }
];

const seed = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected...");

    // Clear old technician data (keep categories)
    await User.deleteMany({ userType: 'technician' });
    console.log("🧹 Old technician data cleared...");

    // Define categories with services and sub-services hierarchy
    const categoriesData = [
      {
        name: "IT & Networking",
        services: [
          {
            name: "Internet Services",
            subServices: ["Internet Installation", "Network Expansion", "Network Support"]
          },
          {
            name: "CCTV",
            subServices: ["CCTV Installation", "CCTV Maintenance"]
          },
          {
            name: "Computer Services",
            subServices: ["Software Installation & Repair", "Hardware Repair", "Virus Removal", "Data Recovery"]
          },
          {
            name: "Alarm System Installation",
            subServices: ["Alarm System Installation", "Alarm Maintenance"]
          },
          {
            name: "POS Installation & Support",
            subServices: ["POS Installation & Support", "POS Maintenance"]
          },
          {
            name: "Phone Repair",
            subServices: ["Phone Repair", "Screen Replacement", "Battery Replacement"]
          },
          {
            name: "TV Repair",
            subServices: ["TV Repair", "Display Calibration"]
          }
        ]
      },
      {
        name: "Electrical Services",
        services: [
          {
            name: "Residential Electrical",
            subServices: ["Home Electrical Wiring", "Lighting Installation", "Outlet and Switch Installation"]
          },
          {
            name: "Commercial Electrical",
            subServices: ["Electrical Panel Upgrade", "Electrical Inspection", "Emergency Electrical Repair"]
          }
        ]
      },
      {
        name: "Programming",
        services: [
          {
            name: "Web Development",
            subServices: ["Frontend Development", "Backend Development", "Full Stack Development"]
          },
          {
            name: "Mobile App Development",
            subServices: ["iOS Development", "Android Development", "Cross-platform Development"]
          },
          {
            name: "Software Services",
            subServices: ["API Development", "Software Consulting", "Code Review", "Bug Fixing", "Database Design"]
          }
        ]
      }
    ];

    // Check if categories exist, if not insert them
    const existingCategories = await Category.countDocuments();
    if (existingCategories === 0) {
      const createdCategories = await Category.insertMany(categoriesData);
      console.log(`✅ Inserted ${createdCategories.length} categories`);
    } else {
      console.log(`📁 ${existingCategories} categories already exist, skipping insertion`);
    }

    // Hash password function
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 12);
    };

    // Coastal Technician Specializations
    const technicianSpecializations = [
      // IT & Networking Technicians (15)
      { category: "IT & Networking", services: ["Internet Services"], subServices: ["Internet Installation", "Network Support"] },
      { category: "IT & Networking", services: ["Internet Services"], subServices: ["Network Expansion", "Network Support"] },
      { category: "IT & Networking", services: ["CCTV"], subServices: ["CCTV Installation", "CCTV Maintenance"] },
      { category: "IT & Networking", services: ["CCTV", "Alarm System Installation"], subServices: ["CCTV Installation", "Alarm System Installation"] },
      { category: "IT & Networking", services: ["Computer Services"], subServices: ["Hardware Repair", "Software Installation & Repair"] },
      { category: "IT & Networking", services: ["Computer Services", "Phone Repair"], subServices: ["Virus Removal", "Data Recovery", "Phone Repair"] },
      { category: "IT & Networking", services: ["POS Installation & Support"], subServices: ["POS Installation & Support", "POS Maintenance"] },
      { category: "IT & Networking", services: ["Phone Repair"], subServices: ["Screen Replacement", "Battery Replacement", "Phone Repair"] },
      { category: "IT & Networking", services: ["TV Repair"], subServices: ["TV Repair", "Display Calibration"] },
      { category: "IT & Networking", services: ["Internet Services", "CCTV"], subServices: ["Internet Installation", "CCTV Installation"] },
      
      // Electrical Services Technicians (10)
      { category: "Electrical Services", services: ["Residential Electrical"], subServices: ["Home Electrical Wiring", "Lighting Installation"] },
      { category: "Electrical Services", services: ["Residential Electrical"], subServices: ["Outlet and Switch Installation", "Lighting Installation"] },
      { category: "Electrical Services", services: ["Commercial Electrical"], subServices: ["Electrical Panel Upgrade", "Electrical Inspection"] },
      { category: "Electrical Services", services: ["Commercial Electrical"], subServices: ["Emergency Electrical Repair", "Electrical Inspection"] },
      { category: "Electrical Services", services: ["Residential Electrical", "Commercial Electrical"], subServices: ["Home Electrical Wiring", "Electrical Panel Upgrade"] },
      
      // Programming Technicians (5)
      { category: "Programming", services: ["Web Development"], subServices: ["Frontend Development", "Backend Development"] },
      { category: "Programming", services: ["Web Development"], subServices: ["Full Stack Development", "Frontend Development"] },
      { category: "Programming", services: ["Mobile App Development"], subServices: ["Android Development", "Cross-platform Development"] },
      { category: "Programming", services: ["Software Services"], subServices: ["API Development", "Software Consulting"] },
      { category: "Programming", services: ["Web Development", "Software Services"], subServices: ["Full Stack Development", "Database Design"] }
    ];

    // Generate sample technicians
    const sampleTechnicians = [];

    for (let i = 0; i < 30; i++) {
      const location = coastalLocations[i % coastalLocations.length];
      const specialization = technicianSpecializations[i % technicianSpecializations.length];
      
      const firstName = ["John", "Mary", "David", "Sarah", "Alex", "Grace", "Michael", "Lucy", "James", "Emma", 
                         "Daniel", "Sophia", "Robert", "Olivia", "William", "Ava", "Joseph", "Mia", "Thomas", "Charlotte",
                         "Charles", "Amelia", "Christopher", "Harper", "Matthew", "Evelyn", "Anthony", "Abigail", "Mark", "Emily"][i];
      
      const lastName = ["Mwangi", "Kipchoge", "Omondi", "Wanjiku", "Kamau", "Nyong'o", "Kenyatta", "Odinga", "Ruto", "Mugo",
                        "Gitau", "Wairimu", "Kariuki", "Njeri", "Maina", "Wambui", "Njoroge", "Nyambura", "Kibet", "Atieno",
                        "Otieno", "Akinyi", "Odhiambo", "Achieng", "Okoth", "Adhiambo", "Omolo", "Anyango", "Ochieng", "Awuor"][i];

      const technician = {
        username: `tech_${firstName.toLowerCase()}_${i+1}`,
        password: await hashPassword("password123"),
        email: `${firstName.toLowerCase()}.technician${i+1}@example.com`,
        phoneNumber: `+2547${10000000 + i}`,
        profilePicture: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${(i % 10) + 1}.jpg`,
        
        professions: [specialization.category.includes("IT") ? "IT technician" : 
                     specialization.category.includes("Electrical") ? "electrician" : "software engineer"],
        profession: `${specialization.category} Specialist`,
        projectRateCategory: ["under_10000", "10000_to_100000", "100000_to_1000000"][i % 3],
        
        userType: "technician",
        category: specialization.category,
        
        services: specialization.services,
        subServices: specialization.subServices,
        
        about: `Experienced ${specialization.category.toLowerCase()} specialist based in ${location.city}. ${i % 2 === 0 ? "Professional and reliable service with quick response times." : "Quality work guaranteed with years of experience in the coastal region."}`,
        
        address: { 
          street: `${i + 100} ${location.area} Street`, 
          city: location.city, 
          state: "Coastal Region", 
          zipCode: "80100" 
        },
        location: { 
          type: "Point", 
          coordinates: [location.lng, location.lat]
        },
        
        rating: { 
          average: (3.5 + (Math.random() * 1.5)).toFixed(1), // Random rating between 4.0 and 5.5
          count: Math.floor(Math.random() * 100) + 10,
          reviews: []
        },
        visibilityTier: i % 4 === 0 ? "featured" : i % 3 === 0 ? "premium" : "basic",
        visibilityExpiry: i % 4 === 0 || i % 3 === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        isActive: true
      };

      sampleTechnicians.push(technician);
    }

    // Insert technicians
    const createdTechnicians = await User.insertMany(sampleTechnicians);
    console.log(`✅ Inserted ${createdTechnicians.length} coastal technicians`);

    // Verify data
    console.log("\n📊 Coastal Database Summary:");
    
    const totalCategories = await Category.countDocuments();
    const totalTechnicians = await User.countDocuments({ userType: 'technician' });
    const techniciansWithLocation = await User.countDocuments({ 
      userType: 'technician', 
      'location.coordinates.0': { $ne: 0 } 
    });
    
    // Location distribution
    const malindiTechs = await User.countDocuments({ 
      userType: 'technician',
      'address.city': 'Malindi'
    });
    const kilifiTechs = await User.countDocuments({ 
      userType: 'technician',
      'address.city': 'Kilifi'
    });
    const mombasaTechs = await User.countDocuments({ 
      userType: 'technician',
      'address.city': 'Mombasa'
    });
    
    console.log(`- Categories: ${totalCategories}`);
    console.log(`- Total Technicians: ${totalTechnicians}`);
    console.log(`- Technicians with location data: ${techniciansWithLocation}`);
    console.log(`\n📍 Location Distribution:`);
    console.log(`  Malindi: ${malindiTechs} technicians`);
    console.log(`  Kilifi: ${kilifiTechs} technicians`);
    console.log(`  Mombasa: ${mombasaTechs} technicians`);
    
    // Category distribution
    const categoryBreakdown = await User.aggregate([
      { $match: { userType: 'technician' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log("\n🔧 Category Breakdown:");
    categoryBreakdown.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} technicians`);
    });

    // Visibility tier breakdown
    const visibilityBreakdown = await User.aggregate([
      { $match: { userType: 'technician' } },
      { $group: { _id: '$visibilityTier', count: { $sum: 1 } } }
    ]);
    
    console.log("\n👑 Visibility Tier Breakdown:");
    visibilityBreakdown.forEach(tier => {
      console.log(`  ${tier._id || 'basic'}: ${tier.count} technicians`);
    });

    // Sample technicians by city
    console.log("\n🏙️  Sample Technicians by City:");
    const cities = ['Malindi', 'Kilifi', 'Mombasa'];
    for (const city of cities) {
      const cityTechs = await User.find({ 
        userType: 'technician',
        'address.city': city
      }).limit(2);
      
      console.log(`\n${city}:`);
      cityTechs.forEach(tech => {
        console.log(`  ${tech.username} - ${tech.category} (${tech.subServices.slice(0, 2).join(', ')})`);
      });
    }

    console.log("\n🌊 Coastal database seeding completed successfully!");
    console.log("📍 All technicians are now located in Malindi, Kilifi, and Mombasa areas!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();