Write-Host "Creating Tables in AWS DynamoDB (us-east-1)..."

# Create users table
aws dynamodb create-table --table-name aerolink-users --attribute-definitions AttributeName=userId,AttributeType=S --key-schema AttributeName=userId,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1

# Create flights table
aws dynamodb create-table --table-name aerolink-flights --attribute-definitions AttributeName=flightId,AttributeType=S --key-schema AttributeName=flightId,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1

# Create bookings table
aws dynamodb create-table --table-name aerolink-bookings --attribute-definitions AttributeName=bookingId,AttributeType=S AttributeName=userId,AttributeType=S --key-schema AttributeName=bookingId,KeyType=HASH --global-secondary-indexes "IndexName=UserBookingsIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL}" --billing-mode PAY_PER_REQUEST --region us-east-1

# Create baggage table
aws dynamodb create-table --table-name aerolink-baggage --attribute-definitions AttributeName=baggageId,AttributeType=S AttributeName=bookingId,AttributeType=S --key-schema AttributeName=baggageId,KeyType=HASH --global-secondary-indexes "IndexName=BookingBaggageIndex,KeySchema=[{AttributeName=bookingId,KeyType=HASH}],Projection={ProjectionType=ALL}" --billing-mode PAY_PER_REQUEST --region us-east-1

Write-Host "Waiting 15 seconds for AWS tables to become ACTIVE..."
Start-Sleep -Seconds 15

Write-Host "Seeding data into AWS DynamoDB..."
cd services/auth-service
$env:DYNAMODB_ENDPOINT=""
node seed.js

Write-Host "Done!"
