//localStorage.setItem("toolpaths", JSON.stringify([]));
function gbID(id)
    {
        return document.getElementById(id);
    }

$(document).ready(function() {
    setTimeout(()=>
    {
    openGCodeFromText();
    },2000);
    
	// handle gcode uploads
	if (window.FileReader) {

		var reader = new FileReader ();
		// drag and drop
		function dragEvent (ev) {
            localStorage.setItem("toolpaths", JSON.stringify([]));
            localStorage.setItem("mvm", JSON.stringify([]));
            localStorage.setItem("p_coords", JSON.stringify([]));
			ev.stopPropagation (); 
			ev.preventDefault ();
			if (ev.type == 'drop') {
				reader.onloadend = function (ev) {
					gbID("g-codes").value = this.result;
					openGCodeFromText();
                    localStorage.setItem("g-code", JSON.stringify({code:this.result}));
				};
				reader.readAsText (ev.dataTransfer.files[0]);
			}  
		}

		gbID('g-codes').addEventListener ('dragenter', dragEvent, false);
		gbID('g-codes').addEventListener ('dragover', dragEvent, false);
		gbID('g-codes').addEventListener ('drop', dragEvent, false);


        document.getElementById('g-codes').addEventListener('change',robo_code);
        document.getElementById('p_name').addEventListener('change',robo_code);

       // button
		var fileInput = document.getElementById('fileInput');
		fileInput.addEventListener('change', function(e) {
			reader.onloadend = function (ev) {
				document.getElementById('g-codes').value = this.result;
                localStorage.setItem("g-code", JSON.stringify({code:this.result}));
                localStorage.setItem("mvm", JSON.stringify([]));
			};
			reader.readAsText (fileInput.files[0]);
		});

	} else {
		alert('your browser is too old to upload files, get the latest Chromium or Firefox');
	}

    $('#clearQ').on('click', function() {
		// if paused let user clear the command queue
		$('g-codes').value="";
		// must clear queue first, then unpause (click) because unpause does a sendFirstQ on server
	});

    
    

});

document.getElementById("g-codes").value = JSON.parse(localStorage.getItem("g-code")) == null ? "" : JSON.parse(localStorage.getItem("g-code")).code;
//openGCodeFromText();


document.getElementById('g-codes').addEventListener ('change', ()=>{
    localStorage.setItem("g-code", JSON.stringify({code:document.getElementById("g-codes").value}));
    localStorage.setItem("mvm", JSON.stringify([]));
    openGCodeFromText();
    robo_code();
}, false);

function download_robot_code()
    {   
        if (get_filename().trim(' ').length==0) {
            alert("Nincs neve a filenak");
        }
        else
        saveTextAsFile(document.getElementById('r-code').value,get_filename().replace(' ','_')+'.JBI');
    }
    
