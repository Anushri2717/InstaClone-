const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const SECRET = 'ig_secret_2024';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ─── DATA ───────────────────────────────────────────────

const users = [
  { id:'u1', username:'alex_morgan', password:'Alex@1234', fullName:'Alex Morgan', email:'alex@example.com', bio:'🌿 Nature lover | Photographer\n📍 Pacific Northwest', avatar:'https://i.pravatar.cc/150?img=1', followers:['u2','u3','u4','u5','u6'], following:['u2','u6','u7'], isVerified:false, website:'https://alexmorgan.photos', savedPosts:['p4','p11'] },
  { id:'u2', username:'sarah_chen', password:'Sarah@5678', fullName:'Sarah Chen', email:'sarah@example.com', bio:'🏙️ Street photography • NYC\n✨ Available for commissions', avatar:'https://i.pravatar.cc/150?img=5', followers:['u1','u3','u6','u7','u8'], following:['u1','u3','u6'], isVerified:true, website:'https://sarahchen.art', savedPosts:['p7','p15'] },
  { id:'u3', username:'mike_patel', password:'Mike@9012', fullName:'Mike Patel', email:'mike@example.com', bio:'🍜 Food explorer | Home chef\n🌶️ Spice enthusiast from Mumbai', avatar:'https://i.pravatar.cc/150?img=12', followers:['u1','u2','u5','u9'], following:['u1','u2','u4','u8'], isVerified:false, website:'', savedPosts:['p1','p20'] },
  { id:'u4', username:'emma_fit', password:'Emma@3456', fullName:'Emma Johnson', email:'emma@example.com', bio:'💪 Personal Trainer & Nutritionist\n🏋️ DM for coaching • 10k clients', avatar:'https://i.pravatar.cc/150?img=9', followers:['u2','u5','u6','u7','u8','u10'], following:['u1','u2','u9'], isVerified:true, website:'https://emmafit.co', savedPosts:['p3'] },
  { id:'u5', username:'liam_travels', password:'Liam@7890', fullName:'Liam Walker', email:'liam@example.com', bio:'✈️ 54 countries & counting\n📸 Travel stories every day', avatar:'https://i.pravatar.cc/150?img=15', followers:['u1','u2','u3','u4','u7','u9'], following:['u3','u6','u10'], isVerified:false, website:'https://liamwanders.com', savedPosts:['p6','p22'] },
  { id:'u6', username:'nina_art', password:'Nina@2345', fullName:'Nina Rossi', email:'nina@example.com', bio:'🎨 Digital artist & illustrator\n🖌️ Turning feelings into visuals', avatar:'https://i.pravatar.cc/150?img=23', followers:['u1','u3','u5','u7','u8','u9','u10'], following:['u4','u7','u8'], isVerified:true, website:'https://ninarossi.design', savedPosts:['p2','p18'] },
  { id:'u7', username:'james_dev', password:'James@6789', fullName:'James Kim', email:'james@example.com', bio:'👨‍💻 Full Stack Dev | Open Source contributor\n☕ Coffee-driven coder from Seoul', avatar:'https://i.pravatar.cc/150?img=33', followers:['u4','u6','u8','u10'], following:['u2','u6','u9','u10'], isVerified:false, website:'https://jameskim.dev', savedPosts:['p5','p13'] },
  { id:'u8', username:'sofia_ocean', password:'Sofia@0123', fullName:'Sofia Martínez', email:'sofia@example.com', bio:'🌊 Ocean advocate & freediver\n🐠 Protecting marine life one post at a time', avatar:'https://i.pravatar.cc/150?img=44', followers:['u2','u4','u6','u7'], following:['u3','u6','u5','u1'], isVerified:false, website:'', savedPosts:['p9','p21'] },
  { id:'u9', username:'tom_minimal', password:'Tom@4567', fullName:'Tom Eriksson', email:'tom@example.com', bio:'◻️ Minimal design. Maximum impact.\n🇸🇪 Based in Stockholm', avatar:'https://i.pravatar.cc/150?img=52', followers:['u3','u5','u6','u7'], following:['u1','u2','u6','u10'], isVerified:false, website:'https://tomminimal.se', savedPosts:['p14','p25'] },
  { id:'u10', username:'zoe_music', password:'Zoe@8901', fullName:'Zoe Thompson', email:'zoe@example.com', bio:'🎵 Singer-songwriter | Guitar & Piano\n🎤 New album out now!', avatar:'https://i.pravatar.cc/150?img=47', followers:['u4','u5','u7','u9'], following:['u3','u7','u8','u9'], isVerified:true, website:'https://zoemusic.com', savedPosts:['p10'] }
];

