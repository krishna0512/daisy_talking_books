var editor = ace.edit("editor");
document.getElementById('editor').style.fontSize = '14px';
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/xml");
editor.getSession().setUseWrapMode(true);
var data = "the new text here. "; // This should be fetched from db and copied
editor.setValue(data);

function clicked(btnName, elem) {
        var selection;
        var selection_text;

        selection = editor.getSelectedText();
        selection_text = selection.toString();
        if ($(elem).hasClass("ul_tags")) {
                selection_text = "<" + btnName + ">" + "\n" + "\t" + selection + "\n" + "</" + btnName + ">";
        }
        if ($(elem).hasClass("ul_attribs")) {
                selection_text = " " + btnName + "=" + "\"\"";
        }
        editor.$blockScrolling = Infinity
        range = editor.selection.getRange();
        editor.session.replace(range, selection_text);
}

function upload_file(e) {
        var file = e.target.files[0];
        if (!file) {
                return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
                var data = e.target.result;
                display_contents(data);
        };
        reader.readAsText(file);
}

function display_contents(data) {
        var editor = ace.edit("editor");
        document.getElementById('editor').style.fontSize = '14px';
        editor.setValue(data);
}

function load_data_to_editor(){
    // get the id of the book here
    var book_name = document.getElementById("hiddenBookName").value
    var book_id = document.getElementById("hiddenBookId").value

    // do a get call and get the latest page from db
    // store image and text and load them on the editor
    url = "/api/load_image_and_text/?data=" + book_id
    $.ajax({
        type:"GET",
        url: url,
        async: false,
        cache: false,
        timeout: 30000,
        success: function (response){
          var image_url = response.img
          var media_url = response.media_url
          var text = response.text
          final_url = media_url + image_url

          $('#image_drom_db').attr('src', final_url);
          var editor = ace.edit("editor");
          editor.setValue(text);

          // FUNKY pop up that post was successful
          if(response.status == 200){
            swal("All set!", "You can now start editing the OCR text.", "success");
          }
        },
        error: function(errorThrown){
          swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
        }
      });
}

$(window).load(function() {
   document.getElementById("loader").style.display = "none";
   document.getElementById("main-div").style.display = "block";
   load_data_to_editor();
});

function get_latest_page(bookname) {
  url = "/api/get_page/?data=" + bookname
  $.ajax({
      type:"GET",
      url: url,
      success: function (response){
        // response should have the image and text of the latest page
        if(response.status == 200){
          swal("Done!", "Book is loaded, you can now edit. ", "success");
        }
      }
    });
}

function get_bookname(){
  var bookname = document.getElementById("hiddenBookName").value
  return bookname
}

function get_bookid(){
  var bookid = document.getElementById("hiddenBookId").value
  return bookid
}

function get_data(){
  var xml_file_editor = ace.edit('editor');
  xml_data = xml_file_editor.getSession().getValue();
  return xml_data
}

function run_pipeline(bookname, xmldata) {
  url = "http://10.2.16.111:5000/run_daisy_pipeline/";
  // url = "http://127.0.0.1:5000/run_daisy_pipeline/";
  data = {'bookname': bookname, 'xmldata': xmldata};
  $.ajax({
      type:"POST",
      url: url,
      data: data,
      success: function (response){
        response = JSON.parse(response);
      },
      error: function(errorThrown){
        swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
      },
      dataType: "text"
    });
}

function save_audio_to_db() {
  book_id = get_bookid()
  console.log("I got you book id: " + book_id);
  url = "/api/save_audio_to_db/?data=" + book_id
  $.ajax({
      type:"GET",
      url: url,
      async: false,
      timeout: 30000,
      success: function (response){
        console.log("The audiobook has been successfully saved to db. Sit back and relax. ");
        // window.location = "/view_library/"
      },
      error: function(errorThrown){
        swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
      }
    });
}

$("#convert").click(function() {
  // get the book name
  swal("Your request is getting processed, you will be redirected to your library!");

  var bookname = get_bookname()
  var data = get_data()

  console.log("Running the pipeline.");
  run_pipeline(bookname, data);
  save_audio_to_db();
});

$('li').click(function () {
        clicked($(this).text().trim(), $(this));
});

$('#uploadFile').change(function () {
        upload_file(event)
});

$("input[name=upload_image]").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = $('<img>').attr('src', e.target.result);
            $('#imageUpload').html(img);
        };
        reader.readAsDataURL(this.files[0]);
    }
});
