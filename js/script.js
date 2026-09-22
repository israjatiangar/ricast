// @ts-check

// #region Type Definitions
/** @typedef {Object} UserLocation
 * @property {String} cityName
 * @property {String} countryName
 * @property {Number} longitude
 * @property {Number} latitude
 */

/**
 * @typedef {Object} WeatherData
 * @property {Number} currentWeatherCode
 * @property {Number} currentTemperature
 * @property {Number} currentWindSpeed
 * @property {Number} currentWindDirection
 * @property {String} currentSunrise
 * @property {String} currentSunset
 * @property {Array <String>} weeklyDates
 * @property {Array <String>} weeklyMinTemperature
 * @property {Array <String>} weeklyMaxTemperature
 * @property {Array <Number>} weeklyWeatherCode
 */

/** @typedef {Object} LocationResult
 * @property {String} name
 * @property {String} country
 *
 * @typedef {Object} GeocodingResponse
 * @property {Array<LocationResult>} [results]
 *
 */
// #endregion

// #region Global Const and Class
const CURRENT_DATE = new Date().toLocaleString('en', {
	localeMatcher: 'best fit',
	weekday: 'short',
	day: '2-digit',
	month: 'short',
	year: 'numeric',
})
const DEBOUNCE_TIME = 500 //ms
/** Delcared all App UI Element in a Class for easy access and better organisation
 * @class appUIElements
 */
class appUIElements {
	TodayCard =
		/** @type {HTMLElement} */
		(document.querySelector('#Today_Card'))
	TableForecast =
		/** @type {HTMLElement} */
		(document.querySelector('#Weekly_Forecast'))

	//Order of Appearance in DOM
	//CurrentWeather Card
	locationHeader =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('strong'))

	currentDateSubHead =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('small'))

	weatherIcon =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('#Weather_Icon'))

	temperatureMain =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('#Temperature'))

	windspeed =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('#Windspeed'))
	sunrise =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('#Sunrise'))
	sunset =
		/** @type {HTMLElement} */
		(this.TodayCard.querySelector('#Sunset'))
}
class LoadingElement {
	loadingBackdrop = document.createElement('div')
	loadingSpinner = document.createElement('span')
	createLoader = () => {
		this.loadingBackdrop.classList.add('loaderBackdrop')
		this.loadingSpinner.classList.add('loader')
		this.loadingBackdrop.append(this.loadingSpinner)
		document.querySelector('body')?.append(this.loadingBackdrop)
	}
	removeLoader = () => {
		this.loadingSpinner.remove()
		this.loadingBackdrop.remove()
	}
}
class ErrorElement {
	ErrorDialog =
		/** @type {HTMLDialogElement} */
		(document.querySelector('#Error_Dialog'))
	ErrorMessage =
		/** @type {HTMLElement} */
		(this.ErrorDialog.querySelector('#Error_Message'))

	/** Function To Create A Error Dialog With Error Message
	 * @param {String} message
	 */
	showError = message => {
		this.ErrorDialog.showModal()
		this.ErrorMessage.textContent = `${message}`
	}
}
class SearchElement {
	SearchForm =
		/** @type {HTMLFieldSetElement} */
		(document.querySelector('#Search_Form'))

	SearchInput =
		/** @type {HTMLInputElement} */
		(this.SearchForm.querySelector('#Location_Input'))

	SearchOptionsList =
		/** @type {HTMLDataListElement} */
		(this.SearchForm.querySelector('#Search_Options'))

	SearchButton =
		/** @type {HTMLButtonElement} */
		(this.SearchForm.querySelector('#Search_Button'))

	CurrentLocation =
		/** @type {HTMLButtonElement} */
		(this.SearchForm.querySelector('#Current_Location'))

	searchValidation() {
		const value = this.SearchInput.value.trim()
		const test = /^[a-zA-Z][a-zA-Z0-9, _-]{1,}$/
		return test.test(value)
	}
}
// #endregion

// #region APIs that return Objects
/** A function that fetches user's location data
 * @returns {Promise<UserLocation>} Returns the UserLocation  Object
 */
const getLocation = async () => {
	const errorDialog = new ErrorElement()
	const fetchedLocation = await fetch('https://ipwho.is/')
		.then(response => {
			if (!response.ok) {
				errorDialog.showError(`${response.status}`)
			} else {
				return response.json()
			}
		})
		.catch(err => {
			errorDialog.showError(`${err.message}`)
		})
	/**@type {UserLocation} */
	const userLocation = {
		cityName: fetchedLocation.city,
		countryName: fetchedLocation.country,
		longitude: fetchedLocation.longitude,
		latitude: fetchedLocation.latitude,
	}
	return userLocation
}