const posts = [
  { id:'p1', userId:'u1', image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', caption:'Lost in the mountains 🏔️ Some places just make you forget everything else. #nature #hiking #mountains', location:'Rocky Mountains, Colorado', likes:['u2','u3','u4','u6','u8'], createdAt:'2024-01-10T08:30:00Z' },
  { id:'p2', userId:'u1', image:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', caption:'Morning light through the forest 🌲 Golden hour is always worth waking up early for. #goldenhour #forest', location:'Olympic National Park', likes:['u2','u4','u5','u7'], createdAt:'2024-01-20T07:00:00Z' },
  { id:'p3', userId:'u1', image:'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600', caption:'Sunset at the lake 🌅 Peace and quiet. Just what the soul needed. #nofilter #lakelife #sunset', location:'Banff National Park', likes:['u3','u5','u6','u8','u9','u10'], createdAt:'2024-02-05T18:45:00Z' },
  { id:'p4', userId:'u1', image:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600', caption:'Aerial views from the drone 🚁 The world looks completely different from above. #drone #aerial #landscape', location:'Oregon Coast', likes:['u2','u6','u7','u10'], createdAt:'2024-02-18T10:00:00Z' },
  { id:'p5', userId:'u2', image:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600', caption:'NYC never sleeps 🌃 Caught this at 2am. The city has a different heartbeat at night. #streetphotography #nyc', location:'Manhattan, New York', likes:['u1','u3','u5','u6','u8','u9'], createdAt:'2024-01-15T02:00:00Z' },
  { id:'p6', userId:'u2', image:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600', caption:'Geometry in the city 📐 Architecture is just art you can walk into. #architecture #minimal #chicago', location:'Chicago, Illinois', likes:['u1','u4','u7','u9'], createdAt:'2024-01-28T14:20:00Z' },
  { id:'p7', userId:'u2', image:'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', caption:'Rush hour stories 🚶 Every person in this frame has a whole life. #citylife #peopleofsociety', location:'Times Square, NYC', likes:['u3','u5','u6','u8','u10'], createdAt:'2024-02-10T17:30:00Z' },
  { id:'p8', userId:'u2', image:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600', caption:'Brooklyn Bridge at golden hour 🌉 Some icons never get old. #brooklyn #bridge #goldenhour', location:'Brooklyn Bridge, NYC', likes:['u1','u3','u5','u7','u9'], createdAt:'2024-03-01T17:00:00Z' },
  { id:'p9', userId:'u3', image:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', caption:'Homemade Neapolitan pizza from scratch 🍕 Took 3 tries to get the dough right but SO worth it! #pizza #foodie', location:'Home Kitchen', likes:['u1','u2','u4','u5','u6','u8','u9'], createdAt:'2024-01-12T12:00:00Z' },
  { id:'p10', userId:'u3', image:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', caption:'Authentic Japanese ramen from scratch 🍜 Tonkotsu broth simmered for 12 hours. #ramen #japanesefood', location:'Tokyo Kitchen Vibes', likes:['u1','u5','u6','u7'], createdAt:'2024-01-25T13:30:00Z' },
  { id:'p11', userId:'u3', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', caption:'Sunday brunch spread 🥞 Weekend mornings hit differently when you cook. #brunch #sundaymorning', location:'Home', likes:['u2','u4','u8','u9','u10'], createdAt:'2024-02-11T10:30:00Z' },
  { id:'p12', userId:'u4', image:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', caption:'5am grind 💪 The gym is empty and the weights are all yours. No excuses today. #fitness #gym', location:'Iron Temple Gym', likes:['u2','u3','u5','u6','u7'], createdAt:'2024-01-08T05:30:00Z' },
  { id:'p13', userId:'u4', image:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', caption:'Beach yoga at sunrise 🧘‍♀️ Starting the day with intention. Breathe in. Let go. #yoga #mindfulness', location:'Malibu Beach, CA', likes:['u1','u3','u6','u8','u9'], createdAt:'2024-01-22T06:00:00Z' },
  { id:'p14', userId:'u4', image:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600', caption:'Meal prep Sunday 🥗 6 days of clean eating sorted in 2 hours. Consistency > perfection. #mealprep', location:'Kitchen', likes:['u2','u5','u7','u10'], createdAt:'2024-02-04T14:00:00Z' },
  { id:'p15', userId:'u4', image:'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600', caption:'Progress over perfection 📈 6 months of consistent training. Small steps add up. #transformation #fitness', location:'Home Gym', likes:['u1','u3','u6','u8','u9','u10'], createdAt:'2024-03-05T08:00:00Z' },
  { id:'p16', userId:'u5', image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', caption:'Maldives 🌊 Some places exist to remind you that the world is unbelievably beautiful. #maldives #paradise', location:'North Malé Atoll, Maldives', likes:['u1','u2','u3','u4','u6','u8','u9'], createdAt:'2024-01-05T09:00:00Z' },
  { id:'p17', userId:'u5', image:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', caption:'Santorini at dusk 🌅 Blue domes, white walls, the most dramatic sunsets in the world. #santorini #greece', location:'Oia, Santorini, Greece', likes:['u2','u4','u6','u7','u10'], createdAt:'2024-01-30T19:30:00Z' },
  { id:'p18', userId:'u5', image:'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=600', caption:'Tokyo streets at night 🗼 The neon, the energy, the people. Tokyo is unlike anywhere else. #tokyo #japan', location:'Shinjuku, Tokyo, Japan', likes:['u1','u2','u3','u7','u8'], createdAt:'2024-02-14T21:00:00Z' },
  { id:'p19', userId:'u5', image:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600', caption:'Backpacking through Patagonia 🏕️ 3 weeks, 1 backpack, endless mountains. #patagonia #hiking', location:'Torres del Paine, Chile', likes:['u1','u3','u6','u9','u10'], createdAt:'2024-03-10T15:00:00Z' },
  { id:'p20', userId:'u6', image:'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600', caption:'New artwork: "Dreamscape" 🎨 40 hours of work. The process is everything. #digitalart #illustration', location:'Studio, Milan', likes:['u1','u2','u5','u7','u8','u9','u10'], createdAt:'2024-01-18T16:00:00Z' },
  { id:'p21', userId:'u6', image:'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600', caption:'Sketchbook Sundays 📒 Always carry a sketchbook. The best ideas come at random moments. #sketchbook #art', location:'Café Verdi, Milan', likes:['u2','u3','u5','u8'], createdAt:'2024-01-28T11:00:00Z' },
  { id:'p22', userId:'u7', image:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600', caption:'Late night coding session ☕ Building something cool. Can\'t share yet... #coding #developer #buildinpublic', location:'Home Office, Seoul', likes:['u2','u4','u6','u9'], createdAt:'2024-01-20T23:00:00Z' },
  { id:'p23', userId:'u8', image:'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600', caption:'Morning dive 🤿 Every dive reminds us we are guests in the ocean. Protect what you love. #freediving #ocean', location:'Great Barrier Reef, Australia', likes:['u1','u3','u4','u5','u6','u10'], createdAt:'2024-02-08T07:00:00Z' },
  { id:'p24', userId:'u9', image:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', caption:'White space is not empty space 🤍 It\'s breathing room. Good design knows when to stop. #design #minimal', location:'Stockholm, Sweden', likes:['u2','u6','u7','u10'], createdAt:'2024-01-24T12:00:00Z' },
  { id:'p25', userId:'u10', image:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600', caption:'New song out now 🎵 "Golden Hour" - wrote this during a late night in the studio. Link in bio! #music #songwriter', location:'Sunset Sound Studios, LA', likes:['u1','u2','u3','u4','u5','u6','u7','u8','u9'], createdAt:'2024-02-20T12:00:00Z' }
];

const comments = [
  { id:'c1',  postId:'p1',  userId:'u2', text:'Breathtaking shot Alex! The lighting is perfect 😍', createdAt:'2024-01-10T09:00:00Z' },
  { id:'c2',  postId:'p1',  userId:'u4', text:'I hiked this trail last summer! Such an incredible view 🙌', createdAt:'2024-01-10T10:15:00Z' },
  { id:'c3',  postId:'p1',  userId:'u6', text:'The colors are insane, did you edit this?', createdAt:'2024-01-10T11:30:00Z' },
  { id:'c4',  postId:'p1',  userId:'u1', text:'@nina_art minimal editing, just some exposure adjustment!', createdAt:'2024-01-10T12:00:00Z' },
  { id:'c5',  postId:'p1',  userId:'u9', text:'Nature is the best designer 🌄', createdAt:'2024-01-10T14:20:00Z' },
  { id:'c6',  postId:'p2',  userId:'u5', text:'This reminds me of New Zealand forests!', createdAt:'2024-01-20T08:00:00Z' },
  { id:'c7',  postId:'p2',  userId:'u7', text:'Would make an amazing wallpaper 🖥️', createdAt:'2024-01-20T09:30:00Z' },
  { id:'c8',  postId:'p2',  userId:'u3', text:'Absolutely magical 🌿', createdAt:'2024-01-20T11:00:00Z' },
  { id:'c9',  postId:'p3',  userId:'u3', text:'So beautiful! Adding this to my travel list 📝', createdAt:'2024-02-05T19:30:00Z' },
  { id:'c10', postId:'p3',  userId:'u10', text:'This could be album cover art honestly 🎵', createdAt:'2024-02-05T20:00:00Z' },
  { id:'c11', postId:'p3',  userId:'u9', text:'The reflection is flawless 😮', createdAt:'2024-02-05T21:00:00Z' },
  { id:'c12', postId:'p4',  userId:'u7', text:'What drone are you using? The image quality is insane!', createdAt:'2024-02-18T11:00:00Z' },
  { id:'c13', postId:'p4',  userId:'u1', text:'@james_dev DJI Mini 4 Pro! Highly recommend it 🙌', createdAt:'2024-02-18T11:30:00Z' },
  { id:'c14', postId:'p4',  userId:'u6', text:'The composition is chef\'s kiss 🤌', createdAt:'2024-02-18T13:00:00Z' },
  { id:'c15', postId:'p5',  userId:'u1', text:'Wow Sarah this is incredible! The reflections on the wet street 😍', createdAt:'2024-01-15T08:00:00Z' },
  { id:'c16', postId:'p5',  userId:'u5', text:'NYC is on my list for this year. Saving this spot!', createdAt:'2024-01-15T09:00:00Z' },
  { id:'c17', postId:'p5',  userId:'u9', text:'Minimal and dramatic at the same time. Love it.', createdAt:'2024-01-15T10:00:00Z' },
  { id:'c18', postId:'p5',  userId:'u6', text:'The contrast between warm lights and cool shadows is 🔥', createdAt:'2024-01-15T11:00:00Z' },
  { id:'c19', postId:'p6',  userId:'u1', text:'Amazing shot Sarah! Which building is this?', createdAt:'2024-01-28T15:00:00Z' },
  { id:'c20', postId:'p6',  userId:'u2', text:'@alex_morgan It\'s the Aqua Tower! Go see it if you\'re ever in Chicago 🏢', createdAt:'2024-01-28T15:30:00Z' },
  { id:'c21', postId:'p6',  userId:'u9', text:'Geometric perfection. This is why I love modernist architecture.', createdAt:'2024-01-28T17:00:00Z' },
  { id:'c22', postId:'p7',  userId:'u8', text:'The energy in this photo is palpable 🌆', createdAt:'2024-02-10T18:00:00Z' },
  { id:'c23', postId:'p7',  userId:'u10', text:'This is storytelling through photography 🙌', createdAt:'2024-02-10T19:00:00Z' },
  { id:'c24', postId:'p7',  userId:'u3', text:'Would love to visit New York one day!', createdAt:'2024-02-10T20:00:00Z' },
  { id:'c25', postId:'p8',  userId:'u5', text:'Iconic view captured beautifully!', createdAt:'2024-03-01T18:00:00Z' },
  { id:'c26', postId:'p8',  userId:'u7', text:'My favorite bridge in the world 🌉', createdAt:'2024-03-01T19:30:00Z' },
  { id:'c27', postId:'p9',  userId:'u2', text:'Recipe pleaseee!! This looks incredible 🤤', createdAt:'2024-01-12T13:00:00Z' },
  { id:'c28', postId:'p9',  userId:'u4', text:'The char on that crust is PERFECT! Macros?? 😅', createdAt:'2024-01-12T14:00:00Z' },
  { id:'c29', postId:'p9',  userId:'u3', text:'@emma_fit haha it\'s not exactly a macro-friendly meal 😂 treat yourself!', createdAt:'2024-01-12T14:30:00Z' },
  { id:'c30', postId:'p9',  userId:'u5', text:'I had pizza like this in Naples last year. Brings back memories 🇮🇹', createdAt:'2024-01-12T16:00:00Z' },
  { id:'c31', postId:'p9',  userId:'u8', text:'The mozzarella situation is absolutely 🔥', createdAt:'2024-01-12T17:00:00Z' },
  { id:'c32', postId:'p9',  userId:'u10', text:'Dropping the recipe or keeping it secret? 👀', createdAt:'2024-01-12T18:00:00Z' },
  { id:'c33', postId:'p10', userId:'u5', text:'I had ramen in Tokyo last year and this looks just as good 😮', createdAt:'2024-01-25T14:00:00Z' },
  { id:'c34', postId:'p10', userId:'u7', text:'12 hours broth?! The dedication is real 🙏', createdAt:'2024-01-25T15:00:00Z' },
  { id:'c35', postId:'p10', userId:'u1', text:'Can I come over for dinner? Asking for a friend 😂', createdAt:'2024-01-25T16:00:00Z' },
  { id:'c36', postId:'p11', userId:'u9', text:'Clean plating, love the aesthetic 🤍', createdAt:'2024-02-11T11:00:00Z' },
  { id:'c37', postId:'p11', userId:'u4', text:'Eggs benedict is my weakness 😭', createdAt:'2024-02-11T11:30:00Z' },
  { id:'c38', postId:'p11', userId:'u10', text:'Sunday mornings are sacred 🙌', createdAt:'2024-02-11T12:00:00Z' },
  { id:'c39', postId:'p12', userId:'u7', text:'You inspire me to wake up early! Maybe tomorrow 😅', createdAt:'2024-01-08T08:00:00Z' },
  { id:'c40', postId:'p12', userId:'u5', text:'The dedication is real 🙌', createdAt:'2024-01-08T09:00:00Z' },
  { id:'c41', postId:'p12', userId:'u3', text:'Meanwhile I\'m eating ramen at 5am 😂', createdAt:'2024-01-08T10:00:00Z' },
  { id:'c42', postId:'p12', userId:'u4', text:'@mike_patel hahaha carbs are fuel Mike!!', createdAt:'2024-01-08T10:30:00Z' },
  { id:'c43', postId:'p13', userId:'u8', text:'The ocean background makes this so peaceful 🌊', createdAt:'2024-01-22T07:00:00Z' },
  { id:'c44', postId:'p13', userId:'u6', text:'Pure serenity ✨ I need this in my life', createdAt:'2024-01-22T08:00:00Z' },
  { id:'c45', postId:'p13', userId:'u1', text:'I tried yoga once, fell over immediately 😂', createdAt:'2024-01-22T09:00:00Z' },
  { id:'c46', postId:'p14', userId:'u2', text:'The organization is goals 😍', createdAt:'2024-02-04T15:00:00Z' },
  { id:'c47', postId:'p14', userId:'u10', text:'I need someone to meal prep for me 😭', createdAt:'2024-02-04T16:00:00Z' },
  { id:'c48', postId:'p14', userId:'u7', text:'As a developer I live off coffee and instant noodles 😅 send help', createdAt:'2024-02-04T17:00:00Z' },
  { id:'c49', postId:'p14', userId:'u4', text:'@james_dev DM me and I\'ll send you a beginner meal plan! 💪', createdAt:'2024-02-04T17:30:00Z' },
  { id:'c50', postId:'p15', userId:'u1', text:'This is so motivating! 🙌🙌', createdAt:'2024-03-05T09:00:00Z' },
  { id:'c51', postId:'p15', userId:'u9', text:'Consistency is everything. Respect 💪', createdAt:'2024-03-05T10:00:00Z' },
  { id:'c52', postId:'p16', userId:'u3', text:'BOOKING FLIGHTS NOW. What resort is this?! 😱', createdAt:'2024-01-05T10:00:00Z' },
  { id:'c53', postId:'p16', userId:'u5', text:'@mike_patel Gili Lankanfushi! 100% worth it 🏝️', createdAt:'2024-01-05T10:30:00Z' },
  { id:'c54', postId:'p16', userId:'u8', text:'The water clarity is unreal 🐠 The marine life must be incredible!', createdAt:'2024-01-05T11:00:00Z' },
  { id:'c55', postId:'p16', userId:'u2', text:'I\'m officially jealous. Taking notes for my next trip!', createdAt:'2024-01-05T12:00:00Z' },
  { id:'c56', postId:'p16', userId:'u9', text:'The colour palette of this photo is perfection 💙', createdAt:'2024-01-05T13:00:00Z' },
  { id:'c57', postId:'p16', userId:'u4', text:'Did you snorkel? The reefs there are supposedly amazing!', createdAt:'2024-01-05T14:00:00Z' },
  { id:'c58', postId:'p17', userId:'u10', text:'This looks like a painting 🎨 Gorgeous!', createdAt:'2024-01-30T20:00:00Z' },
  { id:'c59', postId:'p17', userId:'u6', text:'The blue and white color palette is iconic 💙🤍', createdAt:'2024-01-30T21:00:00Z' },
  { id:'c60', postId:'p17', userId:'u2', text:'Adding this to my shot list immediately!', createdAt:'2024-01-30T22:00:00Z' },
  { id:'c61', postId:'p18', userId:'u3', text:'JAPAN 😭 My dream destination. How was the food?!', createdAt:'2024-02-14T22:00:00Z' },
  { id:'c62', postId:'p18', userId:'u5', text:'@mike_patel The food was INSANE. Ramen, sushi, tempura - everything was perfect 🍣', createdAt:'2024-02-14T22:30:00Z' },
  { id:'c63', postId:'p18', userId:'u7', text:'Shinjuku at night is truly something special. Miss Japan 🇯🇵', createdAt:'2024-02-14T23:00:00Z' },
  { id:'c64', postId:'p19', userId:'u1', text:'The scale of Patagonia is hard to comprehend. Epic shot! 🏔️', createdAt:'2024-03-10T16:00:00Z' },
  { id:'c65', postId:'p19', userId:'u9', text:'3 weeks, 1 backpack. That\'s pure freedom.', createdAt:'2024-03-10T17:00:00Z' },
  { id:'c66', postId:'p20', userId:'u9', text:'The detail work is extraordinary Nina. How long did this take?', createdAt:'2024-01-18T17:00:00Z' },
  { id:'c67', postId:'p20', userId:'u6', text:'@tom_minimal About 40 hours total, spread over 2 weeks 🎨', createdAt:'2024-01-18T17:30:00Z' },
  { id:'c68', postId:'p20', userId:'u2', text:'This is STUNNING. Would love a print for my studio wall!', createdAt:'2024-01-18T18:00:00Z' },
  { id:'c69', postId:'p20', userId:'u10', text:'The colors are absolutely dreamy 💜', createdAt:'2024-01-18T19:00:00Z' },
  { id:'c70', postId:'p20', userId:'u7', text:'I could stare at this for hours. Do you take commissions?', createdAt:'2024-01-18T20:00:00Z' },
  { id:'c71', postId:'p20', userId:'u6', text:'@james_dev Yes! DM me for details 🙌', createdAt:'2024-01-18T20:30:00Z' },
  { id:'c72', postId:'p21', userId:'u3', text:'The linework is so clean! Traditional or digital?', createdAt:'2024-01-28T12:00:00Z' },
  { id:'c73', postId:'p21', userId:'u6', text:'@mike_patel Traditional! Micron pens on cartridge paper 🖊️', createdAt:'2024-01-28T12:30:00Z' },
  { id:'c74', postId:'p21', userId:'u8', text:'I love sketchbooks as art objects too 💙', createdAt:'2024-01-28T13:00:00Z' },
  { id:'c75', postId:'p22', userId:'u9', text:'The aesthetic of this setup 🖤 What monitors are those?', createdAt:'2024-01-20T23:30:00Z' },
  { id:'c76', postId:'p22', userId:'u7', text:'@tom_minimal LG UltraWides! Game changer for coding 💻', createdAt:'2024-01-21T00:00:00Z' },
  { id:'c77', postId:'p22', userId:'u2', text:'The mystery project has me intrigued 👀', createdAt:'2024-01-21T01:00:00Z' },
  { id:'c78', postId:'p23', userId:'u5', text:'Great Barrier Reef is on my must-visit list! How was it?', createdAt:'2024-02-08T08:00:00Z' },
  { id:'c79', postId:'p23', userId:'u8', text:'@liam_travels Honestly one of the most humbling experiences of my life 🙏', createdAt:'2024-02-08T08:30:00Z' },
  { id:'c80', postId:'p23', userId:'u6', text:'The underwater light is magical! What camera do you use?', createdAt:'2024-02-08T09:00:00Z' },
  { id:'c81', postId:'p23', userId:'u4', text:'I need to learn to freedive. Adding it to the fitness goals 🌊', createdAt:'2024-02-08T10:00:00Z' },
  { id:'c82', postId:'p24', userId:'u6', text:'Preach! Negative space is one of the most powerful design tools 🙌', createdAt:'2024-01-24T13:00:00Z' },
  { id:'c83', postId:'p24', userId:'u7', text:'This philosophy applies to code too. Less is more.', createdAt:'2024-01-24T14:00:00Z' },
  { id:'c84', postId:'p24', userId:'u2', text:'The light in this room is incredible 🤍', createdAt:'2024-01-24T15:00:00Z' },
  { id:'c85', postId:'p25', userId:'u1', text:'Just listened and I\'m obsessed 🎶 The bridge is incredible!', createdAt:'2024-02-20T13:00:00Z' },
  { id:'c86', postId:'p25', userId:'u5', text:'Literally been playing this on repeat all morning 🎧', createdAt:'2024-02-20T14:00:00Z' },
  { id:'c87', postId:'p25', userId:'u6', text:'The artwork for this single is everything 🎨✨', createdAt:'2024-02-20T15:00:00Z' },
  { id:'c88', postId:'p25', userId:'u3', text:'This is my new cooking playlist song 🍕🎵', createdAt:'2024-02-20T16:00:00Z' },
  { id:'c89', postId:'p25', userId:'u9', text:'Clean, emotional, timeless. Well done Zoe 🤍', createdAt:'2024-02-20T17:00:00Z' },
  { id:'c90', postId:'p25', userId:'u7', text:'I\'ve been coding to this all day. Productivity level: 💯', createdAt:'2024-02-20T18:00:00Z' }
];

const stories = [
  { id:'s1',  userId:'u1',  image:'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-2*3600000).toISOString(), seen:[] },
  { id:'s2',  userId:'u2',  image:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-3*3600000).toISOString(), seen:[] },
  { id:'s3',  userId:'u3',  image:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-1*3600000).toISOString(), seen:[] },
  { id:'s4',  userId:'u4',  image:'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-4*3600000).toISOString(), seen:[] },
  { id:'s5',  userId:'u5',  image:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-5*3600000).toISOString(), seen:[] },
  { id:'s6',  userId:'u6',  image:'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-6*3600000).toISOString(), seen:[] },
  { id:'s7',  userId:'u7',  image:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-7*3600000).toISOString(), seen:[] },
  { id:'s8',  userId:'u8',  image:'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-8*3600000).toISOString(), seen:[] },
  { id:'s9',  userId:'u9',  image:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-9*3600000).toISOString(), seen:[] },
  { id:'s10', userId:'u10', image:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=700&fit=crop', createdAt: new Date(Date.now()-10*3600000).toISOString(), seen:[] }
];

const notifications = [
  { id:'n1', toUserId:'u1', fromUserId:'u2', type:'like',    postId:'p1', read:false, createdAt: new Date(Date.now()-1800000).toISOString() },
  { id:'n2', toUserId:'u1', fromUserId:'u4', type:'comment', postId:'p1', text:'Adding to my bucket list!', read:false, createdAt: new Date(Date.now()-3600000).toISOString() },
  { id:'n3', toUserId:'u1', fromUserId:'u3', type:'follow',  postId:null, read:true,  createdAt: new Date(Date.now()-86400000).toISOString() }
];

// ─── MIDDLEWARE ──────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.userId = jwt.verify(token, SECRET).userId; next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

const safeUser = u => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

// ─── AUTH ROUTES ─────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username || u.email === username);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = user.password === password ||
    await bcrypt.compare(password, user.password).catch(() => false);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: safeUser(user) });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;
  if (!username || !email || !password || !fullName)
    return res.status(400).json({ message: 'All fields required' });
  if (users.find(u => u.username === username))
    return res.status(409).json({ message: 'Username taken' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ message: 'Email already registered' });
  const newUser = {
    id: 'u' + uuidv4().slice(0,8), username, email,
    password: await bcrypt.hash(password, 10),
    fullName, bio: '', avatar: `https://i.pravatar.cc/150?u=${username}`,
    website: '', followers: [], following: [],
    savedPosts: [], isVerified: false, createdAt: new Date().toISOString()
  };
  users.push(newUser);
  const token = jwt.sign({ userId: newUser.id }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: safeUser(newUser) });
});

// ─── USER ROUTES ─────────────────────────────────────────
app.get('/api/users/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(safeUser(user));
});

app.get('/api/users/suggestions', auth, (req, res) => {
  const me = users.find(u => u.id === req.userId);
  res.json(users.filter(u => u.id !== req.userId && !me.following.includes(u.id)).slice(0,5).map(safeUser));
});

app.get('/api/users/search', auth, (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json([]);
  res.json(users.filter(u => u.username.includes(q) || u.fullName.toLowerCase().includes(q)).slice(0,8).map(safeUser));
});

app.get('/api/users/notifications', auth, (req, res) => {
  const result = notifications
    .filter(n => n.toUserId === req.userId)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(n => ({
      ...n,
      fromUser: safeUser(users.find(u => u.id === n.fromUserId)),
      post: n.postId ? posts.find(p => p.id === n.postId) : null
    }));
  res.json(result);
});

app.patch('/api/users/notifications/read', auth, (req, res) => {
  notifications.filter(n => n.toUserId === req.userId).forEach(n => n.read = true);
  res.json({ ok: true });
});

app.get('/api/users/:username', auth, (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const me = users.find(u => u.id === req.userId);
  res.json({ ...safeUser(user), isFollowing: me.following.includes(user.id), isMe: user.id === req.userId });
});

app.get('/api/users/:username/posts', auth, (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const me = users.find(u => u.id === req.userId);
  res.json(posts.filter(p => p.userId === user.id)
    .sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
    .map(p => ({
      ...p,
      user: safeUser(user),
      likesCount: p.likes.length,
      commentsCount: comments.filter(c => c.postId === p.id).length,
      isLiked: p.likes.includes(req.userId),
      isSaved: (me?.savedPosts||[]).includes(p.id)
    })));
});

app.get('/api/users/:username/saved', auth, (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user || user.id !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const saved = posts.filter(p => user.savedPosts.includes(p.id)).map(p => {
    const owner = users.find(u => u.id === p.userId);
    return { ...p, user: safeUser(owner), likesCount: p.likes.length, commentsCount: comments.filter(c=>c.postId===p.id).length };
  });
  res.json(saved);
});

app.post('/api/users/:id/follow', auth, (req, res) => {
  const me = users.find(u => u.id === req.userId);
  const target = users.find(u => u.id === req.params.id);
  if (!target || target.id === me.id) return res.status(400).json({ message: 'Bad request' });
  const isFollowing = me.following.includes(target.id);
  if (isFollowing) {
    me.following = me.following.filter(id => id !== target.id);
    target.followers = target.followers.filter(id => id !== me.id);
  } else {
    me.following.push(target.id);
    target.followers.push(me.id);
    notifications.unshift({ id:'n'+Date.now(), toUserId:target.id, fromUserId:me.id, type:'follow', postId:null, read:false, createdAt:new Date().toISOString() });
  }
  res.json({ following: !isFollowing, followersCount: target.followers.length });
});

app.put('/api/users/me/profile', auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  const { fullName, bio, website } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (website !== undefined) user.website = website;
  res.json(safeUser(user));
});

// ─── POST ROUTES ─────────────────────────────────────────
const enrichPost = (post, userId) => {
  const owner = users.find(u => u.id === post.userId);
  const me = users.find(u => u.id === userId);
  const postComments = comments.filter(c => c.postId === post.id).map(c => {
    const cu = users.find(u => u.id === c.userId);
    return { ...c, user: cu ? safeUser(cu) : null };
  });
  return {
    ...post,
    user: owner ? safeUser(owner) : null,
    likesCount: post.likes.length,
    commentsCount: postComments.length,
    isLiked: post.likes.includes(userId),
    isSaved: (me?.savedPosts||[]).includes(post.id),
    comments: postComments
  };
};

app.get('/api/posts/feed', auth, (req, res) => {
  const me = users.find(u => u.id === req.userId);
  const ids = [req.userId, ...me.following];
  res.json(posts.filter(p => ids.includes(p.userId))
    .sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
    .map(p => enrichPost(p, req.userId)));
});

app.get('/api/posts/explore', auth, (req, res) => {
  res.json([...posts].sort((a,b) => b.likes.length - a.likes.length)
    .map(p => enrichPost(p, req.userId)));
});

app.get('/api/posts/:id', auth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json(enrichPost(post, req.userId));
});

app.post('/api/posts/:id/like', auth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  const idx = post.likes.indexOf(req.userId);
  if (idx > -1) post.likes.splice(idx, 1);
  else {
    post.likes.push(req.userId);
    if (post.userId !== req.userId) {
      notifications.unshift({ id:'n'+Date.now(), toUserId:post.userId, fromUserId:req.userId, type:'like', postId:post.id, read:false, createdAt:new Date().toISOString() });
    }
  }
  res.json({ liked: idx === -1, likesCount: post.likes.length });
});

app.post('/api/posts/:id/save', auth, (req, res) => {
  const me = users.find(u => u.id === req.userId);
  if (!me.savedPosts) me.savedPosts = [];
  const idx = me.savedPosts.indexOf(req.params.id);
  if (idx > -1) me.savedPosts.splice(idx, 1);
  else me.savedPosts.push(req.params.id);
  res.json({ saved: idx === -1 });
});

app.post('/api/posts/:id/comment', auth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Text required' });
  const nc = { id:'c'+uuidv4().slice(0,8), postId:post.id, userId:req.userId, text:text.trim(), createdAt:new Date().toISOString() };
  comments.push(nc);
  const cu = users.find(u => u.id === req.userId);
  if (post.userId !== req.userId) {
    notifications.unshift({ id:'n'+Date.now(), toUserId:post.userId, fromUserId:req.userId, type:'comment', postId:post.id, text:text.trim().slice(0,60), read:false, createdAt:new Date().toISOString() });
  }
  res.status(201).json({ ...nc, user: cu ? safeUser(cu) : null });
});

app.delete('/api/posts/:id/comment/:cid', auth, (req, res) => {
  const idx = comments.findIndex(c => c.id === req.params.cid);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  if (comments[idx].userId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  comments.splice(idx, 1);
  res.json({ ok: true });
});

app.delete('/api/posts/:id', auth, (req, res) => {
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  if (posts[idx].userId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  posts.splice(idx, 1);
  res.json({ ok: true });
});

// ─── STORY ROUTES ─────────────────────────────────────────
app.get('/api/stories', auth, (req, res) => {
  const me = users.find(u => u.id === req.userId);
  const ids = [req.userId, ...me.following];
  const cutoff = new Date(Date.now() - 24*3600*1000);
  const grouped = {};
  stories
    .filter(s => ids.includes(s.userId) && new Date(s.createdAt) > cutoff)
    .forEach(s => {
      const u = users.find(u => u.id === s.userId);
      if (!grouped[s.userId]) grouped[s.userId] = { userId:s.userId, user:safeUser(u), stories:[], allSeen:true };
      const seen = s.seen.includes(req.userId);
      grouped[s.userId].stories.push({ ...s, seen });
      if (!seen) grouped[s.userId].allSeen = false;
    });
  res.json(Object.values(grouped));
});

app.post('/api/stories/:id/seen', auth, (req, res) => {
  const s = stories.find(s => s.id === req.params.id);
  if (s && !s.seen.includes(req.userId)) s.seen.push(req.userId);
  res.json({ ok: true });
});

app.listen(5000, () => console.log('🚀 API running on http://localhost:5000'));