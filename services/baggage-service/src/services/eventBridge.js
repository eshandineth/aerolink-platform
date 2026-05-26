const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

const client = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

const publishEvent = async (detailType, detail) => {
  if (process.env.NODE_ENV === 'development' && !process.env.AWS_ACCESS_KEY_ID) {
    console.log(`[LOCAL MOCK] Event published: ${detailType}`, detail);
    return;
  }
  
  try {
    const params = {
      Entries: [{
        Source: 'aerolink.baggage-service',
        DetailType: detailType,
        Detail: JSON.stringify(detail),
        EventBusName: 'aerolink-events'
      }]
    };
    await client.send(new PutEventsCommand(params));
  } catch (error) {
    console.error('Failed to publish event:', error);
  }
};

module.exports = { publishEvent };
