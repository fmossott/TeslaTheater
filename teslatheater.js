function loadSites(callback) {
  $.getJSON('sites.json', sites => {
    console.log(sites);
    callback(sites);
  });
}


function open() {
  if (onEdit) {
    return;
  }

  var link = $(this).attr('link');
  let siteId = $(this).attr('id');
  gtag('event', `open-${siteId}`, {
    siteId: siteId,
    siteUrl: link,
    mode: fullscreen ? "same-window" : "fullscreen"
  });

  if (fullscreen) {
    window.location.href = link;
  } else {
    window.location.href = 'https://www.youtube.com/redirect?q='+link;
  }
}

function openFullScreen() {
  if (onEdit) {
    return;
  }
  
  gtag('event', 'open-fullscreen', {
    siteId: 'TeslaTheater',
    siteUrl: window.location.href,
    mode: "fullscreen"
  });
  window.location.href = 'https://www.youtube.com/redirect?q='+window.location.href+'?mode=fullscreen';
}

function buildPage(sites) {
  const $apps = $('#apps');

  appsStatus = getCookie('TeslaTheaterStatus',{});
  setCookie('TeslaTheaterStatus', appsStatus); // update cookie expiration every time

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

  $('.button').on('click', open);
  $('.hiddenswitch').on('click', hideButton);

  setTimeout(() => storeOrder($apps), 1000);

  $apps.sortable({
    placeholder: 'button highlight',
    update: function(event, ui) {
      storeOrder($(this));
    }});

  editMode(false);
}

function hideButton() {
  if (!onEdit) {
    return;
  }

  let appId = $(this).attr('for');
  let $app = $('#'+appId);
  if (!appsStatus['hidden']) {
    appsStatus['hidden'] = [];
  }
  let oldStatus = appsStatus['hidden'].includes(appId);
  let newStatus = !oldStatus;

  if (newStatus) {
    appsStatus['hidden'].push(appId);
  } else {
    appsStatus['hidden'].splice(appsStatus['hidden'].indexOf(appId), 1);
  }
    
  $app.toggleClass('disabled', newStatus);
  $(this).children('em').toggleClass('fa-eye-slash', newStatus);
  $(this).children('em').toggleClass('fa-eye', !newStatus);

  storeOrder($('#apps'));
}

function storeOrder($apps) {
  appsStatus['order'] = $apps.sortable('toArray');
  setCookie('TeslaTheaterStatus', appsStatus);
}

function addSiteButton($template, siteId, site, $apps) {
  const $app = $template.clone();
  $app.attr('id', siteId);
  $app.attr('link', site.url);
  $app.find('img').attr('src', `images/${site.img}`).attr('alt', site.name);
  $app.find('.hiddenswitch').attr('for', siteId);
  if (appsStatus['hidden'] && appsStatus['hidden'].includes(siteId)) {
    $app.addClass('disabled');
    $app.find('.hiddenswitch').children('em').addClass('fa-eye-slash');
    $app.find('.hiddenswitch').children('em').removeClass('fa-eye');
  }
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
var onEdit = false;

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
  
  $('#editmode input').prop('checked', false);
  $('#editmode input').change(function() {
    editMode($(this).is(':checked'));
  });
});

function editMode(edit) {
  onEdit = edit;
  $('.hiddenswitch').toggleClass('hidden', !edit);
  $('.button.disabled').toggleClass('hidden', !edit);
  if (edit) {
    $('.button.active').removeClass('active');
  } else {
    $('.button:not(.disabled)').addClass('active');
  } 
}
