$('#helpButton').on('click', function() {
  $('#helpPopup').removeClass('d-none').slideUp('slow', function(){
    $(this).addClass('help-active');
  });
});
