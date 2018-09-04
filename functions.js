/*
Synacore Portal Software Engineer Take-Home Challenge

Written by Andrew Fanton on 7/27/2016

This script parses the JSON provided by two web services - 
one for location data and another for weather data -
and populates the accompianying HTML page accordingly
*/

var DATA_REFRESH_RATE = 60000;

var HTTP_RESPONSE_READY = 4;
var HTTP_OK = 200;

var SERVICE_PROVIDER_HOST = 'https://weathersync.herokuapp.com';
var LOCATION_SERVICE_PATH = '/ip/';
var WEATHER_SERVICE_PATH = '/weather/';

var WEATHER_ICON_PATH = 'http://openweathermap.org/img/w/';
var DEFAULT_WEATHER_ICON = 'none.png';

// Colors selected to contrast well against white background 
var RED = '#FF0000';
var ORANGE = '#E68200';
var YELLOW = '#A6A600';
var GREEN = '#008000';
var BLUE = '#0000FF';
var VIOLET = '#400040';

// Initialize page
function initializePage() {
	
	// Get initial data immediately
	getWeatherAtCurrentLocation();
	
	// Set reoccuring event to refresh data
	window.setInterval( getWeatherAtCurrentLocation, DATA_REFRESH_RATE );
}

// Pull weather information for the current location and updates the page accordingly
function getWeatherAtCurrentLocation(){
	
	console.log( 'Getting latest weather information...' );
	
	// Start a chain of functions, starting with the location service
	httpGet( SERVICE_PROVIDER_HOST + LOCATION_SERVICE_PATH, processLocationData );
}

// Process data from location service
function processLocationData( locationData ) {
	
	console.log( 'Location data recieved:', locationData );
	var data = JSON.parse( locationData );
	console.log( data ); // Log object to confirm parsing was successful
	
	if ( data && !isNaN( data.latitude ) && !isNaN( data.longitude )){
		
		// Use location data to determine weather
		var weatherServiceUrl = SERVICE_PROVIDER_HOST + WEATHER_SERVICE_PATH;
		weatherServiceUrl += data.latitude;
		weatherServiceUrl += ',';
		weatherServiceUrl += data.longitude;
		
		httpGet( weatherServiceUrl, processWeatherData );
	
	} else {
		showFailureMessage();
	}
}

// Process data from weather service
function processWeatherData( weatherData ) {
	
	console.log( 'Weather data recieved:', weatherData );
	var data = JSON.parse( weatherData );
	console.log( data ); // Log object to confirm parsing was successful
	
	// Don't proceed unless core data is available
	if ( data && data.main && data.weather ) {
		
		// Display temperature
		if ( data.main.temp ) {
			
			var temperature = Math.round( convertToFahrenheit( data.main.temp ));
			setElementContents( 'temperature', temperature + '&deg;F' );
			
			// Change text color to reinforce temperature information
			if ( temperature > 90 ) {
				setTemperatureTextColor( RED );
			} else if ( temperature > 70 ) {
				setTemperatureTextColor( ORANGE );
			} else if ( temperature > 50 ) {
				setTemperatureTextColor( YELLOW );
			} else if ( temperature > 30 ) {
				setTemperatureTextColor( GREEN );
			} else if ( temperature > 10 ) {
				setTemperatureTextColor( BLUE );
			} else {
				setTemperatureTextColor( VIOLET );
			}
		}
		
		// Display weather information
		if ( data.weather[0].icon ) {
			setElementContents( 'weather_icon', createWeatherIcon( data.weather[0].icon, data.weather[0].description ));
		}
		
		if ( data.weather[0].main ) {
			setElementContents( 'sky', data.weather[0].main );
		}
		
		// Display city name
		if ( data.name ) {
			setElementContents( 'city', data.name );
		}

		showMainContent();
		
	} else {
		showFailureMessage();
	}
}

// Converts from Kelvin to Fahrenheit
function convertToFahrenheit( kelvin ) {
	return kelvin * ( 9 / 5 ) - 459.67;
}

// Creates an image tag for the weather icon
function createWeatherIcon( iconName, altText ) {
	
	var imageHtml = '<img src="';
	if ( iconName ) {
		imageHtml += WEATHER_ICON_PATH;
		imageHtml += iconName;
		imageHtml += '.png';
	} else {
		imageHtml += DEFAULT_WEATHER_ICON;
	}
	imageHtml += '"';
	
	if ( altText ) {
		imageHtml += ' alt="';
		imageHtml += altText;
		imageHtml += '" ';
		imageHtml += 'title="';
		imageHtml += altText;
		imageHtml += '"';
	}
	
	imageHtml += ' />';
	
	return imageHtml;
}

// Fail gracefully
function showFailureMessage() {
	setElementDisplay( 'failureMessage', 'block' );
	setElementDisplay( 'main', 'none' );
	setElementDisplay( 'loadingIcon', 'none' );
}

// Show main content
function showMainContent() {
	setElementDisplay( 'main', 'block' );
	setElementDisplay( 'failureMessage', 'none' );
	setElementDisplay( 'loadingIcon', 'none' );
}

// Sets the HTML content of the specified element
function setElementContents( id, contents ) {
	
	var elem = document.getElementById( id );
	if ( elem ) {
		elem.innerHTML = new String( contents );
	}
}

// Show or hide the specified element
function setElementDisplay( id, display ) {
	
	var elem = document.getElementById( id );
	if ( elem ) {
		elem.style.display = display;
	}
}

// Sets the color of the text used to display the temperature
function setTemperatureTextColor( color ) {
	
	var elem = document.getElementById( 'temperature' );
	if ( elem ) {
		elem.style.color = color;
	}
}

// Execute an HTTP GET call to the given URL
function httpGet( url, callback ) {
	
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if ( httpRequest.readyState == HTTP_RESPONSE_READY && httpRequest.status == HTTP_OK ) {
			callback( httpRequest.responseText );
		} 
	}
	
	console.log( 'Opening connection to ' + url );
	httpRequest.open( "GET", url, true );
	httpRequest.send();
}