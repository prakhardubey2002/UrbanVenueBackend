const mongoose = require('mongoose');
const Calender = require('./Calender');
const data = [
    {
      name: "Delhi",
      places: [
        {
          name: "Chattarpur",
          farms: [
            {
              name: "XYZ Farm",
              events: [
                { title: "Art Expo", start: "2024-07-05T11:00:00Z", end: "2024-07-05T16:00:00Z" },
                { title: "Music Festival", start: "2024-07-20T13:00:00Z", end: "2024-07-20T22:00:00Z" }
              ]
            },
            {
              name: "Vert Farm",
              events: [
                { title: "Dance Workshop", start: "2024-07-22T15:00:00Z", end: "2024-07-22T18:00:00Z" }
              ]
            }
          ]
        },
        {
          name: "Siraspur",
          farms: [
            {
              name: "White Farm",
              events: [
                { title: "Startup Pitch", start: "2024-07-09T14:00:00Z", end: "2024-07-09T17:00:00Z" }
              ]
            },
            {
              name: "Mallu Farm",
              events: [
                { title: "Tech Conference", start: "2024-07-12T10:00:00Z", end: "2024-07-12T17:00:00Z" },
                { title: "AI Workshop", start: "2024-07-13T09:00:00Z", end: "2024-07-13T12:00:00Z" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "Maharashtra",
      places: [
        {
          name: "Mumbai",
          farms: [
            {
              name: "Gateway Farm",
              events: [
                { title: "Film Festival", start: "2024-08-15T18:00:00Z", end: "2024-08-15T23:00:00Z" },
                { title: "Startup Meetup", start: "2024-08-20T14:00:00Z", end: "2024-08-20T17:00:00Z" }
              ]
            },
            {
              name: "Seaside Farm",
              events: [
                { title: "Beach Party", start: "2024-08-25T16:00:00Z", end: "2024-08-25T22:00:00Z" }
              ]
            }
          ]
        },
        {
          name: "Pune",
          farms: [
            {
              name: "Tech Park",
              events: [
                { title: "Coding Hackathon", start: "2024-08-10T08:00:00Z", end: "2024-08-10T20:00:00Z" }
              ]
            },
            {
              name: "Art Village",
              events: [
                { title: "Craft Workshop", start: "2024-08-18T09:00:00Z", end: "2024-08-18T13:00:00Z" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "Karnataka",
      places: [
        {
          name: "Bangalore",
          farms: [
            {
              name: "Tech Hub",
              events: [
                { title: "Startup Pitch", start: "2024-09-05T10:00:00Z", end: "2024-09-05T14:00:00Z" },
                { title: "Blockchain Conference", start: "2024-09-12T09:00:00Z", end: "2024-09-12T17:00:00Z" }
              ]
            },
            {
              name: "Green Valley",
              events: [
                { title: "Sustainability Summit", start: "2024-09-18T10:00:00Z", end: "2024-09-18T18:00:00Z" }
              ]
            }
          ]
        },
        {
          name: "Mysore",
          farms: [
            {
              name: "Palace Grounds",
              events: [
                { title: "Cultural Fest", start: "2024-09-25T11:00:00Z", end: "2024-09-25T20:00:00Z" }
              ]
            }
          ]
        }
      ]
    }
  ];
  
mongoose.connect('mongodb+srv://user:user@urbanvenue.jez4o.mongodb.net/?retryWrites=true&w=majority&appName=UrbanVenue', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const insertData = async () => {
  try {
    await Calender.deleteMany({}); // Clear existing data
    await Calender.create(data);
    console.log('Data inserted successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting data:', error);
    mongoose.connection.close();
  }
};

insertData();
