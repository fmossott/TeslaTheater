function loadSites(callback) {
  $.getJSON('sites.json', sites => {
    console.log(sites);
    callback(sites);
  });
}


function open() {
  window.location.href = "https://www.youtube.com/redirect?q="+$(this).attr("link");
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

$(document).ready(function() {
  loadSites(sites => buildPage(sites));

  $("#info").text(`${$(window).width()} x ${$(window).height()} - ${$(document).width()} x ${$(document).height()}`);

  $("#fullscreen").on('click', () => window.location.href = "https://www.youtube.com/redirect?q="+window.location.href);
});