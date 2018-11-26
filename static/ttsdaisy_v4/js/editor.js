var editor = ace.edit("editor");
document.getElementById('editor').style.fontSize = '14px';
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/xml");
editor.getSession().setUseWrapMode(true);
var data = "the new text here. "; // This should be fetched from db and copied
editor.setValue(data);

function get_bookname(){
  var bookname = document.getElementById("hiddenBookName").value
  return bookname
}

function get_bookid(){
  var bookid = document.getElementById("hiddenBookId").value
  return bookid
}

function get_pagenumber(){
  var pageNumber = document.getElementById("hiddenPageNumber").value
  return pageNumber
}

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

function load_data_to_editor(saveOption){
    // get the id of the book here
    var book_name = document.getElementById("hiddenBookName").value
    var book_id = document.getElementById("hiddenBookId").value
    var page_number = document.getElementById("hiddenPageNumber").value
    var is_final_page = document.getElementById("isFinalPage").value
    // var language = $('#id_language').find(":selected")[0].innerText

    if (is_final_page){
      console.log("This is the final page. No api call. ");
      load_full_xml_to_editor("save");
      return true;
    }

    // do a get call and get the latest page from db
    // store image and text and load them on the editor
    // url = "/api/load_image_and_text/?bookid=" + book_id + '&page_number=' + page_number + '&saveOption=' + saveOption
    // console.log("URL is: " + url);
    jummper(page_number);
    // $.ajax({
    //     type:"GET",
    //     url: url,
    //     async: false,
    //     cache: false,
    //     timeout: 30000,
    //     success: function (response){
    //       var image_url = response.img
    //       var media_url = response.media_url
    //       var text = response.text
    //       var page_position = response.page_position
    //       // final_url = media_url + image_url
    //       final_url = image_url
    //       console.log("The URL required is: " + final_url);
    //       console.log("The page position is: " + page_position);

    //       $('#image_drom_db').attr('src', final_url);
    //       var editor = ace.edit("editor");
    //       editor.setValue(text);

    //       if(response.page_position != 'last'){
    //         // swal("All set!", "You can now start editing the OCR text.", "success");
    //         console.log("This is not the last page. ");
    //       }
    //       else{
    //         console.log("This was the last page, send it to the final editor. ")
    //       }
    //     },
    //     error: function(errorThrown){
    //       swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
    //     }
    //   });
}

/////////////////////////////////////vandna's edit

function jummper(page_number){
     // get the id of the book here
    var book_id = document.getElementById("hiddenBookId").value
    //var clicked_value = document.getElementById("hiddenPageNumber").value
    

    // do a get call and get the latest page from db
    // store image and text and load them on the editor
    url = "/get_page_ocr/?bookid=" + book_id + '&page_number=' + page_number 
    console.log("URL is: " + url);
    $.ajax({
        type:"GET",
        url: url,
        async: false,
        cache: false,
        timeout: 30000,
        success: function (response){
          var text = response.text
          var image = response.image
          // final_url = media_url + image_url
          $('#image_drom_db').attr('src', image);
          var editor = ace.edit("editor");
          editor.setValue(text);
        },
        error: function(errorThrown){
          swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
        }
      });
}

function jump_editor_back(page_number){
  var book_id = document.getElementById("hiddenBookId").value
  url = "/get_page_ocr/?bookid=" + book_id + '&page_number=' + page_number 
  url = edit/

    console.log("URL is: " + url);
    $.ajax({
        type:"GET",
        url: url,
        async: false,
        cache: false,
        timeout: 30000,
        success: function (response){
          var text = response.text
          var image = response.image
          // final_url = media_url + image_url
          $('#image_drom_db').attr('src', image);
          var editor = ace.edit("editor");
          editor.setValue(text);
        },
        error: function(errorThrown){
          swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
        }
      });
}
////////////////////////////////////vandna's edit

