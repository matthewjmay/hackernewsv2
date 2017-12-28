import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

class Search extends Component {

  state = {
    links: [],
    searchText: '',
    lastExecutedSearch: null
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const { lastExecutedSearch } = this.state
    const data = store.readQuery({ query: ALL_LINKS_SEARCH_QUERY, variables: { searchText: lastExecutedSearch } })

    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    store.writeQuery({ query: ALL_LINKS_SEARCH_QUERY, data, variables: { searchText: lastExecutedSearch }})
    this.setState( { links: data.allLinks })
  }

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type='text'
            onChange={(e) => this.setState({ searchText: e.target.value })}
          />
          <button
            onClick={() => this._executeSearch()}
          >
            OK
          </button>
        </div>
        {this.state.links.map((link, index) => <Link key={link.id} link={link} updateStoreAfterVote={this._updateCacheAfterVote} index={index}/>)}
      </div>
    )
  }

  _executeSearch = async () => {
    const { searchText } = this.state
    const result = await this.props.client.query({
      query: ALL_LINKS_SEARCH_QUERY,
      variables: { searchText }
    })
    const links = result.data.allLinks
    const lastExecutedSearch = searchText
    this.setState({ links, lastExecutedSearch })
  }

}

const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(filter: {
      OR: [{
        url_contains: $searchText
      }, {
        description_contains: $searchText
      }]
    }) {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`

export default withApollo(Search)