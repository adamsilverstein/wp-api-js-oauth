<?php

class OauthDemoWidget extends WP_Widget {

	function __construct() {
		// Instantiate the parent object
		parent::__construct( false, 'Oauth Demo Widget' );
	}

	function widget( $args, $instance ) {
		// Widget output
		?>
		<h3>OAuth Credentials</h3>
		<p>
			<div scope="row">
				<label for="oauth-name">WordPress Site</label>
			</div>
			<div>
				<input type="text" class="regular-text" name="name" id="oauth-name" placeholder="http://yoursite.com" value="">
			<p class="description">The URL of the WordPress site you want to connect to.</p>
			</div>
		</p>
		<p>
			<div scope="row">
				<label for="oauth-clientkey">Client Key</label>
			</div>
			<div>
				<input type="text" class="regular-text" name="name" id="oauth-clientkey" placeholder="" value="">
			<p class="description"></p>
			</div>
		</p>
		<p>
			<div scope="row">
				<label for="oauth-clientsecret">Client Secret</label>
			</div>
			<div>
				<input type="text" class="regular-text" name="name" id="oauth-clientsecret" placeholder="" value="">
			<p class="description"></p>
			</div>
		</p>
		<p class="submit">
			<input type="submit" name="submit" id="submit" class="button button-primary" value="Connect"
		></p>
						<?php
	}

	function update( $new_instance, $old_instance ) {
		// Save widget options
	}

	function form( $instance ) {
		// Output admin widget options form
	}
}


/**
 * Add a demo widget that enables remote login to a WordPress site with basic post editing.
 */
function oauth_add_demo_widget() {
	register_widget( 'OauthDemoWidget' );

}
add_action( 'widgets_init', 'oauth_add_demo_widget' );