function load_full_xml_to_editor(saveOption){
  // get the id of the book here
  var book_name = document.getElementById("hiddenBookName").value
  var book_id = document.getElementById("hiddenBookId").value
  var page_number = document.getElementById("hiddenPageNumber").value

  // do a get call and get the latest page from db
  // store image and text and load them on the editor
  url = "/api/load_full_xml_to_editor/?bookid=" + book_id + "&page_number=" + page_number + "&saveOption=" + saveOption
  $.ajax({
      type:"GET",
      url: url,
      async: false,
      cache: false,
      timeout: 30000,
      success: function (response){
        fullxml = response.daisy_xml;
        var editor = ace.edit("editor");
        editor.setValue(fullxml);
      },
      error: function(errorThrown){
        swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
      }
    });
}

$(window).load(function() {
   document.getElementById("loader").style.display = "none";
   document.getElementById("main-div").style.display = "block";
   // if the page is last, do not run the below function
   load_data_to_editor("load");
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

function get_data(){
  var xml_file_editor = ace.edit('editor');
  xml_data = xml_file_editor.getSession().getValue();
  return xml_data
}

function get_data_through_api(bookid){
  // get the daisy xml data
  url = "/api/get_daisy_xml/?bookid=" + bookid;
  $.ajax({
      type:"GET",
      url: url,
      async: false,
      timeout: 30000,
      success: function (response){
        console.log("The book is getting processed. ");
      },
      error: function(errorThrown){
        swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
      }
    });
}

function run_pipeline(bookname, xmldata, bookid) {
  console.log("running the pipeline now.. hold tight.. ");
  debugger;
  url = "http://localhost:5000/run_daisy_pipeline/";
  data = {'bookname': bookname, 'xmldata': xmldata, 'bookid': bookid};
  $.ajax({
      type:"POST",
      url: url,
      data: data,
      success: function (response){
        response = JSON.parse(response);
        console.log(response);
      },
      error: function(errorThrown){
        swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
      },
      dataType: "text"
    });
}

function run_pipeline2(bookname, xmldata, bookid) {
  console.log("running the pipeline now.. hold tight.. ");
  url = "http://localhost:5000/run_daisy_pipeline2/";
  data = {'bookname': bookname, 'xmldata': xmldata, 'bookid': bookid};
  $.ajax({
      type:"POST",
      url: url,
      data: data,
      success: function (response){
        response = JSON.parse(response);
        console.log(response);
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

function save_current_page(bookid, pagenumber, xmldata) {
  console.log("Marking the page as processed.");
  url = "/api/mark_page_as_processed/";
  data = {'bookid': bookid, 'pagenumber': pagenumber,'xmldata': xmldata};
  $.ajax({
      type:"POST",
      url: url,
      data: data,
      async: true,
      success: function (response){
        response = JSON.parse(response);
        window.location = response.url
      },
      error: function(errorThrown){
        swal("OOPS!","Looks like there was an error: " + errorThrown, "error");
      },
      dataType: "text"
    });
}

$("#savePage").click(function(){
  // api call to save current page
  var bookid = get_bookid();
  var pagenumber = get_pagenumber();
  var xmldata = get_data();

  save_current_page(bookid, pagenumber, xmldata);

  // call load_data_to_editor
  load_data_to_editor("save");
});

$(".dropdown-page-number").click(function(){
  console.log("vandna_pno");
  // api call to save current page
  // var bookid = get_bookid();
  // var pagenumber = get_pagenumber();
  //save_current_page(bookid, pagenumber, xmldata);
  page_number = $(this)[0].innerText
  // call load_data_to_editor
  jummper(page_number);
});

$("#go_to_edit").click(function(){
    jump_editor_back("1")
});

$("#viewFullXml").click(function(){
  // api call to save current page
  console.log("getting the book information. ");
  var bookid = get_bookid();
  var pagenumber = get_pagenumber();
  var xmldata = get_data();

  save_current_page(bookid, pagenumber, xmldata);
  console.log("The page has been processed. ");

  // call load_full_xml_to_edito
  load_full_xml_to_editor("save");
});

$("#convert").click(function() {
  var bookid = get_bookid();
  var bookname = get_bookname();
  var data = get_data();

  console.log("bookid: " + bookid );
  console.log("bookname: " + bookname);

  console.log("Running the pipeline.");
  run_pipeline(bookname, data, bookid);

  console.log("pipeline successfully run, check the audio book back in sometime. ");
  window.location = "/user_home/";
});

