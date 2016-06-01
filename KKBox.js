var cheerio = require('cheerio');
var request = require('request');
var url = require('url');

function fullUrl(req) {
	return url.format({
		protocol: req.protocol,
		host: req.get('Host'),
		pathname: '/album'
	});
}

const BASE_URL = 'https://www.kkbox.com';
const ALBUM_REGEX = /album\/(.+$)/;
const ALBUM_BASE_URL = '/tw/tc/album/';

module.exports = {
	searchAlbum: function(req, term, page=1) {
		return new Promise((resolve, reject) => {
			request(`${BASE_URL}/tw/tc/search.php?search=album&word=${encodeURIComponent(term)}&cur_page=${page}`, (error, response, body) => {
				if (error) { return reject(error) }
				var $ = cheerio.load(body);

				var albums = $('li.album').map((i, album) => {
					var $albumAnchor = $($(album).find('a')[0]);
					var $cover = $($(album).find('img')[0]);

					return {
						title: $albumAnchor.attr('title'),
						link: `${fullUrl(req)}?path=${ALBUM_REGEX.exec($albumAnchor.attr('href'))[1]}`,
						cover: $cover.attr('src')
					};
				}).toArray();

				return resolve(albums);
			});
		});
	},

	getAlbum: function(path) {
		return new Promise((resolve, reject) => {
			request(`${BASE_URL}${ALBUM_BASE_URL}${path}`, (error, response, body) => {
				if (error) { return reject(error) }
				var $ = cheerio.load(body);

				var tracks = $('ul.song-list li').map((index, track) => {
					var $song_data = $(track).find('.song-data');

					return {
						index: parseInt($(track).attr('data-song_idx')),
						title: $song_data.find('h3 a').text(),
						artist: $song_data.find('h4 a').text()
					};
				}).toArray();

				return resolve(tracks);
			});
		});
	}
};
