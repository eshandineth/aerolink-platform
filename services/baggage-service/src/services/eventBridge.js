const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

const client = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

const publishEvent = async (detailType, detail) => {
  if (process.env.NODE_ENV === 'development' && (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'dummy')) {
    console.log(`[LOCAL MOCK] Event published: ${detailType}`, detail);
    try {
      if (detailType === 'baggage.status_updated') {
        await fetch('http://websocket-service:3000/api/v1/ws/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room: `baggage_${detail.bookingId}`,
            event: 'status_update',
            data: detail
          })
        });
      }
    } catch (e) {
      console.warn("Failed to push to local websocket:", e.message);
    }
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
