
// Set up the oauth object.
var wp = window.wp || {};

wp.oauth = {};

// Set up the oauth connection.
wp.oauth.setup = function( publicKey, secretKey, requestUrl ) {

// Are we using OAuth 1 and don't already have a token in the response
if ( wpApiOauthSettings.oauth1 && _.isNull( wpApiOauthSettings.oauth1Token ) ) {
	oauth = new OAuth( {
		consumer: {
			'public': publicKey,
			'secret': secretKey
		},
		signature_method: 'HMAC-SHA1'

	} );
	requestData = {
		url: requestUrl,
		method: 'POST',
		data: {
			oauth_callback: window.location.toString().replace( location.search, '' )
		}
	};

	// Request the authorization tokens.
	jQuery.ajax( {
		url: requestData.url,
		type: requestData.method,

		// Add the authorization headers.
		beforeSend: function( xhr ) {
			var oauthHeaders = oauth.toHeader( oauth.authorize( requestData, token ) );
			_.each( oauthHeaders, function( header, index ) {
				xhr.setRequestHeader( index, header );
			} );
		}
	} ).done( function( tokens ) {

		token = wp.api.utils.extractTokens( tokens, true );

		// Store the returned token data into the session.
		sessionStorage.setItem( 'tokenPublic', JSON.stringify( token['public'] ) );
		sessionStorage.setItem( 'tokenSecret', JSON.stringify( token.secret ) );

		window.location.href = wpApiOauthSettings.oauth1.authorize +  '?oauth_token=' + token['public'];

	} );
}
};


wp.oauth.debug = function( message ) {
	console.log( message );
}

// Set up OAuth, using localized or passed credentials.
wp.oauth.connect = function( publicK, secretK ) {
	var secretKey = secretK || wpApiOauthSettings.oauth1Secret,
		publicKey = publicK || wpApiOauthSettings.oauth1Public;

	if ( ! localStorage.getItem( 'wpOathToken' ) ) {

		// Setup the oath process.
		wp.oauth.setup( publicKey, secretKey, wpApiOauthSettings.oauth1.request );
	}
};
var originalInit = Backbone.Model.prototype.initialize;
Backbone.Model.prototype.initialize = function( model, arguments ) {
	wp.oauth.debug( 'Setup Oauth' );


	// NEXT STEP: Handle the returned temporary OAuth token, requesting a long term token.
	if ( ( ! _.isNull( wpApiOauthSettings.oauth1Token ) && ( ! localStorage.getItem( 'wpOathToken' ) ) ) ) {
		wp.oauth.debug( 'Found wpOathToken' );
		// Construct a new request to get a long term authorization token.
		token = {
			'public': JSON.parse( sessionStorage.getItem( 'tokenPublic' ) ),
			'secret': JSON.parse( sessionStorage.getItem( 'tokenSecret' ) )
		};
		oauth = new OAuth( {
			consumer: {
				'public': wpApiOauthSettings.oauth1Public,
				'secret': wpApiOauthSettings.oauth1Secret
			},
			signature_method: 'HMAC-SHA1'

		} );
		requestData = {
			url: wpApiOauthSettings.oauth1.access,
			method: 'POST',
			data: {
				oauth_callback: window.location.toString().replace( location.search, '' ),
				oauth_verifier: wpApiOauthSettings.oauth1Verifier,
				oauth_token:    wpApiOauthSettings.oauth1Token
			}
		};
		jQuery.ajax( {
			url: requestData.url,
			type: requestData.method,

			// Add the authorization headers.
			beforeSend: function( xhr ) {
				var oauthHeaders = oauth.toHeader( oauth.authorize( requestData, token ) );
				_.each( oauthHeaders, function( header, index ) {
					xhr.setRequestHeader( index, header );
				} );
			}
		} ).success( function( tokens ) {

			// We have a valid token, store it in localStorage.
			token = wp.api.utils.extractTokens( tokens, false );
			localStorage.setItem( 'wpOathToken', JSON.stringify( token ) );

		} );
		originalInit.apply( model, arguments );

	} else {
		wp.oauth.debug( 'Didn\'t find Oauth token' );
	}
}
