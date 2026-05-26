const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

const client = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const EVENT_BUS_NAME = 'aerolink-events';

const publishEvent = async (detailType, detail) => {
  try {
    // In local development, we skip actual EventBridge publishing unless AWS credentials are set
    // This allows local docker-compose to run without AWS errors
    if (process.env.NODE_ENV === 'development' && !process.env.AWS_ACCESS_KEY_ID) {
      console.log(`[LOCAL MOCK] Event published: ${detailType}`, detail);
      return { FailedEntryCount: 0 };
    }

    const params = {
      Entries: [
        {
          Source: 'aerolink.flight-service',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: EVENT_BUS_NAME
        }
      ]
    };
    const command = new PutEventsCommand(params);
    const result = await client.send(command);
    console.log(`Event published: ${detailType}`, result);
    return result;
  } catch (error) {
    console.error('Failed to publish event:', error);
  }
};

module.exports = { publishEvent };
