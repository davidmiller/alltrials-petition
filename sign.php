<?php
/*
 * Herein we take the data we've been sent via someone POSTing
 * a petition signature, write it to the database, and bail as
 * fast as we can.
 */

require_once( $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php' );


/**
 * Determines whether an email address has previously been used to sign the petition
 *
 * @param string $email email address
 * @return true if we've been signed by the email, false if not
 */
function has_signed( $email ){
  global $wpdb;

  $sql = "
			SELECT `id`
			FROM wp_dk_speakup_signatures
			WHERE `email` = %s AND `petitions_id` = 1
		";
  $query_results = $wpdb->get_row( $wpdb->prepare( $sql, $email) );

  if ( count( $query_results ) < 1 ) {
      return false;
  }else {
      return true;
  }
}


/*
 * Sign the petition.
 *
 * If the user has already signed, return false.
 * Otherwise, insert the POSTed form data and return true.
 */
function sign_petition(){
  global $wpdb;

  $email = strip_tags($_POST['email']);

  if( has_signed($email) ){
    return false;
  }

  $signature = array(
                     'petitions_id'      => 1,
                     'first_name'        => strip_tags($_POST['first_name']),
                     'last_name'         => strip_tags($_POST['last_name']),
                     'email'             => $email,
                     'street_address'    => '',
                     'city'              => '',
                     'state'             => '',
                     'postcode'          => '',
                     'country'           => isset($_POST['country']) ? strip_tags($_POST['country']) : '' ,
                     'custom_field'      => isset($_POST['custom_field']) ? strip_tags($_POST['custom_field']) : '' ,
                     'optin'             => '',
                     'date'              => current_time( 'mysql', 0 ),
                     'confirmation_code' => '',
                     'is_confirmed'      => '',
                     'custom_message'    => isset($_POST['custom_message']) ? strip_tags($_POST['custom_message']) : '' ,
                     'language'          => ''
                     );

  $wpdb->insert('wp_dk_speakup_signatures', $signature);
  return true;
}

/*
 * Module level Action:
 * if the petition signs, say thanks.
 * if we've already signed, say so.
 */
if( sign_petition() ){
  echo '{"status":"success","message":"<strong>Thank you, ' . strip_tags($_POST['first_name']) .'.<\/strong>\r\n<p>Your signature has been added.<\/p>"}';
}else{
  echo '{"status":"error","message":"This petition has already been signed using your email address."}';
}


/*
 * And we're done.
 * Slick.
 */
?>
