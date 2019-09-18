//Collection of my functions I use often

function randint(min,max)
{ 
	return Math.floor(Math.random()*(max-min+1))+min
}

function forInRange(start,end,variable,code)
{
	eval(variable+"="+start+";for("+variable+"=start;"+variable+"<end;"+variable+"++){code()}");
}

function greater(a,b)
{
	(a>b) ? c=a : c=b;
	return c;
}
function lesser(a,b)
{
	(a<b) ? c=a : c=b;
	return c;
}

function difference(a,b)
{
	return greater(a,b) - lesser(a,b);
}


$.extend(
{
	getUrlVars:function()
	{
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar: function(name)
	{
		return $.getUrlVars()[name];
	}
});

function rad(n)
{
	return n*(Math.PI/180);
}

function getImgSize(imgSrc)
{
	var newImg = new Image();
	newImg.src = imgSrc;
	return[newImg.width,newImg.height];
}
/*
     FILE ARCHIVED ON 09:42:29 Oct 06, 2013 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 18:29:40 Sep 17, 2019.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  RedisCDXSource: 32.858
  esindex: 0.013
  exclusion.robots.policy: 0.319
  load_resource: 18.148
  LoadShardBlock: 173.025 (3)
  PetaboxLoader3.datanode: 181.436 (4)
  CDXLines.iter: 18.218 (3)
  exclusion.robots: 0.344
  captures_list: 228.52
*/