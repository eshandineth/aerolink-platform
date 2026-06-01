const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

const client = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const EVENT_BUS_NAME = 'aerolink-events';

const publishEvent = async (detailType, detail) => {
  try {
    if (process.env.NODE_ENV === 'development' || process.env.AWS_ACCESS_KEY_ID === 'dummy') {
      console.log(`[LOCAL MOCK] Event published: ${detailType}`, detail);
      return { FailedEntryCount: 0 };
    }

    const params = {
      Entries: [
        {
          Source: 'aerolink.booking-service',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: EVENT_BUS_NAME
        }
      ]
    };
    const command = new PutEventsCommand(params);
    return await client.send(command);
  } catch (error) {
    console.error('Failed to publish event:', error);
  }
};

module.exports = { publishEvent };
