const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

const tables = [
  {
    TableName: 'aerolink-users',
    AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'aerolink-flights',
    AttributeDefinitions: [{ AttributeName: 'flightId', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'flightId', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'aerolink-bookings',
    AttributeDefinitions: [{ AttributeName: 'bookingId', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'bookingId', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

const sampleFlights = [
  { flightId: 'AL-7023', flightNumber: 'AL-101', origin: 'JFK', destination: 'LHR', price: 450, totalSeats: 180, availableSeats: 120, status: 'SCHEDULED', departureTime: '2026-06-15T08:00:00Z', arrivalTime: '2026-06-15T20:00:00Z' },
  { flightId: 'AL-4491', flightNumber: 'AL-102', origin: 'LAX', destination: 'NRT', price: 800, totalSeats: 200, availableSeats: 45, status: 'SCHEDULED', departureTime: '2026-06-16T10:30:00Z', arrivalTime: '2026-06-17T14:30:00Z' },
  { flightId: 'AL-9204', flightNumber: 'AL-303', origin: 'DXB', destination: 'SYD', price: 1200, totalSeats: 150, availableSeats: 12, status: 'SCHEDULED', departureTime: '2026-06-18T22:00:00Z', arrivalTime: '2026-06-19T18:00:00Z' },
];

async function setup() {
  // Create tables
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`Created table: ${table.TableName}`);
    } catch (e) {
      if (e.name === 'ResourceInUseException') {
        console.log(`Table ${table.TableName} already exists.`);
      } else {
        console.error(`Error creating ${table.TableName}:`, e.message);
      }
    }
  }

  // Seed flights
  for (const flight of sampleFlights) {
    try {
      await docClient.send(new PutCommand({ TableName: 'aerolink-flights', Item: flight }));
      console.log(`Seeded flight: ${flight.flightId} (${flight.origin} → ${flight.destination})`);
    } catch (e) {
      console.error(`Error seeding flight ${flight.flightId}:`, e.message);
    }
  }

  console.log('\n✅ Database setup complete!');
}

setup();
