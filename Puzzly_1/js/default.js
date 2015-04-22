// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=329104
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
        
        //stop timer if it is running
        timerOn = false;
        $('#startStopTimer').removeClass('stopTimer').addClass('startTimer').val('Timer On');
    };

    app.addEventListener("activated", activated, false);
    app.start();
})();

// ******************************* Some custom functions ***************************************** //

function activated(eventObject) {
    var activationKind = eventObject.detail.kind;
    var activatedEventArgs = eventObject.detail.detail;
    //if (activationKind == 1002) 
    if(activationKind == Windows.ApplicationModel.Activation.ActivationKind.pickFileContinuation){
        continueFileOpenPicker(activatedEventArgs);
    }
}

// Called when app is activated from file open picker
// eventObject contains the returned files picked by user
function continueFileOpenPicker(eventObject) {
    var files = eventObject[0].files;
    var filePicked = files.size > 0 ? files[0] : null;
    if (filePicked !== null) {
        // Application now has read/write access to the picked file
        WinJS.log && WinJS.log("Picked photo: " + filePicked.name, "sample", "status");
        //console.log("Picked photo: " + filePicked.name, "sample", "status");
        //console.log(filePicked.path);
        var file = MSApp.createFileFromStorageFile(filePicked);
        // than use the file variable in the createObjectURL function
        var url = URL.createObjectURL(file, { oneTimeOnly: true });
        cropImage(url, 240);
        //$('#myImg').attr('src', url);
    } else {
        // The picker was dismissed with no selected file
        WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
        //console.log("Operation cancelled.", "sample", "status");
    }
}

//this function takes the SRC IMAGE URL and DESIRED SIZE
//and then crops it into desired size (height=width), square
//and returns the result image url
function cropImage(imgSrc, size) {
    //console.log("2. imgSrc" + imgSrc);
    $('#canvas')[0].height = size;
    $('#canvas')[0].width = size;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var img = new Image();

    img.onload = function () {
        crop();
    }
    img.src = imgSrc;

    function crop() {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);
        var newURL = canvas.toDataURL();
        populateImgSlot(newURL);
        hideMask();
    }
}

//this will check if there is any image slot empty
//and if empty, assign the received image to that image slot
function populateImgSlot(imgURL) {
    //check if any image slot is empty
    var emptyImgList = $('li.noDisplay');
    if (emptyImgList.size() > 0) {
        emptyImgList.first().removeClass('noDisplay').children('img').attr('src', imgURL).trigger('click');
    }

    //now disable the UPLOAD button if there is no more empty slot left
    if ($('li.noDisplay').size() == 0) {
        //$("#uploadImgButton").attr('disabled', 'disabled');
        $("#uploadImgButton").hide();
    }
}
