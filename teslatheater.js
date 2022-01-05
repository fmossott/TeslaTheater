function loadSites(callback) {
  $.getJSON('sites.json', sites => {
    console.log(sites);
    callback(sites);
  });
}


function open() {
  var link = $(this).attr("link");
  if (fullscreen) {
    window.location.href = link;
  } else {
    window.location.href = "https://www.youtube.com/redirect?q="+link;
  }
}

function buildPage(sites) {
  const $apps = $('#apps');

  $apps.children(".button").remove();

  const $template = $($('#site-template').html());

  sites.forEach(site => {
    const $app = $template.clone();
    $app.attr('id', site.id);
    $app.attr('link', site.url);
    $app.find('img').attr('src', `images/${site.img}`).attr('alt', site.name);
    $app.on("click", open);
    $app.appendTo($apps);
  });

}

function queryparam(key) {
  var match = window.location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

var fullscreen=false;

$(document).ready(function() {
  const mode = queryparam("mode");
  if (mode == "fullscreen") {
    fullscreen=true;
    $("#fullscreen").addClass("hidden");
  }

  loadSites(sites => buildPage(sites));

  if (!fullscreen) {
    $("#fullscreen").on('click', () => window.location.href = "https://www.youtube.com/redirect?q="+window.location.href+"?mode=fullscreen");
  }
});