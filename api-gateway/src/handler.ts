import Api from './api'
const queryString = require('query-string');

function stringify(obj) {
  return JSON.stringify(obj).replace(/\":/g, '": ').replace(/,\"/g, ', "')
}

async function init () {
  await Api.initialize()
}

async function searchAlbum (query, callback) {
  const { keyword } = query
  const { data } = await Api.client.searchFetcher
                         .setSearchCriteria(keyword, 'album')
                         .fetchSearchResult(50)

  data.albums.data = data.albums.data.map(album => {
    const m = album.release_date.match(/\d+/)
    album.release_date = m ? m[0] : ""

    return {
      ...album,
    }
  })

  callback(null, {
    statusCode: 200,
    body: stringify(data)
  })
}

async function getAlbum (query, callback) {
  const { id } = query

  let { data: meta } = await Api.client.albumFetcher.setAlbumID(id).fetchMetadata()
  let { data: tracks } = await Api.client.albumFetcher.setAlbumID(id).fetchTracks()

  meta.image = meta.images.find(image => image.height === 500)
  if (!meta.image) { meta.image = meta.images[0] }

  const m = meta.release_date.match(/\d+/)
  meta.release_date = m ? m[0] : ""

  tracks.data = tracks.data.map(track => {
    const date = new Date(null)
    date.setSeconds(Math.round(track.duration / 1000))

    let duration = date.toISOString().substr(11, 8)

    if (duration.split(':')[0] === '00') {
      const arr = duration.split(':')
      duration = `${arr[1]}:${arr[2]}`
    }

    return {
      ...track,
      '_length': duration
    }
  })

  callback(null, {
    statusCode: 200,
    body: stringify({ meta, tracks })
  })
}

export async function index(event, context, callback) {
  await init()

  // TODO: check user agent and minimum script compatible version
  const { headers: { 'User-Agent': userAgent } } = event

  const cb = async (...args) => {
    await Api.dispose()

    callback(...args)
  }

  switch(event.pathParameters.id) {
    case 'searchAlbum':
      return searchAlbum(event.queryStringParameters, cb)
    case 'albums':
      return getAlbum(event.queryStringParameters, cb)
  }

  await Api.dispose()

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Internal Server Error',
    }, null, 2),
  });
}
