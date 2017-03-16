
// Set up the oauth object.
var wp = window.wp || {};
wp.api = wp.api || {};
wp.api.oauth = wp.oath || {};

// Set up OAuth, using localized or passed credentials.
wp.api.oauth.connect = function( publicK, secretK ) {
	var secretKey = secretK || wpApiSettings.oauth1Secret,
		publicKey = publicK || wpApiSettings.oauth1Public;

	if ( ! localStorage.getItem( 'wpOathToken' ) ) {

		// Setup the oath process.
		wp.api.oauth.setup( publicKey, secretKey, wpApiSettings.oauth1.request );
	}
};

