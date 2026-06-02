const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcrypt');

const client = new DynamoDBClient({
  region: 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

async function seed() {
  console.log("Seeding AWS DynamoDB Tables...");

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      userId: 'admin@aerolink.com',
      name: 'System Admin',
      role: 'admin',
      password: passwordHash
    },
    {
      userId: 'nipun@gmail.com',
      name: 'Nipun Ranaveera',
      role: 'passenger',
      password: passwordHash
    },
    {
      userId: 'eshan@gmail.com',
      name: 'Eshan',
      role: 'passenger',
      password: passwordHash
    }
  ];

  for (const user of users) {
    await docClient.send(new PutCommand({
      TableName: 'aerolink-users',
      Item: user
    }));
    console.log(`Seeded user: ${user.userId}`);
  }

  // 2. Seed Flights
  const flights = [
    {
      flightId: 'AL-101',
      origin: 'JFK',
      destination: 'LHR',
      availableSeats: 120,
      departureTime: new Date(Date.now() + 86400000).toISOString()
    },
    {
      flightId: 'AL-205',
      origin: 'DXB',
      destination: 'SYD',
      availableSeats: 45,
      departureTime: new Date(Date.now() + 172800000).toISOString()
    },
    {
      flightId: 'AL-309',
      origin: 'NRT',
      destination: 'SFO',
      availableSeats: 210,
      departureTime: new Date(Date.now() + 259200000).toISOString()
    }
  ];

  for (const flight of flights) {
    await docClient.send(new PutCommand({
      TableName: 'aerolink-flights',
      Item: flight
    }));
    console.log(`Seeded flight: ${flight.flightId}`);
  }

  console.log("Seeding complete! You can now login with admin@aerolink.com or nipun@gmail.com (password: password123)");
}

seed().catch(console.error);
