const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client');

const client = new ApolloClient({
  cache: new InMemoryCache({
    addTypename: false,
  }),
  link: new HttpLink({
    fetch: require('node-fetch'),
    uri: 'http://127.0.0.1:4000/graphql',
  }),
});

const getMovies = async () => {
  const response = await client
    .query({
      query: gql`
        query MoviesQuery {
          movies {
            id
            name
            year
          }
        }
      `,
    })
    .then((result) => result.data)
    .catch((err) => err.response);

  return response;
};

const getMovieById = async (movieId) => {
  try {
    const response = await client
      .query({
        query: gql`
          query MovieQuery($movieId: Int!) {
            movie(movieId: $movieId) {
              id
              name
              year
            }
          }
        `,
        variables: {
          movieId,
        },
      });
    
    return response.data;
  } catch (err) {
    console.error('GraphQL query error:', err);
    throw err;
  }
};

module.exports = {
  getMovies,
  getMovieById,
};