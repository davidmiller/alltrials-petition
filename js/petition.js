jQuery( document ).ready( function( $ ) {
	'use strict';

	// display required asterisks
	$( '.dk-speakup-petition label.required' ).append( '<span> *</span>');

/*
-------------------------------
	Form submission
-------------------------------
*/
	$( '.dk-speakup-submit' ).click( function( e ) {
		e.preventDefault();

		var id             = $( this ).attr( 'name' ),
			lang           = $( '#dk-speakup-lang-' + id ).val(),
			firstname      = $( '#dk-speakup-first-name-' + id ).val(),
			lastname       = $( '#dk-speakup-last-name-' + id ).val(),
			email          = $( '#dk-speakup-email-' + id ).val(),
			email_confirm  = $( '#dk-speakup-email-confirm-' + id ).val(),
			street         = $( '#dk-speakup-street-' + id ).val(),
			city           = $( '#dk-speakup-city-' + id ).val(),
			state          = $( '#dk-speakup-state-' + id ).val(),
			postcode       = $( '#dk-speakup-postcode-' + id ).val(),
			country        = $( '#dk-speakup-country-' + id ).val(),
			custom_field   = $( '#dk-speakup-custom-field-' + id ).val(),
			custom_message = $( '#dk-speakup-message-' + id ).val(),
			optin          = '',
			ajaxloader     = $( '#dk-speakup-ajaxloader-' + id );

		// toggle use of .text() / .val() to read from edited textarea properly on Firefox
		if ( $( '#dk-speakup-textval-' + id ).val() === 'text' ) {
			custom_message = $( '.dk-speakup-message-' + id ).text();
		}

		if ( $( '#dk-speakup-optin-' + id ).attr( 'checked' ) ) {
			optin = 'on';
		}

		// make sure error notices are turned off before checking for new errors
		$( '#dk-speakup-petition-' + id + ' input' ).removeClass( 'dk-speakup-error' );

		// validate form values
		var errors = 0,
			emailRegEx = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;

		if ( email_confirm !== undefined ) {
			if ( email_confirm !== email ) {
				$( '#dk-speakup-email-' + id ).addClass( 'dk-speakup-error' );
				$( '#dk-speakup-email-confirm-' + id ).addClass( 'dk-speakup-error' );
				errors ++;
			}
		}
		if ( email === '' || ! emailRegEx.test( email ) ) {
			$( '#dk-speakup-email-' + id ).addClass( 'dk-speakup-error' );
			errors ++;
		}
		if ( firstname === '' ) {
			$( '#dk-speakup-first-name-' + id ).addClass( 'dk-speakup-error' );
			errors ++;
		}
		if ( lastname === '' ) {
			$( '#dk-speakup-last-name-' + id ).addClass( 'dk-speakup-error' );
			errors ++;
		}

		// if no errors found, submit the data via ajax
		if ( errors === 0 && $( this ).attr( 'rel' ) !== 'disabled' ) {

			// set rel to disabled as flag to block double clicks
			$( this ).attr( 'rel', 'disabled' );

			var data = {
				action:         'dk_speakup_sendmail',
				id:             id,
				first_name:     firstname,
				last_name:      lastname,
				email:          email,
				street:         street,
				city:           city,
				state:          state,
				postcode:       postcode,
				country:        country,
				custom_field:   custom_field,
				custom_message: custom_message,
				optin:          optin,
				lang:           lang
			};

			// display AJAX loading animation
			ajaxloader.css({ 'visibility' : 'visible'});

                    // DM. edits here to POST at our replacement URL
			// submit form data and handle ajax response
			$.post( //'/wp-admin/admin-ajax.php',
                              '/wp-content/plugins/alltrials-petition/sign.php',
                                //dk_speakup_js.ajaxurl,
                                data,
				function( response ) {
					var response_class = 'dk-speakup-response-success';
					if ( response.status === 'error' ) {
						response_class = 'dk-speakup-response-error';
					}
					$( '#dk-speakup-petition-' + id + ' .dk-speakup-petition' ).fadeTo( 400, 0.35 );
					$( '#dk-speakup-petition-' + id + ' .dk-speakup-response' ).addClass( response_class );
					$( '#dk-speakup-petition-' + id + ' .dk-speakup-response' ).fadeIn().html( response.message );
					ajaxloader.css({ 'visibility' : 'hidden'});
				}, 'json'
			);
		}
	});

	// launch Facebook sharing window
	$( '.dk-speakup-facebook' ).click( function( e ) {
		e.preventDefault();

		var id           = $( this ).attr( 'rel' ),
			posttitle    = $( '#dk-speakup-posttitle-' + id ).val(),
			share_url    = document.URL,
			facebook_url = 'http://www.facebook.com/sharer.php?u=' + share_url + '&amp;t=' + posttitle;

		window.open( facebook_url, 'facebook', 'height=400,width=550,left=100,top=100,resizable=yes,location=no,status=no,toolbar=no' );
	});

	// launch Twitter sharing window
	$( '.dk-speakup-twitter' ).click( function( e ) {
		e.preventDefault();

		var id          = $( this ).attr( 'rel' ),
			tweet       = $( '#dk-speakup-tweet-' + id ).val(),
			current_url = document.URL,
			share_url   = current_url.split('#')[0],
			twitter_url = 'http://twitter.com/share?url=' + share_url + '&text=' + tweet;

		window.open( twitter_url, 'twitter', 'height=400,width=550,left=100,top=100,resizable=yes,location=no,status=no,toolbar=no' );
	});

/*
-------------------------------
	Petition reader popup
-------------------------------
 */
	$('a.dk-speakup-readme').click( function( e ) {
		e.preventDefault();

		var id = $( this ).attr( 'rel' ),
			sourceOffset = $(this).offset(),
			sourceTop    = sourceOffset.top - $(window).scrollTop(),
			sourceLeft   = sourceOffset.left - $(window).scrollLeft(),
			screenHeight = $( document ).height(),
			screenWidth  = $( window ).width(),
			windowHeight = $( window ).height(),
			windowWidth  = $( window ).width(),
			readerHeight = 520,
			readerWidth  = 640,
			readerTop    = ( ( windowHeight / 2 ) - ( readerHeight / 2 ) ),
			readerLeft   = ( ( windowWidth / 2 ) - ( readerWidth / 2 ) ),
			petitionText = $( 'div#dk-speakup-message-' + id ).html(),
			reader       = '<div id="dk-speakup-reader"><div id="dk-speakup-reader-close"></div><div id="dk-speakup-reader-content"></div></div>';

		// set this to toggle use of .val() / .text() so that Firefox  will read from editable-message textarea as expected
		$( '#dk-speakup-textval-' + id ).val('text');

		// use textarea for editable petition messages
		if ( petitionText === undefined ) {
			petitionText = $( '#dk-speakup-message-editable-' + id ).html();
		}

		$( '#dk-speakup-windowshade' ).css( {
				'width'  : screenWidth,
				'height' : screenHeight
			});
			$( '#dk-speakup-windowshade' ).fadeTo( 500, 0.8 );

		if ( $( '#dk-speakup-reader' ).length > 0 ) {
			$( '#dk-speakup-reader' ).remove();
		}

		$( 'body' ).append( reader );

		$('#dk-speakup-reader').css({
			position   : 'fixed',
			left       : sourceLeft,
			top        : sourceTop,
			zIndex     : 100002
		});

		$('#dk-speakup-reader').animate({
			width  : readerWidth,
			height : readerHeight,
			top    : readerTop,
			left   : readerLeft
		}, 500, function() {
			$( '#dk-speakup-reader-content' ).html( petitionText );
		});

		/* Close the pop-up petition reader */
		// by clicking windowshade area
		$( '#dk-speakup-windowshade' ).click( function () {
			$( this ).fadeOut( 'slow' );
			// write edited text to form - using .text() because target textarea has display: none
			$( '.dk-speakup-message-' + id ).text( $( '#dk-speakup-reader textarea' ).val() );
			$( '#dk-speakup-reader' ).remove();
		});
		// or by clicking the close button
		$( '#dk-speakup-reader-close' ).live( 'click', function() {
			$( '#dk-speakup-windowshade' ).fadeOut( 'slow' );
			// write edited text to form - using .text() because target textarea has display: none
			$( '.dk-speakup-message-' + id ).text( $( '#dk-speakup-reader textarea' ).val() );
			$( '#dk-speakup-reader' ).remove();
		});
		// or by pressing ESC
		$( document ).keyup( function( e ) {
			if ( e.keyCode === 27 ) {
				$( '#dk-speakup-windowshade' ).fadeOut( 'slow' );
				// write edited text to form - using .text() because target textarea has display: none
				$( '.dk-speakup-message-' + id ).text( $( '#dk-speakup-reader textarea' ).val() );
				$( '#dk-speakup-reader' ).remove();
			}
		});

	});

/*
	Toggle form labels depending on input field focus
	Leaving this in for now to support older custom themes
	But it will be removed in future updates
 */

	$( '.dk-speakup-petition-wrap input[type=text]' ).focus( function( e ) {
		var label = $( this ).siblings( 'label' );
		if ( $( this ).val() === '' ) {
			$( this ).siblings( 'label' ).addClass( 'dk-speakup-focus' ).removeClass( 'dk-speakup-blur' );
		}
		$( this ).blur( function(){
			if ( this.value === '' ) {
				label.addClass( 'dk-speakup-blur' ).removeClass( 'dk-speakup-focus' );
			}
		}).focus( function() {
			label.addClass( 'dk-speakup-focus' ).removeClass( 'dk-speakup-blur' );
		}).keydown( function( e ) {
			label.addClass( 'dk-speakup-focus' ).removeClass( 'dk-speakup-blur' );
			$( this ).unbind( e );
		});
	});

	// hide labels on filled input fields when page is reloaded
	$( '.dk-speakup-petition-wrap input[type=text]' ).each( function() {
		if ( $( this ).val() !== '' ) {
			$( this ).siblings( 'label' ).addClass( 'dk-speakup-focus' );
		}
	});

    //
    // Our extras - bind the petition slide-down
    //

    jQuery(".signlink").bind("click", openPetition);

    function openPetition() {
        jQuery('#signpetition').slideDown().bind("click",preventDefault);
        jQuery(".signlink").unbind("click", openPetition);
        jQuery(".signlink").bind("click", closePetition);
        jQuery('body').bind("click", closePetition);
        return false;
    }

    function closePetition() {
        jQuery('#signpetition').slideUp().unbind("click",preventDefault);
        jQuery('body').unbind("click", closePetition);
        jQuery(".signlink").unbind("click", closePetition);
        jQuery(".signlink").bind("click", openPetition);
        return false;
    }

    function preventDefault() {
        return false;
    }

    // splash screen stuff
    // Seriously?
    jQuery(".signlink2").bind("click", openPetition2);
    jQuery("#splash_close").bind("click", function(){jQuery('#splashscreen').slideUp();});

    function openPetition2() {
        jQuery('#signpetition').css('margin-top','-300px') ;
        jQuery('#signpetition').slideDown().bind("click",preventDefault);
        jQuery(".signlink2").unbind("click", openPetition2);
        jQuery(".signlink2").bind("click", closePetition2);
        jQuery('body').bind("click", closePetition2);
        return false;
    }
    function closePetition2() {
        jQuery('#signpetition').slideUp().unbind("click",preventDefault);
        jQuery('body').unbind("click", closePetition2);
        jQuery(".signlink2").unbind("click", closePetition2);
        jQuery(".signlink2").bind("click", openPetition2);
        return false;
    }

    var ref = document.referrer;
    if (  ref == '-' || ref.match("/alltrials.net/i") ||  jQuery.cookie('hasSeenSplash') != null ) {
        // do nothing
    } else {
        jQuery('#splashscreen').css('display','block');
        jQuery.cookie('hasSeenSplash','true');
    }




});
