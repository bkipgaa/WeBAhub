const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');

const FEATURED_MAX_DISTANCE = 30000; // 30km in meters
const PREMIUM_MAX_DISTANCE = 500000; // Premium can be seen from anywhere (500km limit)

/**
 * Find technicians by service with premium visibility and distance filtering
 * Simplified version using User.find() instead of complex aggregations
 */
exports.findTechniciansByService = async (req, res) => {
  try {
    const { 
      subService, 
      category, 
      lat, 
      lng, 
      distanceTier = '5-10',
      page = 1,
      limit = 50
    } = req.query;

    console.log('🔍 API Called with params:', { subService, category, lat, lng, distanceTier });

    // Validate required parameters
    if (!subService || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Sub-service and category are required' 
      });
    }

    // Distance tiers in meters
    const distanceTiers = {
      '1-5': 5000,      // 1-5 km
      '5-10': 10000,    // 5-10 km
      '10-50': 50000,   // 10-50 km
      '50-100': 100000, // 50-100 km
      '100+': 500000    // 100+ km
    };

    const maxDistance = distanceTiers[distanceTier] || distanceTiers['5-10'];

    // Base query for service and category
    const baseQuery = {
      userType: 'technician',
      isActive: true,
      category: category,
      $or: [
        { subServices: subService },
        { services: subService },
        { professions: subService }
      ]
    };

  // Initialize empty array to store filtered technicians
let technicians = [];

