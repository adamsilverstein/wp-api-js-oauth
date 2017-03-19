
// Set up the oauth object.
var wp = window.wp || {};

wp.oauth = {};

// Set up the oauth connection.
wp.oauth.setup = function( publicKey, secretKey, requestUrl, authorizeUrl ) {

	wp.oauth.debug( 'Setup OAuth', requestUrl, [ publicKey, secretKey ] );

	// We don't already have a token in the response, get one.
	if ( _.isNull( wpApiOauthSettings.oauth1Token ) ) {
		var token,
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

		wp.oauth.debug( 'Requesting authorization tokens' );

		// Request the authorization tokens.
		jQuery.ajax( {
			url:  requestData.url,
			type: requestData.method,

			// Add the authorization headers.
			beforeSend: function( xhr ) {
				var oauthHeaders = oauth.toHeader( oauth.authorize( requestData, token ) );
				_.each( oauthHeaders, function( header, index ) {
					xhr.setRequestHeader( index, header );
				} );
			}
		} ).done( function( tokens ) {
			wp.oauth.debug( 'Got authorization tokens, storing and redirecting' );
			token = wp.oauth.extractTokens( tokens, true );

			// Store the returned token data into the session.
			sessionStorage.setItem( 'tokenPublic', JSON.stringify( token['public'] ) );
			sessionStorage.setItem( 'tokenSecret', JSON.stringify( token.secret ) );

			// Redirect to the authorize URL.
			window.location.href = authorizeUrl + '?oauth_token=' + token['public'];

		} );
	}
};

wp.oauth.debug = function( a = '', b = '', c = '' ) {
	console.log( 'wp.oauth.debug', a, b, c );
}

// Extract tokens from the returned token string.
wp.oauth.extractTokens = function( tokens, hasAdditionalData ) {
	var tokenPublic, tokenSecret;
	wp.oauth.debug( 'Extracting tokens' );

	tokenPublic = tokens.substr( tokens.indexOf( 'oauth_token' ) + 'oauth_token'.length + 1, tokens.indexOf( '&', tokens.indexOf( 'oauth_token' ) ) - tokens.indexOf( 'oauth_token' ) - ( 'oauth_token'.length + 1 ) );

	if ( hasAdditionalData ) {
		tokenSecret = tokens.substr( tokens.indexOf( 'oauth_token_secret' ) + 'oauth_token_secret'.length + 1, tokens.indexOf( '&', tokens.indexOf( 'oauth_token_secret' ) ) - tokens.indexOf( 'oauth_token_secret' ) - (  'oauth_token_secret'.length + 1 ) );
	} else {
		tokenSecret = tokens.substr( tokens.indexOf( 'oauth_token_secret' ) + 'oauth_token_secret'.length + 1 );
	}

	return {
		'public': tokenPublic,
		'secret': tokenSecret
	};

};

// Set up OAuth, using localized or passed credentials.
wp.oauth.connect = function( publicKey, secretKey, request, authorize, access ) {
	var secretKey = secretKey || wpApiOauthSettings.oauth1Secret,
		publicKey = publicKey || wpApiOauthSettings.oauth1Public;
		wp.oauth.debug( 'OAuth Connect' );

	sessionStorage.setItem( 'oauth1AccessUrl', access );

	wp.oauth.debug( 'OAuth connecting' );

	if ( ! localStorage.getItem( 'wpOathToken' ) ) {

		// Setup the oath process.
		wp.oauth.setup( publicKey, secretKey, request, authorize );
	}
};

wp.oauth.getLongTermToken = function( accessUrl ) {

	wp.oauth.debug( 'wp.oauth getLongTermToken' );


	// NEXT STEP: Handle the returned temporary OAuth token, requesting a long term token.
	if ( ( ! _.isNull( wpApiOauthSettings.oauth1Token ) && ( ! localStorage.getItem( 'wpOathToken' ) ) ) ) {
		wp.oauth.debug( 'Found oauth1Token' );
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
			url: accessUrl,
			method: 'POST',
			data: {
				oauth_callback: window.location.toString().replace( location.search, '' ),
				oauth_verifier: wpApiOauthSettings.oauth1Verifier,
				oauth_token:    wpApiOauthSettings.oauth1Token
			}
		};
		wp.oauth.debug( 'Requesting long term token' );
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

			wp.oauth.debug( 'Got long term token, storing in localStorage' );

			// We have a valid token, store it in localStorage.
			token = wp.oauth.extractTokens( tokens, false );
			localStorage.setItem( 'wpOathToken', JSON.stringify( token ) );

		} );

	} else {
		wp.oauth.debug( 'Didn\'t find OAuth token' );
	}
}
	/**
	 * Set nonce header before every Backbone sync.
	 *
	 * @param {string} method.
	 * @param {Backbone.Model} model.
	 * @param {{beforeSend}, *} options.
	 * @returns {*}.
	 */
wp.api.WPApiBaseModel.prototype.sync = function( method, model, options ) {
	var beforeSend, token, oauth, requestData;

	options = options || {};

	// Remove date_gmt if null.
	if ( _.isNull( model.get( 'date_gmt' ) ) ) {
		model.unset( 'date_gmt' );
	}

	// Remove slug if empty.
	if ( _.isEmpty( model.get( 'slug' ) ) ) {
		model.unset( 'slug' );
	}

	// Use OAuth authentication if available.
	token = JSON.parse( localStorage.getItem( 'wpOathToken' ) );

	wp.oauth.debug( 'Sync with OAuth', token );

	if ( ! _.isUndefined( token ) ) {

		oauth = new OAuth( {
			consumer: {
				'public': wpApiOauthSettings.oauth1Public,
				'secret': wpApiOauthSettings.oauth1Secret
			},
			signature_method: 'HMAC-SHA1'
		} );

		options.beforeSend = function( xhr, request ) {

			requestData = {
				url: request.url,
				method: request.type
			};
			_.each( oauth.toHeader( oauth.authorize( requestData, token ) ), function( header, index ) {
				xhr.setRequestHeader( index, header );
			} );

		};

	}

	if ( ! _.isUndefined( wpApiSettings.nonce ) && ! _.isNull( wpApiSettings.nonce ) ) {
		beforeSend = options.beforeSend;

		// @todo enable option for jsonp endpoints
		// options.dataType = 'jsonp';

		options.beforeSend = function( xhr ) {
			xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );

			if ( beforeSend ) {
				return beforeSend.apply( this, arguments );
			}
		};
	}

	// Add '?force=true' to use delete method when required.
	if ( this.requireForceForDelete && 'delete' === method ) {
		model.url = model.url() + '?force=true';
	}
	return Backbone.sync( method, model, options );
}

/**
 * If we have short term tokens and not a long term token, request one.
 */
var wpOathToken = localStorage.getItem( 'wpOathToken' );

if ( ! wpOathToken && wpApiOauthSettings.oauth1Token ) {
	wp.oauth.getLongTermToken( sessionStorage.getItem( 'oauth1AccessUrl' ) );
}
