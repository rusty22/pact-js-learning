
/*
Scenario: Get all movies
Given there is a movies API
When the consumer fetches all movies
Then the movies API should return a status code of 200
And for each movie, it should return the ID, name, and year it was released.
*/

const path = require('path');
const { getMovies } = require('./graphql-client.js')
const { Pact, GraphQLInteraction, Matchers } 
= require('@pact-foundation/pact');
const { eachLike } = Matchers;

const provider = new Pact({
  port: 4000,
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'GraphQLConsumer',
  provider: 'GraphQLProvider',
});

const EXPECTED_BODY = { id: 1, name: "Demon Slayer: Infinity Castle", year: 2025 };

describe('GraphQL example', () => {
    beforeAll(() => provider.setup());

    describe('When a query to list all movies on /graphql is made', () => {
        beforeAll(() => {
            
            const graphqlQuery = new GraphQLInteraction()
            .uponReceiving('a movies request')
            .withQuery(
                `
                query MoviesQuery {
                movies {
                    id
                    name
                    year
                }
                }
                `
            )
            .withOperation('MoviesQuery')
            .withVariables({})
            .withRequest({
                method: 'POST',
                path: '/graphql',
            })
            .willRespondWith({
                status: 200,
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                },
                body: {
                data: {
                    movies: eachLike(EXPECTED_BODY),
                },
                },
            });

            return provider.addInteraction(graphqlQuery);

        })

        test('returns the correct response', async () => {
            const response = await getMovies();
            expect(response.movies[0]).toEqual(EXPECTED_BODY);

            provider.verify();
            provider.finalize();
        });
    });
});