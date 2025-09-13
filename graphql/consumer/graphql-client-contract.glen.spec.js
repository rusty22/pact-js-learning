
/*
Scenario: Get all movies
Given there is a movies API
When the consumer fetches all movies
Then the movies API should return a status code of 200
And for each movie, it should return the ID, name, and year it was released.
*/

const path = require('path');
const { getMovies, getMovieById, client } = require('./graphql-client.js')
const { Pact, GraphQLInteraction, MatchersV3 } 
= require('@pact-foundation/pact');

const {
    eachLike,
    integer,
    string,
  } = MatchersV3;

const provider = new Pact({
  port: 4000,
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'GraphQLConsumer',
  provider: 'GraphQLProvider',
});

const EXPECTED_BODY = { id: 1, name: "Demon Slayer: Infinity Castle", year: 2025 };

describe('Movies API - GraphQL', () => {
    // Setup the provider
    beforeAll(async () => {
        await provider.setup()
    });

    // Generate contract when all tests done
    afterAll(async () => {
        await provider.finalize()
    });

    // Verify the consumer expectations
    afterEach(async () => {
        await provider.verify()
    });


    describe('When a query to /graphql is made', () => {
        const demonSlayerTestId = 1;

        describe('To get a single movie', () => {

            beforeAll(() => {
                const movieQuery = new GraphQLInteraction()
                .given('Has a movie with specific ID', { id: demonSlayerTestId })
                .uponReceiving('a movie request')
                .withQuery(
                    `
                    query MovieQuery($movieId: Int!) {
                        movie(movieId: $movieId) {
                            id
                            name
                            year
                        }
                    }
                    `
                )
                .withOperation('MovieQuery')
                .withVariables({movieId: demonSlayerTestId})
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
                            movie: {
                                id: integer(EXPECTED_BODY.id),
                                name: string(EXPECTED_BODY.name),
                                year: integer(EXPECTED_BODY.year)
                            },
                        },
                    },
                });
                
                return provider.addInteraction(movieQuery);
            })

            test('returns the correct response', async () => {
                const response = await getMovieById(demonSlayerTestId);
                await expect(response.movie).toEqual(EXPECTED_BODY);
            });
        })
        
        describe('To get all movies', () => {

            beforeAll(() => {
                const moviesQuery = new GraphQLInteraction()
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
    
                return provider.addInteraction(moviesQuery);
            });

            test('returns the correct response', async () => {
                // Small delay to ensure mock server is ready
                await new Promise(resolve => setTimeout(resolve, 100));
                const response = await getMovies();
                await expect(response.movies[0]).toEqual(EXPECTED_BODY);
            });
        })

    });
});