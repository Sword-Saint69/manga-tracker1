import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

export function getClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'https://graphql.anilist.co',
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  })
}