// Check if both latitude and longitude parameters are provided
if (lat && lng) {
  // Convert string latitude to floating point number for precise calculations
  const latitude = parseFloat(lat);
  // Convert string longitude to floating point number for precise calculations
  const longitude = parseFloat(lng);

  // Log location search parameters for debugging and monitoring
  console.log('📍 Location based search:', { 
    latitude, 
    longitude, 
    maxDistance: maxDistance / 1000 + 'km', // Convert meters to kilometers for display
    featuredMaxDistance: FEATURED_MAX_DISTANCE / 1000 + 'km' // Convert featured distance to km
  });

  // Start try-catch block to handle potential database or calculation errors
  try {
    // Fetch all technicians that match the base query criteria (service/category filters)
    const allTechnicians = await User.find(baseQuery)
      // Exclude sensitive and unnecessary fields from the response
      .select('-password -__v -savedTechnicians -preferredCategories')
      // Convert Mongoose documents to plain JavaScript objects for better performance
      .lean();

    // Log the number of technicians found before applying location filtering
    console.log(`📍 Found ${allTechnicians.length} technicians before location filter`);

    // Filter technicians based on location data and distance calculations
      
 technicians = allTechnicians.filter(tech => {
  // Check if technician has valid location data with coordinates
  if (!tech.location || !tech.location.coordinates) {
    console.log(`📍 Technician ${tech.username} has no location data`);
    return false;
  }
  
  // Destructure coordinates array [longitude, latitude] from technician's location
  const [techLng, techLat] = tech.location.coordinates;
  // Calculate distance in meters between search location and technician location
  const distance = calculateDistance(latitude, longitude, techLat, techLng);
  
  // Add calculated distance in meters to technician object
  tech.distance = distance;
  // Add display distance converted to kilometers for user-friendly display
  tech.displayDistance = distance / 1000; // Convert to km
  // Check if technician has active premium status
  tech.isPremiumActive = isPremiumActive(tech);
  // Check if technician has active featured status  
  tech.isFeaturedActive = isFeaturedActive(tech);

  // Filter logic with different rules for each tier:
  if (tech.isPremiumActive) {
    // Premium technicians - show regardless of distance (with reasonable upper limit)
    console.log(`⭐ Premium tech ${tech.username} shown at ${tech.displayDistance}km`);
    return distance <= PREMIUM_MAX_DISTANCE;
  } else if (tech.isFeaturedActive) {
    // Featured technicians - show within 0-30km range
    const isWithinFeaturedRange = distance <= FEATURED_MAX_DISTANCE;
    console.log(`🌟 Featured tech ${tech.username} at ${tech.displayDistance}km - within 30km: ${isWithinFeaturedRange}`);
    return isWithinFeaturedRange;
  } else {
    // Regular technicians - only within the selected distance tier
    const isWithinRegularRange = distance <= maxDistance;
    console.log(`🔧 Regular tech ${tech.username} at ${tech.displayDistance}km - within ${maxDistance/1000}km: ${isWithinRegularRange}`);
    return isWithinRegularRange;
  }
});

        // Sort: Premium first, then by distance, then by rating
        technicians.sort((a, b) => {
          // Premium first
          if (a.isPremiumActive && !b.isPremiumActive) return -1;
          if (!a.isPremiumActive && b.isPremiumActive) return 1;

            // Featured second
  if (a.isFeaturedActive && !b.isFeaturedActive) return -1;
  if (!a.isFeaturedActive && b.isFeaturedActive) return 1;
          
          // Same premium status - sort by distance
          if (a.distance !== b.distance) {
            return a.distance - b.distance;
          }
          
          // Same distance - sort by rating
          const ratingA = a.rating?.average || 0;
          const ratingB = b.rating?.average || 0;
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }
          
          return 0;
        });

      } catch (error) {
        console.error('❌ Error in location-based search:', error);
        // Fallback to non-location based search
        technicians = await getTechniciansWithoutLocation(baseQuery);
      }

    } else {
      // No location provided - show all technicians
      console.log('🌍 No location - showing all technicians');
      technicians = await getTechniciansWithoutLocation(baseQuery);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTechnicians = technicians.slice(startIndex, endIndex);

    // Get counts
    const premiumCount = technicians.filter(t => t.isPremiumActive).length;
    const regularCount = technicians.filter(t => !t.isPremiumActive).length;

    const response = {
      success: true,
      count: paginatedTechnicians.length,
      totalCount: technicians.length,
      premiumCount,
      regularCount,
      page: parseInt(page),
      totalPages: Math.ceil(technicians.length / limit),
      filters: {
        subService,
        category,
        distanceTier,
        maxDistance: maxDistance / 1000 + ' km',
        hasLocation: !!(lat && lng)
      },
      technicians: paginatedTechnicians
    };

    console.log('✅ API Response:', { 
      technicians: response.technicians.length,
      total: response.totalCount,
      premium: response.premiumCount,
      regular: response.regularCount
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Error finding technicians by service:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while searching for technicians',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance; // Distance in meters
}

/**
 * Helper function to check if technician has active premium status
 */
function isPremiumActive(technician) {
  if (!technician.visibilityTier) return false;
  if (technician.visibilityTier !== 'premium') return false; // ONLY premium
  if (!technician.visibilityExpiry) return false;
  
  return new Date(technician.visibilityExpiry) > new Date();
}

/**
 * Helper function to check if technician has active featured status
 */

function isFeaturedActive(technician) {
  if (!technician.visibilityTier) return false;
  if (technician.visibilityTier !== 'featured') return false; // ONLY featured
  if (!technician.visibilityExpiry) return false;
  
  return new Date(technician.visibilityExpiry) > new Date();
}

/**
 * Helper function to get technicians without location filtering
 */
async function getTechniciansWithoutLocation(baseQuery) {
  const technicians = await User.find(baseQuery)
    .select('-password -__v -savedTechnicians -preferredCategories')
    .lean();

  // Add premium status and default distance
  return technicians.map(tech => ({
    ...tech,
    displayDistance: null,
    distance: 0,
    isPremiumActive: isPremiumActive(tech)
  })).sort((a, b) => {
    // Sort by premium status and rating
    if (a.isPremiumActive && !b.isPremiumActive) return -1;
    if (!a.isPremiumActive && b.isPremiumActive) return 1;
    
    const ratingA = a.rating?.average || 0;
    const ratingB = b.rating?.average || 0;
    return ratingB - ratingA;
  });
}

/**
 * Get detailed counts including premium vs regular breakdown
 * Simplified version using User.find()
 */
exports.getTechnicianCountsByDistance = async (req, res) => {
  try {
    const { subService, category, lat, lng } = req.query;

    console.log('📊 Counts API Called with params:', { subService, category, lat, lng });

    if (!lat || !lng || !subService || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Latitude, longitude, sub-service and category are required' 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const distanceRanges = [
      { tier: '1-5', maxDistance: 5000 },
      { tier: '5-10', maxDistance: 10000 },
      { tier: '10-50', maxDistance: 50000 },
      { tier: '50-100', maxDistance: 100000 },
      { tier: '100+', maxDistance: 500000 }
    ];

    // Get all technicians for this service
    const allTechnicians = await User.find({
      userType: 'technician',
      isActive: true,
      category: category,
      $or: [
        { subServices: subService },
        { services: subService },
        { professions: subService }
      ]
    })
    .select('location visibilityTier visibilityExpiry')
    .lean();

    console.log(`📊 Found ${allTechnicians.length} technicians for counts`);

    const counts = {};
    const breakdown = {};

    // Calculate counts for each distance range
    for (const range of distanceRanges) {
      let premiumCount = 0;
      let regularCount = 0;

      allTechnicians.forEach(tech => {
        if (!tech.location || !tech.location.coordinates) return;
        
        const [techLng, techLat] = tech.location.coordinates;
        const distance = calculateDistance(latitude, longitude, techLat, techLng);
        
        if (distance <= range.maxDistance) {
          const isPremium = isPremiumActive(tech);
          if (isPremium) {
            premiumCount++;
          } else {
            regularCount++;
          }
        }
      });

      counts[range.tier] = premiumCount + regularCount;
      breakdown[range.tier] = {
        premium: premiumCount,
        regular: regularCount,
        total: premiumCount + regularCount
      };
    }

    const response = {
      success: true,
      location: { lat: latitude, lng: longitude },
      service: subService,
      category: category,
      counts,
      breakdown,
      totalTechnicians: allTechnicians.length
    };

    console.log('✅ Counts Response:', response.counts);

    res.json(response);

  } catch (error) {
    console.error('❌ Error getting technician counts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while counting technicians',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Keep your existing working function for compatibility
exports.getTechniciansByService = async (req, res) => {
  try {
    const { subService, category } = req.query;

    console.log('🔧 Legacy API Called with params:', { subService, category });

    if (!subService || !category) {
      return res.status(400).json({ message: "subService and category are required" });
    }

    // Find exact match technicians
    const exactMatches = await User.find({
      userType: "technician",
      category: category,
      subServices: subService,
    }).select("-password -__v -savedTechnicians -preferredCategories");

    // Find related (same category, different subServices)
    const relatedServices = await User.find({
      userType: "technician",
      category: category,
      subServices: { $ne: subService }
    }).select("-password -__v -savedTechnicians -preferredCategories");

    console.log(`🔧 Legacy API: ${exactMatches.length} exact, ${relatedServices.length} related`);

    res.json({ exactMatches, relatedServices });
  } catch (error) {
    console.error("Error fetching technicians by service:", error);
    res.status(500).json({ message: "Server error" });
  }
};