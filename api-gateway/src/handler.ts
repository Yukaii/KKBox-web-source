import Api from './api'
const queryString = require('query-string');

async function init () {
  await Api.initialize()
}

async function searchAlbum (query, callback) {
  const { keyword } = query
  const response = await Api.client.searchFetcher
                         .setSearchCriteria(encodeURI(keyword), 'album')
                         .fetchSearchResult(50)
  callback(null, {
    statusCode: 200,
    body: response.data
  })
}

export async function index(event, context, callback) {
  await init()

  switch(event.pathParameters.id) {
    case 'searchAlbum':
      return searchAlbum(event.queryStringParameters, callback)
  }

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Internal Server Error',
    }, null, 2),
  });
}
