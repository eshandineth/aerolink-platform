const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

// This Lambda is triggered by an SQS queue which subscribes to EventBridge rules
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      // Parse the SQS message body which contains the EventBridge event
      const body = JSON.parse(record.body);
      const detailType = body['detail-type'];
      const detail = body.detail;

      let message = '';
      let subject = 'AeroLink Notification';

      switch (detailType) {
        case 'booking.confirmed':
          subject = 'Booking Confirmed!';
          message = `Your booking (ID: ${detail.bookingId}) for flight ${detail.flightId} is confirmed.`;
          break;
        case 'booking.failed':
          subject = 'Booking Failed';
          message = `Unfortunately, your booking (ID: ${detail.bookingId}) failed: ${detail.reason}`;
          break;
        case 'flight.created':
          subject = 'New Flight Available';
          message = `Flight ${detail.flightNumber} from ${detail.origin} to ${detail.destination} is now open for bookings.`;
          break;
        case 'baggage.status_updated':
          subject = 'Baggage Status Update';
          message = `Your baggage (ID: ${detail.baggageId}) status is now: ${detail.status}`;
          break;
        default:
          console.log(`Unhandled event type: ${detailType}`);
          continue;
      }

      console.log(`[SIMULATED EMAIL] To: ${detail.userId || 'Subscribers'} | Subject: ${subject} | Body: ${message}`);

      // If SNS Topic ARN is provided, send real SMS/Email
      if (process.env.SNS_TOPIC_ARN) {
        await snsClient.send(new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Subject: subject,
          Message: message
        }));
        console.log('Published to SNS successfully.');
      }
    } catch (error) {
      console.error('Error processing record:', error);
      // Throwing error puts message back on queue (or to DLQ if max retries exceeded)
      throw error; 
    }
  }
};
