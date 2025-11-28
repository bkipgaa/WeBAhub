// migrateUsers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected...');

    const { User } = require('./models/users'); // Adjust path as needed

    // Update all technicians with missing fields
    const result = await User.updateMany(
      { 
        userType: 'technician',
        $or: [
          { visibilityTier: { $exists: false } },
          { isActive: { $exists: false } }
        ]
      },
      {
        $set: {
          visibilityTier: 'basic',
          isActive: true
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} technicians with default visibility settings`);

    // Fix locations for users with [0,0] coordinates
    const nairobiLocations = [
     { lng: 40.1200, lat: -3.2168 }, // Malindi Town Center
  { lng: 40.1167, lat: -3.2294 }, // Malindi Beach Area
  { lng: 40.1250, lat: -3.2100 }, // Malindi North
  { lng: 40.1100, lat: -3.2250 }, // Malindi South
  { lng: 40.1300, lat: -3.2050 }, // Malindi Airport Area
  
  // Kilifi Area
  { lng: 39.8499, lat: -3.6305 }, // Kilifi Town Center
  { lng: 39.8600, lat: -3.6200 }, // Kilifi Creek
  { lng: 39.8400, lat: -3.6400 }, // Kilifi South
  { lng: 39.8500, lat: -3.6100 }, // Kilifi North
  { lng: 39.8300, lat: -3.6500 }, // Kilifi Beach Area
  
  // Mombasa Area
  { lng: 39.6720, lat: -4.0435 }, // Mombasa Island CBD
  { lng: 39.6682, lat: -4.0544 }, // Mombasa Old Town
  { lng: 39.6500, lat: -4.0300 }, // Nyali
  { lng: 39.6800, lat: -4.0700 }, // Likoni
  { lng: 39.6300, lat: -4.0100 }, // Mtwapa
  { lng: 39.6900, lat: -4.0800 }, // Diani Beach Area
  { lng: 39.6200, lat: -4.0000 }, // Bamburi
  { lng: 39.7000, lat: -4.0900 }  // Ukunda
  
    ];

    const usersWithBadLocations = await User.find({
      'location.coordinates.0': 0,
      'location.coordinates.1': 0
    });

    console.log(`🔄 Fixing ${usersWithBadLocations.length} users with bad locations...`);

    for (let i = 0; i < usersWithBadLocations.length; i++) {
      const user = usersWithBadLocations[i];
      const location = nairobiLocations[i % nairobiLocations.length];
      
      user.location.coordinates = location;
      await user.save();
      console.log(`📍 Updated location for ${user.username}: [${location[0]}, ${location[1]}]`);
    }

    // Add premium/featured status to some technicians for testing
    const premiumTechs = await User.find({ userType: 'technician' }).limit(3);
    
    for (let i = 0; i < premiumTechs.length; i++) {
      const tech = premiumTechs[i];
      if (i === 0) {
        tech.visibilityTier = 'featured';
        tech.visibilityExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      } else if (i === 1) {
        tech.visibilityTier = 'premium';
        tech.visibilityExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }
      await tech.save();
      console.log(`👑 Updated ${tech.username} to ${tech.visibilityTier} tier`);
    }

    // Verify the migration
    const totalTechnicians = await User.countDocuments({ userType: 'technician' });
    const withVisibility = await User.countDocuments({ 
      userType: 'technician', 
      visibilityTier: { $exists: true } 
    });
    const withActive = await User.countDocuments({ 
      userType: 'technician', 
      isActive: true 
    });

    console.log('\n📊 Migration Summary:');
    console.log(`- Total technicians: ${totalTechnicians}`);
    console.log(`- With visibility tier: ${withVisibility}`);
    console.log(`- Active technicians: ${withActive}`);

    // Show visibility breakdown
    const visibilityBreakdown = await User.aggregate([
      { $match: { userType: 'technician' } },
      { $group: { _id: '$visibilityTier', count: { $sum: 1 } } }
    ]);

    console.log('\n👑 Visibility Tier Breakdown:');
    visibilityBreakdown.forEach(tier => {
      console.log(`  ${tier._id}: ${tier.count} technicians`);
    });

    console.log('\n🎉 Migration completed successfully!');
    process.exit();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();