function get_filename()
{
    let filename=""+document.getElementById('p_name').value;
        return filename.toUpperCase().replace(' ','-');
}    
    function saveTextAsFile(textToWrite, fileNameToSaveAs) {
        var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        }
         downloadLink.click();
    }
    function add_line(line)
    {
        let _line=""+line;
        gbID("r-code").value += (_line.toUpperCase()+"\r\n");
        console.log(_line);
    }
    function padLeadingZeros(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        return s;
    }

    function robo_code()
    {
        gbID("r-code").value="";
        add_line("/JOB");
        add_line("//NAME "+ get_filename());
        add_line("//POS");
        add_line("///NPOS 7,0,0,0,0,0");
        add_line("///TOOL 0");
        add_line("///POSTYPE BASE");
        add_line("///RECTAN");
        add_line("///RCONF 0,0,0,0,0");
        
        //let toolpaths = JSON.parse(localStorage.getItem("toolpaths"));
        let p_coords = JSON.parse(localStorage.getItem("p_coords"));
        let mvm = JSON.parse(localStorage.getItem("mvm"));
        let zero=0;
        let welding=false;
        
        
        p_coords.forEach((element) => {add_line(element);});

        add_line("//INST");
        add_line("///DATE "+moment().format('YYYY/MM/DD hh:mm:ss'));
        let comment=gbID("p_comment").value.length==0 ? "TEST_COMMENT" : gbID("p_comment").value.toUpperCase().replace(' ','-');
        add_line("///COMM "+ comment);
        add_line("///ATTR SC,RW");
        add_line("///GROUP1 RB1");
        add_line("NOP");
        add_line("'VER 1.0");        
        add_line("'***Start***")
        mvm.forEach((element) => {add_line(element);});            
        add_line("'***Vege***");
        add_line("END\r\n"+String.fromCharCode(parseInt("0x0A")));
        
    }

    /*
/JOB
//NAME 00003-TM
//POS
///NPOS 3,0,0,14,0,0
///TOOL 0
///POSTYPE PULSE
///PULSE
C00000=-760,36915,2411,4524,90335,-1870
C00001=-760,36915,2411,4524,90335,-48092
C00002=13583,64871,32656,3924,7736,-53279
///POSTYPE BASE
///RECTAN
///RCONF 0,0,0,0,0,0,0,0
P0000=0.500,-151.000,-1.000,0.00,0.00,0.00
P0001=1.500,-301.000,-1.000,0.00,0.00,0.00
P0002=2.500,-452.000,-1.500,0.00,0.00,0.00
P0003=2.000,-602.000,-1.000,0.00,0.00,0.00
P0004=3.000,-753.500,-1.500,0.00,0.00,0.00
P0005=4.000,-904.000,-1.500,0.00,0.00,0.00
P0006=-255.500,-904.000,-1.000,0.00,0.00,0.00
P0007=-256.000,-754.000,-1.000,0.00,0.00,0.00
P0008=-256.000,-604.500,-1.000,0.00,0.00,0.00
P0009=-257.000,-451.500,-1.000,0.00,0.00,0.00
P0010=-258.000,-302.000,-1.000,0.00,0.00,0.00
P0011=-258.500,-152.000,-0.500,0.00,0.00,0.00
P0012=-260.000,-1.500,-0.500,0.00,0.00,0.00
P0013=0.000,0.000,-1.000,0.00,0.00,0.00
//INST
///DATE 2020/10/27 08:23
///COMM SHIFT-CSULOK_1
///ATTR SC,RW
///GROUP1 RB1
NOP
'***NAGY ATMERO (VALLAS OLDAL)***
CALL JOB:CUBE_NEW
TIMER T=1.00
MOVJ C00000 VJ=20.00 PL=5
MOVJ C00001 VJ=15.00 PL=5
MOVJ C00002 VJ=15.00 PL=5
'1*******************
SFTON P013
CALL JOB:00001-TM
SFTOF
'2*******************
SFTON P000
CALL JOB:00001-TM
SFTOF
'3*******************
SFTON P001
CALL JOB:00001-TM
SFTOF
'4*******************
SFTON P002
CALL JOB:00001-TM
SFTOF
'5*******************
SFTON P003
CALL JOB:00001-TM
SFTOF
'6*******************
SFTON P004
CALL JOB:00001-TM
SFTOF
'7*******************
SFTON P005
CALL JOB:00001-TM
SFTOF
'8*******************
SFTON P006
CALL JOB:00001-TM
SFTOF
'9*******************
SFTON P007
CALL JOB:00001-TM
SFTOF
'10******************
SFTON P008
CALL JOB:00001-TM
SFTOF
'11******************
SFTON P009
CALL JOB:00001-TM
SFTOF
'12******************
SFTON P010
CALL JOB:00001-TM
SFTOF
'13******************
SFTON P011
CALL JOB:00001-TM
SFTOF
'14******************
SFTON P012
CALL JOB:00001-TM
SFTOF
'********************
CALL JOB:CUBE_NEW
END

    */