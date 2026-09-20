// @ts-check

// #region TypeDefinitions
/** @typedef {Object} UserLocation
 * @property {string} cityName
 * @property {string} countryName
 * @property {number} longitude
 * @property {number} latitude
 */
// #endregion

const CURRENT_DATE = new Date().toLocaleString('en', {
	localeMatcher: 'best fit',
	weekday: 'short',
	day: '2-digit',
	month: 'short',
	year: 'numeric',
})

const Main = document.querySelector('main')
const TodayCard = Main?.querySelector('#Today_Card')
const TableForecast = Main?.querySelector('table')

const locationHeader = TodayCard?.querySelector('strong')
const currentDateSubHead = TodayCard?.querySelector('small')

/** A function that fetches user's location data
 * @returns {Promise<UserLocation>}
 * @throws Error if response fails
 */
const getLocation = async () => {
	const fetchedLocation = await fetch('https://ipwho.is/')
		.then(response => response.json())
		.catch(err => {
			throw err.message
		})
	const userLocation = {
		cityName: fetchedLocation.city,
		countryName: fetchedLocation.country,
		longitude: fetchedLocation.longitude,
		latitude: fetchedLocation.latitude,
	}
	return userLocation
}

/** A function That returns weather Data longitude and latitude
 * @param {number} latitude The latitude of the location
 * @param {number} longitude The longitude of the location
 * @returns {Promise<Object>}
 * @throws Error when Can't get the weather.
 */
const getForecast = async (latitude, longitude) => {
	const fetchedForecast = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset,temperature_2m_min,temperature_2m_max,weather_code&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`
	)
		.then(response => response.json())
		.catch(err => {
			throw err.message
		})

	return fetchedForecast
}
/** A Function that takes in ridiculous weather code and returns emoji
 * @param {number} code - A WW weathercode
 * @returns {string} - Emoji corresponding to the code
 */
const decodeWeather = code => {
	const weatherEmoji = ['☀️', '⛅', '☁️', '🌧️', '❄️', '⛈️']

	let emojiChoice =
		code === 0 ? 0
		: code <= 3 ? 1
		: code <= 48 ? 2
		: code <= 67 || (code >= 80 && code <= 82) ? 3
		: code <= 86 ? 4
		: 5
	return weatherEmoji[emojiChoice]
}

/** Takes a HTML Element clears it and inserts thingToInsert
 * @param {HTMLElement} htmlElement
 * @param {String} thingToInsert
 */
const clearElementAndInsert = (htmlElement, thingToInsert) => {
	htmlElement.innerText = ''
	if (thingToInsert !== null) {
		htmlElement.innerText = thingToInsert
	}
}
const pageInit = () => {
	alert('1')
}

window.addEventListener('load', () => {
	pageInit()
})
