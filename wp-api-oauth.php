<?php
namespace wpapioauth;
/**
 * Plugin Name: WP-API JS OAuth
 *
 * Version 1.0.1
 */

/**
 * Set up the plugin.
 */
function json_api_client_js() {

	/**
	 * @var WP_REST_Server $wp_rest_server
	 */
	global $wp_rest_server;

	// Ensure that the script is registered.
	$scripts = wp_scripts();
	$src = plugins_url( 'js/wp-api-oauth.js', __FILE__ );
	wp_register_script( 'wp-api-oauth', $src, array( 'backbone' ), '1.0', true );

	wp_enqueue_script( 'sha1', plugins_url( 'vendor/js/hmac-sha1.js', __FILE__ ), array(), true );
	wp_enqueue_script( 'sha256', plugins_url( 'vendor/js/hmac-sha256.js', __FILE__ ), array(), true );
	wp_enqueue_script( 'base64', plugins_url( 'vendor/js/enc-base64-min.js', __FILE__ ), array(), true );
	wp_enqueue_script( 'oauth1', plugins_url( 'vendor/js/oauth-1.0a.js', __FILE__ ), array( 'base64', 'sha1', 'sha256' ), true );

	// Localize the plugin settings and schema.
	$settings = array(
		'oauth1Token'    => isset( $_GET['oauth_token'] ) ? sanitize_text_field( $_GET['oauth_token'] ) : null,
		'oauth1Verifier' => isset( $_GET['oauth_verifier'] ) ? sanitize_text_field( $_GET['oauth_verifier'] ) : null,
		'oauth1Public'    => '8fJDqwctqdFf',
		'oauth1Secret'    => 'EFBoVjpjo9oVZKSEHZxO96jHpzU4tlbKzN6BowKOjLXvNPF2',
		'loggedInCookie'  => LOGGED_IN_COOKIE,
	);
	wp_localize_script( 'wp-api-oauth', 'wpApiOauthSettings', $settings );
	wp_enqueue_script( 'wp-api-oauth' );

}

	add_action( 'wp_enqueue_scripts', 'wpapioauth\json_api_client_js' );
	add_action( 'admin_enqueue_scripts', 'wpapioauth\json_api_client_js' );

