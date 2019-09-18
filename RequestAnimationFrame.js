/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}

/*
     FILE ARCHIVED ON 09:43:40 Oct 06, 2013 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 18:29:40 Sep 17, 2019.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  esindex: 0.01
  exclusion.robots.policy: 0.225
  LoadShardBlock: 31.731 (3)
  RedisCDXSource: 15.264
  CDXLines.iter: 13.105 (3)
  PetaboxLoader3.datanode: 43.7 (4)
  captures_list: 63.281
  exclusion.robots: 0.24
  PetaboxLoader3.resolve: 305.163
  load_resource: 340.138
*/