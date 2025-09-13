const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client');

const createClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache({
      addTypename: false,
    }),
    link: new HttpLink({
      fetch: require('node-fetch'),
      uri: 'http://127.0.0.1:4000/graphql',
    })
  });
};

const client = createClient();

const getMovies = async () => {
  try {
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
        fetchPolicy: 'network-only',
      });
    
    return response.data;
  } catch (err) {
    throw err;
  }
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
        fetchPolicy: 'network-only',
      });
    
    return response.data;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createClient,
};