// check for csv files
function checkfile(sender) {
    // accept only csv files
    var validExts = new Array(".csv");
    var fileExt = sender.value;
    fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {
      alert("Invalid file selected, valid files are of " +
               validExts.toString() + " types.");
      return false;
    }

    const file = document.getElementById('inputFile').files[0];

    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            var bufferString = evt.target.result;
            // split headers and rows
            var arr = bufferString.split('\n');     
            var jsonObj = [];
            var headers = escapedString(arr[0]);

            for(var i = 1; i < (arr.length-1); i++) {
                var data = escapedString(arr[i]);
                // add each row as a new array
                var obj = [];
                obj.push(i);
                for(var j = 0; j < data.length; j++) {
                   obj.push(data[j]);
                }
                jsonObj.push(obj);
            }

            var columns = headers.map(function(key,val){ return {"title":key} });
            columns.unshift({"title":"Row Number"});

            // initialize data tables
            $('#example').DataTable( {
                data: jsonObj,
                columns: columns,
                responsive: true,
                colReorder: true,
                footerCallback: function ( tfoot, data, start, end, display ) {
                    var api = this.api(), data;

                    // Remove the formatting to get integer data for summation
                    var intVal = function ( i ) {
                        return typeof i === 'string' ?
                            i.replace(/[\$,]/g, '')*1 :
                            typeof i === 'number' ?
                                i : 0;
                    };

                    $(tfoot).empty();

                    // if type of data is nuber sum it and show in the footer
                    for (var i=0; i < api.columns()[0].length; i++) {

                        var pageTotal = "";
                        var columnData = api.column(i).data();

                        var pageTotal = columnData.reduce(function(sum,current){ 
                            if(/^\d+$/.test(current)){
                                return parseFloat(sum) + parseFloat(current);
                            }else{
                                return "";
                            }
                        });

                        if(i==0){
                            pageTotal = "";
                        }

                        $(tfoot).append('<th>'+pageTotal+'</th>');

                    }
                },

            } );
        }
        reader.onerror = function (evt) {
            $("#fileContents").text("error reading file");
        }
    }

}

// Escape ',' within quptes
function escapedString(string){

    var str = string;
    var arr = str.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    /* will match:

        (
            ".*?"       double quotes + anything but double quotes + double quotes
            |           OR
            [^",\s]+    1 or more characters excl. double quotes, comma or spaces of any kind
        )
        (?=             FOLLOWED BY
            \s*,        0 or more empty spaces and a comma
            |           OR
            \s*$        0 or more empty spaces and nothing else (end of string)
        )

    */
    // remove all quotes
    // this will prevent JS from throwing an error in
    arr = arr.map(function(val){return val.replace(/['"]+/g, '')}) || [];

    return arr;

}

// on hover show row index
$(document).on('mouseover','#example tbody tr',function(){
    $(this).popover({
        trigger: 'hover',
        title: 'Index',
        content: $(this).index()+1,
        placement: 'bottom'
    }).popover('show');

})
