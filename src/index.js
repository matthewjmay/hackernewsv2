import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

import { BrowserRouter } from 'react-router-dom'
// 1
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { GC_AUTH_TOKEN } from './constants'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

const httpLink = new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cjbo3axt001ih01534w7ht0q6' })

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(GC_AUTH_TOKEN)
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })
  return forward(operation)
})

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)

const wsLink = new WebSocketLink({
	uri: 'wss://subscriptions.graph.cool/v1/cjbo3axt001ih01534w7ht0q6',
	options: {
		reconnect: true,
		connectionParams: {
			authToken: localStorage.getItem(GC_AUTH_TOKEN),
		}
	}
})

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query)
		return kind === 'OperationDefinition' && operation === 'subscription'
 	},
 	wsLink,
 	httpLinkWithAuthToken,
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

// 4
ReactDOM.render(
	<BrowserRouter>
  	<ApolloProvider client={client}>
    	<App />
  	</ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root')
)
registerServiceWorker()