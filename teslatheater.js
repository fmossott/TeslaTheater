function loadSites(callback) {
  $.getJSON('sites.json', sites => {
    console.log(sites);
    callback(sites);
  });
}


function open() {
  var link = $(this).attr('link');
  gtag('event', `open`, {
    siteId: $(this).attr('id'),
    siteUrl: link,
    mode: fullscreen ? "same-window" : "fullscreen"
  });

  if (fullscreen) {
    window.location.href = link;
  } else {
    window.location.href = 'https://www.youtube.com/redirect?q='+link;
  }
}

function buildPage(sites) {
  const $apps = $('#apps');

  appsStatus = getCookie('appsStatus',{});
  setCookie('appsStatus', appsStatus); // update cookie expiration every time

  console.log(appsStatus);

  $apps.children('.button').remove();

  const $template = $($('#site-template').html());

  // Add the sites from sorted list
  if (appsStatus['order']) {
    for (const siteId of appsStatus['order']) {
      let site = sites[siteId];
      if (site) {
        addSiteButton($template, siteId, sites[siteId], $apps);
        delete sites[siteId];
      }
    }
  }

  for (const siteId in sites) {
    addSiteButton($template, siteId, sites[siteId], $apps);
  }

  setTimeout(() => storeOrder($apps), 1000);

  $apps.sortable({
    placeholder: 'button highlight',
    update: function(event, ui) {
      storeOrder($(this));
    }});
}

function storeOrder($apps) {
  appsStatus['order'] = $apps.sortable('toArray');
  setCookie('appsStatus', appsStatus);
}

function addSiteButton($template, siteId, site, $apps) {
  const $app = $template.clone();
  $app.attr('id', siteId);
  $app.attr('link', site.url);
  $app.find('img').attr('src', `images/${site.img}`).attr('alt', site.name);
  $app.on('click', open);
  $app.appendTo($apps);
}

function queryparam(key) {
  var match = window.location.search.match(new RegExp('[?&]'+key+'=([^&]+)(&|$)'));
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function setCookie(cname, cvalue) {
  if (cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + (10 * 365 * 24 * 60 * 60 * 1000));
    let expires = 'expires='+d.toUTCString();
    document.cookie = cname + '=' + JSON.stringify(cvalue) + ';' + expires + ';path=/';
    console.log(document.cookie);
  }
}

function getCookie(cname, cdefvalue) {
  let name = cname + '=';
  let ca = document.cookie.split(';');
  let cvalue=cdefvalue;
  for(const c of ca) {
    var cookie = c.trim();
    if (cookie.indexOf(name) == 0) {
      let value = cookie.substring(name.length, cookie.length);
      if (value) {
        cvalue = JSON.parse(value);
      }
    }
  }
  return cvalue;
}

var fullscreen=false;
var appsStatus;

$(function() {
  gtag('config', 'GA_MEASUREMENT_ID', { 'transport_type': 'beacon'});

  const mode = queryparam('mode');
  if (mode == 'fullscreen') {
    fullscreen=true;
    $('#fullscreen').addClass('hidden');
  }

  loadSites(sites => buildPage(sites));

  if (!fullscreen) {
    $('#fullscreen').on('click', openFullScreen);
  }
});

function openFullScreen() {
  gtag('event', 'open-fullscreen', {
    siteId: 'TeslaTheater',
    siteUrl: window.location.href,
    mode: "fullscreen"
  });
  window.location.href = 'https://www.youtube.com/redirect?q='+window.location.href+'?mode=fullscreen';
}
