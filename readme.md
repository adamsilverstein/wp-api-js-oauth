WP-API JS OAuth

##About##
OAuth1 support for the wp-api.js WordPress Backbone JavaScript client. Requires WordPress 4.7.x.

Initial release. Development ongoing at https://github.com/adamsilverstein/wp-api-js-oauth.

##Use##
*Install the OAuth1 plugin on the site you want to access and generate an Application key.*

Connect to the OAuth server:
```js
wp.oauth.connect(
  OAuthWidgetSettings.credentials.clientKey,    // The application client key.
  OAuthWidgetSettings.credentials.clientSecret, // The application client secret.
  site + 'oauth1/request',    // The site request endpoint.
  site + 'oauth1/authorize',  // The site authorize endpoint.
  site + 'oauth1/access'      // The site access endpoint.
);
```

The client will redirect the user to the authorization page and return them to the current page with temporary authorization tokens.

The client will make a second request to retrieve the long term token and stores that token in the browsers localStorage.

The client will detect the presence of the authorization token and use it for all authenticated requests.

Currently there is no renewal mechanism for expired tokens.