/** A function That returns weather Data longitude and latitude
 * @param {number} latitude The latitude of the location, default is 0
 * @param {number} longitude The longitude of the location, default is 0
 * @returns {Promise<WeatherData>} Returns the WeatherData Object
 */
const getForecast = async (latitude = 0, longitude = 0) => {
	const errorDialog = new ErrorElement()
	const fetchedForecast = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset,temperature_2m_min,temperature_2m_max,weather_code&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`
	)
		.then(response => {
			if (!response.ok) {
				errorDialog.showError(`${response.status}`)
			} else {
				return response.json()
			}
		})
		.catch(err => {
			errorDialog.showError(`${err.message}`)
		})
	/** @type{WeatherData} */
	const weatherData = {
		currentWeatherCode: fetchedForecast.daily.weather_code[0],
		currentTemperature: fetchedForecast.current.temperature_2m,
		currentWindSpeed: fetchedForecast.current.wind_speed_10m,
		currentWindDirection: fetchedForecast.current.wind_direction_10m,
		currentSunrise: fetchedForecast.daily.sunrise[0],
		currentSunset: fetchedForecast.daily.sunset[0],
		weeklyDates: fetchedForecast.daily.time,
		weeklyMinTemperature: fetchedForecast.daily.temperature_2m_min,
		weeklyMaxTemperature: fetchedForecast.daily.temperature_2m_max,
		weeklyWeatherCode: fetchedForecast.daily.weather_code,
	}
	return weatherData
}

/** A function that takes a string and responds with a location corresponding to the string
 * @param {String} locationInput
 * @returns {Promise<UserLocation>} Returns the UserLocation Object
 */
const getLocationFromInput = async locationInput => {
	const errorDialog = new ErrorElement()
	const fetchedLocation = await fetch(
		`https://geocoding-api.open-meteo.com/v1/search?name=${locationInput}&count=1&language=en&format=json`
	)
		.then(response => {
			if (!response.ok) {
				errorDialog.showError(`${response.status}`)
			} else {
				return response.json()
			}
		})
		.catch(err => {
			errorDialog.showError(`${err.message}`)
		})

	if (!fetchedLocation.results) {
		errorDialog.showError(`Can't Find any location with that name.`)
	}
	/** @type {UserLocation}*/
	const userLocation = {
		cityName: fetchedLocation.results[0].name,
		countryName: fetchedLocation.results[0].country,
		longitude: fetchedLocation.results[0].longitude,
		latitude: fetchedLocation.results[0].latitude,
	}
	return userLocation
}

/** A Function Take Takes in Input and returns a string of matching Location Options
 * @param {String} locationInput
 * @returns {Promise<Array<String>> }
 */
const getLocationInputOptions = async locationInput => {
	/** @type {GeocodingResponse} */
	const fetchedLocation = await fetch(
		`https://geocoding-api.open-meteo.com/v1/search?name=${locationInput}&count=10&language=en&format=json`
	).then(response => response.json())

	if (!fetchedLocation.results) {
		return ['No Locations Matched']
	}

	/**@type {Array<string>} */
	const locationList = []

	fetchedLocation?.results.map(item => {
		locationList.push(`${item.name}, ${item.country}`)
	})

	return locationList
}
// #endregion

// #region Supplementary Functions
/** A Function that takes in ridiculous weather code and returns emoji
 * @param {Number} weatherCode  A WW weathercode
 * @returns {String} Emoji Corresponding to the code
 */
const decodeWeather = weatherCode => {
	const weatherEmoji = ['☀️', '⛅', '☁️', '🌧️', '❄️', '⛈️']

	let emojiChoice =
		weatherCode === 0 ? 0
		: weatherCode <= 3 ? 1
		: weatherCode <= 48 ? 2
		: weatherCode <= 67 || (weatherCode >= 80 && weatherCode <= 82) ? 3
		: weatherCode <= 86 ? 4
		: 5
	return weatherEmoji[emojiChoice]
}
/** A function that takes in a WeatherCode and Returns a Hue String
 * @param {Number} weatherCode A WW weathercode
 * @returns {String} hue A 360 deg hue that matches the vibe of the weather
 */
const weatherToHue = weatherCode => {
	let hue =
		weatherCode === 0 ? '40'
		: weatherCode <= 3 ? '90'
		: weatherCode <= 48 ? '140'
		: weatherCode <= 67 || (weatherCode >= 80 && weatherCode <= 82) ? '190'
		: weatherCode <= 86 ? '240'
		: '290'
	return hue
}
/** A function that takes in number and returns Direction
 * @param {Number} direction A Degree/Number from 0-360
 * @returns {String} Caridinal Direction of Wind + Arrow
 */
