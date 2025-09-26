const {
  MessageProviderPact,
  providerWithMetadata,
} = require('@pact-foundation/pact');
const { createMovie } = require('./movie.event');

const provider = new MessageProviderPact({
  messageProviders: {
    'a movie add event': providerWithMetadata(() => 
      createMovie("Demon Slayer Infinity Castle", "2025"), {
        kafka_topic: 'movies'
    }),
  },
  logLevel: 'info',
  provider: 'EventProducer',
  providerVersion: '1.0.0',
  providerVersionBranch: 'main',
  pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  pactUrls: [process.env.PACT_BROKER_BASE_URL],
  publishVerificationResult: true,
});

it('sends a valid movie', () => {
  return provider.verify();
});