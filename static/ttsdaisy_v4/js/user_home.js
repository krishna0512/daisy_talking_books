$(function() {
  $("#get_book").autocomplete({
    source: "/api/get_books/",
    select: function (event, ui) { // item selected
      AutoCompleteSelectHandler(event, ui)
    },
    minLength: 2,
  });
});

function AutoCompleteSelectHandler(event, ui)
{
  book_name = ui.item.value;
  console.log(book_name);

  // get book id from book name
  var id;
  url = "/api/get_book_id_from_name/"
  data = {'bookname': book_name};
  console.log(url)
  $.ajax({
      type:"POST",
      url: url,
      data: data,
      headers: {"X-CSRFToken": $("#secty").val()},
      success: function (response){
        console.log(response.book_id);
        // redirect to url
        window.location = "/edit/?bookid=" + response.book_id
      }
    });
}