const decodeWindDirection = direction => {
	const windDirection =
		direction < 23 ? '↑N'
		: direction < 68 ? '↗NE'
		: direction < 113 ? '→E'
		: direction < 158 ? '↘SE'
		: direction < 203 ? '↓S'
		: direction < 248 ? '↙SW'
		: direction < 293 ? '←W'
		: '↑N'
	return windDirection
}
/** A Function that takes in Date String And returns Date Or Time Based on the option Parameter
 * @param {String} dateString
 * @param {String} option Either time or dayName as String
 * @returns string Value of Time or DayName Based on {option}
 */
const stringToDate = (dateString, option) => {
	switch (option) {
		case 'time':
			const time = new Date(dateString).toLocaleTimeString('en-US', {
				localeMatcher: 'best fit',
				hour12: false,
				timeStyle: 'short',
			})
			return time
		case 'dayName':
			const dayName = new Date(dateString).toLocaleDateString('en-US', {
				weekday: 'long',
			})
			return dayName
	}
}
// #endregion

// #region Page Update Function & Intial Function
/**Updates the user interface with weather forecast information.
 * @param {UserLocation | null} [searchLocation] Optional location to query, which defaults to the user's current location.
 */
const updatePage = async searchLocation => {
	const Loader = new LoadingElement()
	Loader.createLoader()
	const weatherApp = new appUIElements()

	const userLocation = searchLocation ? searchLocation : await getLocation()
	const weatherData = await getForecast(
		userLocation.latitude,
		userLocation.longitude
	)
	Loader.removeLoader()

	weatherApp.TodayCard.setAttribute(
		'data-ri-hue',
		weatherToHue(weatherData.currentWeatherCode)
	)
	weatherApp.locationHeader.innerText = `${userLocation.cityName}, ${userLocation.countryName}`
	weatherApp.currentDateSubHead.innerText = `${CURRENT_DATE}`

	weatherApp.weatherIcon.innerText = `${decodeWeather(
		weatherData.currentWeatherCode
	)}`
	weatherApp.temperatureMain.innerText = `${weatherData.currentTemperature}`
	weatherApp.windspeed.innerText = `Wind ${weatherData.currentWindSpeed}Kmph ${decodeWindDirection(weatherData.currentWindDirection)}`

	weatherApp.sunrise.innerText = `Sunrise at ${stringToDate(weatherData.currentSunrise, 'time')}`
	weatherApp.sunset.innerText = `Sunset at ${stringToDate(weatherData.currentSunset, 'time')}`

	weatherApp.TableForecast.innerText = ''
	for (let i = 1; i < weatherData.weeklyDates.length - 1; i++) {
		const weeklyWeatherCode = decodeWeather(weatherData.weeklyWeatherCode[i])

		const weeklyForecastRow = document.createElement('tr')
		const day = document.createElement('td')
		const weeklyMinTemperature = document.createElement('td')
		const weeklyMaxTemperature = document.createElement('td')

		day.innerText = `${stringToDate(weatherData.weeklyDates[i], 'dayName')}`
		weeklyMinTemperature.innerText = `${weeklyWeatherCode} ${weatherData.weeklyMinTemperature[i]}`
		weeklyMaxTemperature.textContent = `${weeklyWeatherCode} ${weatherData.weeklyMaxTemperature[i]}`

		weeklyForecastRow.setAttribute(
			'data-ri-hue',
			weatherToHue(weatherData.weeklyWeatherCode[i])
		)
		weeklyForecastRow.append(day, weeklyMinTemperature, weeklyMaxTemperature)
		weatherApp.TableForecast.append(weeklyForecastRow)
	}
}

updatePage()

const searchLocation = new SearchElement()
let inputTimer = DEBOUNCE_TIME
searchLocation.SearchInput.addEventListener('input', () => {
	searchLocation.SearchOptionsList.innerHTML = ''
	clearTimeout(inputTimer)
	inputTimer = setTimeout(async () => {
		const results = await getLocationInputOptions(
			searchLocation.SearchInput.value
		)
		results.map(option => {
			const createOption = document.createElement('option')
			createOption.setAttribute('value', option)
			searchLocation.SearchOptionsList.append(createOption)
		})
	}, DEBOUNCE_TIME)
})

searchLocation.SearchButton.addEventListener('click', async event => {
	event.preventDefault()
	if (searchLocation.searchValidation()) {
		await getLocationFromInput(searchLocation.SearchInput.value).then(
			location => {
				if (location) {
					updatePage(location)
				}
			}
		)
	}
})

searchLocation.CurrentLocation.addEventListener('click', event => {
	event.preventDefault()
	updatePage()
})
// #endregion
