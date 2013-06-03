<?php
/*
 * Herein we take the data we've been sent via someone POSTing
 * a petition signature, write it to the database, and bail as
 * fast as we can.
 */

require_once( $_SERVER['DOCUMENT_ROOT'] . '/wp-content/plugins/alltrials-petition/wp-config.php' );
$DBH = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD, true);
mysql_select_db( DB_NAME, $DBH);


/**
 * Prepares a SQL query for safe execution. Uses sprintf()-like syntax.
 *
 * The following directives can be used in the query format string:
 *   %d (integer)
 *   %f (float)
 *   %s (string)
 *   %% (literal percentage sign - no argument needed)
 *
 * All of %d, %f, and %s are to be left unquoted in the query string and they need an argument passed for them.
 * Literals (%) as parts of the query must be properly written as %%.
 *
 * This function only supports a small subset of the sprintf syntax; it only supports %d (integer), %f (float), and %s (string).
 * Does not support sign, padding, alignment, width or precision specifiers.
 * Does not support argument numbering/swapping.
 *
 * May be called like {@link http://php.net/sprintf sprintf()} or like {@link http://php.net/vsprintf vsprintf()}.
 *
 * Both %d and %s should be left unquoted in the query string.
 *
 * <code>
 * wpdb::prepare( "SELECT * FROM `table` WHERE `column` = %s AND `field` = %d", 'foo', 1337 )
 * wpdb::prepare( "SELECT DATE_FORMAT(`field`, '%%c') FROM `table` WHERE `column` = %s", 'foo' );
 * </code>
 *
 * @link http://php.net/sprintf Description of syntax.
 * @since 2.3.0
 *
 * @param string $query Query statement with sprintf()-like placeholders
 * @param array|mixed $args The array of variables to substitute into the query's placeholders if being called like
 * 	{@link http://php.net/vsprintf vsprintf()}, or the first variable to substitute into the query's placeholders if
 * 	being called like {@link http://php.net/sprintf sprintf()}.
 * @param mixed $args,... further variables to substitute into the query's placeholders if being called like
 * 	{@link http://php.net/sprintf sprintf()}.
 * @return null|false|string Sanitized query string, null if there is no query, false if there is an error and string
 * 	if there was something to prepare
 */
function prepare( $query, $args = null ) {
  if ( is_null( $query ) )
    return;

  if ( func_num_args() < 2 )
    _doing_it_wrong( 'wpdb::prepare', 'wpdb::prepare() requires at least two arguments.', '3.5' );

  $args = func_get_args();
  array_shift( $args );
  // If args were passed as an array (as in vsprintf), move them up
  if ( isset( $args[0] ) && is_array($args[0]) )
    $args = $args[0];
  $query = str_replace( "'%s'", '%s', $query ); // in case someone mistakenly already singlequoted it
  $query = str_replace( '"%s"', '%s', $query ); // doublequote unquoting
  $query = preg_replace( '|(?<!%)%f|' , '%F', $query ); // Force floats to be locale unaware
  $query = preg_replace( '|(?<!%)%s|', "'%s'", $query ); // quote the strings, avoiding escaped strings like %%s
  return @vsprintf( $query, $args );
}


/**
 * Helper function for insert and replace.
 *
 * Runs an insert or replace query based on $type argument.
 *
 * @access private
 * @since 3.0.0
 * @see wpdb::prepare()
 * @see wpdb::$field_types
 * @see wp_set_wpdb_vars()
 *
 * @param string $table table name
 * @param array $data Data to insert (in column => value pairs). Both $data columns and $data values should be "raw" (neither should be SQL escaped).
 * @param array|string $format Optional. An array of formats to be mapped to each of the value in $data. If string, that format will be used for all of the values in $data.
 * 	A format is one of '%d', '%f', '%s' (integer, float, string). If omitted, all values in $data will be treated as strings unless otherwise specified in wpdb::$field_types.
 * @param string $type Optional. What type of operation is this? INSERT or REPLACE. Defaults to INSERT.
 * @return int|false The number of rows affected, or false on error.
 */
function insert( $table, $data, $format = null, $type = 'INSERT' ) {
  global $DBH;

  if ( ! in_array( strtoupper( $type ), array( 'REPLACE', 'INSERT' ) ) )
    return false;
  $formats = $format = (array) $format;
  $fields = array_keys( $data );
  $formatted_fields = array();
  foreach ( $fields as $field ) {
    $form = '%s';
    $formatted_fields[] = $form;
  }
  $sql = "{$type} INTO `$table` (`" . implode( '`,`', $fields ) . "`) VALUES (" . implode( ",", $formatted_fields ) . ")";
  $sql = prepare( $sql, $data);
  return mysql_query($sql, $DBH);
}


/**
 * Determines whether an email address has previously been used to sign the petition
 *
 * @param string $email email address
 * @return true if we've been signed by the email, false if not
 */
function has_signed( $email ){
  global $DBH;

  $sql = "
			SELECT `id`
			FROM wp_dk_speakup_signatures
			WHERE `email` = %s AND `petitions_id` = 1
		";
  $sql = prepare( $sql, $email);

  $result = mysql_query( $sql, $DBH);
  $row = mysql_fetch_row($result);
  $id = $row[0];

  if ( $id ) {
      return true;
  }else {
      return false;
  }
}


/*
 * Sign the petition.
 *
 * If the user has already signed, return false.
 * Otherwise, insert the POSTed form data and return true.
 */
function sign_petition(){
  global $DBH;

  $email = strip_tags($_POST['email']);

  if( has_signed($email) ){
    return false;
  }

  $signature = array(
                     'petitions_id'      => 1,
                     'first_name'        => mysql_real_escape_string(strip_tags($_POST['first_name']), $DBH),
                     'last_name'         => mysql_real_escape_string(strip_tags($_POST['last_name']), $DBH),
                     'email'             => mysql_real_escape_string($email, $DBH),
                     'street_address'    => '',
                     'city'              => '',
                     'state'             => '',
                     'postcode'          => '',
                     'country'           => isset($_POST['country']) ? mysql_real_escape_string(strip_tags($_POST['country']), $DBH) : '' ,
                     'custom_field'      => isset($_POST['custom_field']) ? mysql_real_escape_string(strip_tags($_POST['custom_field']), $DBH) : '' ,
                     'optin'             => '',
                     'date'              =>  gmdate( 'Y-m-d H:i:s' ),
                     'confirmation_code' => '',
                     'is_confirmed'      => '',
                     'custom_message'    => isset($_POST['custom_message']) ? mysql_real_escape_string(strip_tags($_POST['custom_message']), $DBH) : '' ,
                     'language'          => ''
                     );

  insert('wp_dk_speakup_signatures', $signature);
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
