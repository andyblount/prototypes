$(document).ready(function() {
  $('.modal').on('show.bs.modal', function (e) {
    $('#osa-iframe').animate({
        scrollTop: 0
    }, 200);
})
});
