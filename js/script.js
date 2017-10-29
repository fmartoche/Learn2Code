const WAIT_PER_LINE = 1500;
const FAST_WAIT_PER_LINE = 200;


var got = [];
var error = false;
var buffer=[];

var section_number = 0;
var sections = [
  {
    "synopsis": [
      "Les premiers rayons du soleil percent à travers mes paupières fermées.",
      "J'entrouvre mes yeux.",
      "Ebloui, j'aperçois comme des colonnes en face de moi.",
      "Non, ce ne sont pas des colonnes, ce sont des barreaux !",
      "Je retrouve vite mes esprits, je suis emprisonné.",
      "Je me souviens maintenant..."
    ],
    "initial_code": "for i in range(0, 5):\n  print 'Hey!'",
    "generate_test_set_fn": function() {
      return [{"name": "'Woz'"}, {"name": "'Foo'"}, {"name": "'Bar'"}, {"name": "'Baz'"}];
    },
    "test_fn": function(params) {
      return "Hey, " + params["name"].slice(1, -1) + " !";
    },
    "successful_test_txt": [
      "Well done !",
      "Foo bar"
    ]
  }
];

var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "the-matrix"
  });

editor.setValue(sections[section_number]["initial_code"]);

setTimeout(function(){
  $('#code-area').css({"height":"400px"});
}, WAIT_PER_LINE*sections[section_number]["synopsis"].length);

setTimeout(function(){
  $('#code-area').css({"opacity":"1"});
}, WAIT_PER_LINE*(sections[section_number]["synopsis"].length+1));


function print(arr, t=WAIT_PER_LINE) {
  $.each(arr, function(i, el){
    setTimeout(function(){
      $("<li>" + el + "</li>").appendTo('#generated').show().typewriter();
    }, t*i);
  });
}

print(sections[section_number]["synopsis"]);

function outf(text) { 
  if ( $.inArray(text, ['\r\n', '\n', '\r']) == -1 ) 
    buffer.push(text);
} 
  
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function testit() {
  var test_set = sections[section_number]["generate_test_set_fn"]();

  for(i=0; i<test_set.length; i++){
    console.log("Loop " + i);
    var expected = sections[section_number]["test_fn"](test_set[i]);

    var prog = editor.getValue(); 
    for(var key in test_set[i]){
      prog = key + " = " + test_set[i][key] + '\n' + prog;
    }


    got = [];
    var error_txt = '';
    error = false;
    function got_fn(txt){
      if ( $.inArray(txt, ['\r\n', '\n', '\r']) == -1 ) 
        got.push(txt);
    }
    Sk.configure({output:got_fn, read:builtinRead}); 
    try {
      Sk.misceval.call(function() {
          return Sk.importMainWithBody("<stdin>", false, prog, true);
      });
    } catch(err) {
      error_txt = err["__proto__"]["tp$name"] + " : " + err["args"]["v"][0]["v"] + " on line " + err["traceback"][0]["lineno"];
      error = true;
    }

    if(error || expected != got){
      var to_print = [];
      to_print.push("###########  START TEST ###########");
      to_print.push("Test failed with inputs: ");
      for(var key in test_set[i]){
        to_print.push(key + " : " + test_set[i][key]);
      }
      to_print.push("-------------------------------------------------");
      if(error){
        to_print.push("Got an error:");
        to_print.push(error_txt);
      }else{
        to_print.push("Expected : " + expected);
        to_print.push("Got : " + got);
      }
      to_print.push("###########   END  TEST ###########");
      print(to_print, FAST_WAIT_PER_LINE);
      error = true;
      break;
    }
  }

  if(!error)
    print(sections[section_number]["successful_test_txt"]);
}

function runit() { 
  buffer=[];
  var prog = editor.getValue(); 
  var mypre = document.getElementById("output"); 
  Sk.pre = "output";
  Sk.configure({output:outf, read:builtinRead}); 
  try {
    Sk.misceval.call(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
  } catch(err) {
    buffer.push(err["__proto__"]["tp$name"] + " : " + err["args"]["v"][0]["v"] + " on line " + err["traceback"][0]["lineno"]);
  }
  print(buffer, FAST_WAIT_PER_LINE);
} 