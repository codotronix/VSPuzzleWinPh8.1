$(function(){
	
    initGame();   

});

function initGame() {
    // NOTE: I have started the Cell Array from 1... Hence the 0th location is blank

    var imageWidth = 480	            //	$('#puzzleImg').height(); //Since I have decided to take only 240x240 size image, So can be hard coded
    if ($('body').hasClass('phone')) {
        imageWidth = 240;
    }

    var cells = [];			            //an array of cell bojects to hold information about all the cells
    var m = 3; 				            // say it is a m x m square puzzle
    var diffFactor = imageWidth / m; 	//total width of teh borad divided by number of cell in each line i.e 231/3 = 77
    var blankCellId;
    var totalMove = 0;
    var totalTime = 0;
    var timerOn = false;
    var imageUrl = 'images/1.jpg';

    var player = {};
    player.isPlaying = false;
    player.startTime = new Date().getTime();        //this will hold last shuffling time
    player.imageSeen = 0;

    


    //set height and width of all necessary components
    $('#imageHolder, #board1, #boardContainer').css({
        height: imageWidth + 'px',
        width: imageWidth + 'px',
        /*'min-height': imageWidth + 'px'*/
    });
    
    //console.log(diffFactor);
    $('.cell').css({
        height: diffFactor + 'px',
        width: diffFactor + 'px'
    });

    function initBoard() {
        var cellNo = 0;
        cells = [];			//new cells array
        top = 0, 				//top and left will temporarily hold the css top and left of a cell
		left = 0;

        //add cells to the blank board
        for (var i = 0; i < m; i++) {
            for (var j = 0; j < m; j++) {
                cellNo++;
                cells[cellNo] = {};
                cells[cellNo].id = 'cell_' + cellNo;
                cells[cellNo].top = (i * diffFactor) + 'px';
                cells[cellNo].left = (j * diffFactor) + 'px';
                //cells[cellNo].correctTop = cells[cellNo].top;
                //cells[cellNo].correctLeft = cells[cellNo].left;

                $('<div class="cell" id="' + cells[cellNo].id + '"></div>').appendTo('#board1');
                $('#' + cells[cellNo].id).css({
                    top: cells[cellNo].top,
                    left: cells[cellNo].left,
                    'background-position': "-" + cells[cellNo].left + " -" + cells[cellNo].top
                });
            }
        }

        //Now that we have Cells, we set their height and width
        $('.cell').css({
            height: diffFactor + 'px',
            width: diffFactor + 'px',
            'background-image': "url(" + imageUrl + ")",
            'background-repeat': 'no-repeat'
        });

        //now clear the background image of the last cell, so that i shows a blank space
        blankCellId = cells[cellNo].id;
        $('#' + blankCellId).css('background-image', 'none');

        //hide the mask if visible
        hideMask();
    }

    //Check if player has won
    function isWinner() {

        //console.log(cells);
        for (var i = 1; i < cells.length; i++) {
            //console.log(i);
            if (cells[i].left != $('#cell_' + i).css('left') || cells[i].top != $('#cell_' + i).css('top')) {
                //console.log('Not Winner');
                return (false);
            }
            
            if (i == (cells.length-1)) {
                //console.log('Winner');
                return (true);
            }
        }
    }

    function init() {
        totalMove = 0;
        $('#totalMove').html(totalMove);
        timerOn = false;
        totalTime = 0;
        $('#totalTime').html(totalTime);
        initBoard();
    }

    //Swap the cell with the blank cell, if it is allowable
    function swapIfSwappable(cellID) {
        var swapSuccessful = false;
        var thisLeft = parseInt($('#' + cellID).css('left'));
        var thisTop = parseInt($('#' + cellID).css('top'));
        var blankLeft = parseInt($('#' + blankCellId).css('left'));
        var blankTop = parseInt($('#' + blankCellId).css('top'));
        
        if ((thisLeft === blankLeft && Math.abs(thisTop - blankTop) === diffFactor) || (thisTop === blankTop && Math.abs(thisLeft - blankLeft) === diffFactor)) {
            
            $('#' + cellID).css('left', $('#' + blankCellId).css('left'));
            $('#' + cellID).css('top', $('#' + blankCellId).css('top'));
            $('#' + blankCellId).css('left', thisLeft);
            $('#' + blankCellId).css('top', thisTop);
            swapSuccessful = true;
            totalMove++;
        }
        else {
            //console.log('this is a non swappable block...');
        }

        return (swapSuccessful);
    }

    //this function will shuffle the puzzle for playing again
    function shuffleUp() {
        console.log('inside shuffle up');
        //totalMove = 0;
        var maxCellIndex = cells.length - 1;
        var swapCount = 0;
        while (swapCount < 300) {
            var randomCellIndex = Math.floor(Math.random() * maxCellIndex) + 1;
            if (swapIfSwappable('cell_' + randomCellIndex)) {
                swapCount++;
            }
        }
        hideMask();
        resetPlayerStats();
    }

    function increaseTime() {
        totalTime = $('#totalTime').html();
        if (timerOn) {
            totalTime++;
            $('#totalTime').html(totalTime);
            setTimeout(increaseTime, 1000);
        }
    }

    //This function reads the uploaded image URL and 
    //returns the src URL of the image
    //function readURL(input) {
    //    if (input.files && input.files[0]) {
    //        var reader = new FileReader();

    //        reader.onload = function (e) {
    //            //doCrop(e.target.result)
    //            //console.log("1. e.target.result = " + e.target.result);
    //            //return (e.target.result);
    //            cropImage(e.target.result, 480);
    //        }
    //        reader.readAsDataURL(input.files[0]);
    //    }
    //}

    //this function takes the SRC IMAGE URL and DESIRED SIZE
    //and then crops it into desired size (height=width), square
    //and returns the result image url
    //function cropImage(imgSrc, size) {
    //    //console.log("2. imgSrc" + imgSrc);
    //    $('#canvas')[0].height = size;
    //    $('#canvas')[0].width = size;
    //    var canvas=document.getElementById("canvas");
    //    var ctx=canvas.getContext("2d");
    //    var img=new Image();

    //    img.onload=function(){
    //        crop();
    //    }
    //    img.src=imgSrc;

    //    function crop(){            
    //        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);          
    //        populateImgSlot(canvas.toDataURL());

    //        hideMask();
    //    }
    //}    

    //open the image file explorer for user
    function pickSinglePhoto() {
        // Clean scenario output
        WinJS.log && WinJS.log("", "sample", "status");
        //console.log("", "sample", "status");

        // Create the picker object and set options
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        // Users expect to have a filtered view of their folders depending on the scenario.
        // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);

        // Open the picker for the user to pick a file
        openPicker.pickSingleFileAndContinue();
    }   
     
    //whenever a winner happens, this function will preparepopulate the statsBoard board with real data
    function populateCongratsBoard() {
        var startBonus = 100000;
        var timeTaken = Math.round(((new Date().getTime()) - player.startTime)/1000);
        //console.log(player.startTime)
        //totalMove
        var levelValue = parseInt($('#selectLevel input[type=radio]:checked').val())
        var negativeFactor = (9 - levelValue) * 5; // the more difficult the level, the less will be the negativeFactor
        var timePenalty = timeTaken * negativeFactor;
        var movePenalty = totalMove * negativeFactor * 2;
        var imageSeenPenalty = player.imageSeen * negativeFactor * 3;
        var totalScore = startBonus - (timePenalty + movePenalty + imageSeenPenalty);
        console.log(player.imageSeen);

        //populate mid Column
        $('#statsBoard .startBonus').text(startBonus);
        $('#statsBoard .midCol .timeTaken').text(timeTaken + 's [ x (-' + negativeFactor + ') Pts ]');
        $('#statsBoard .midCol .moveTaken').text(totalMove + ' [ x (-' + (negativeFactor * 2) + ') Pts ]');
        $('#statsBoard .midCol .imageSeen').text(player.imageSeen + ' [ x (-' + (negativeFactor * 3) + ') Pts ]');

        //populate right column
        $('#statsBoard .rightCol .timePenalty').text('- ' + timePenalty);
        $('#statsBoard .rightCol .movePenalty').text('- ' + movePenalty);
        $('#statsBoard .rightCol .imageSeenPenalty').text('- ' + imageSeenPenalty);
        $('#statsBoard .rightCol .totalScore').text(totalScore);
    }

    function resetPlayerStats() {
        //assume that player is about to start play
        player.isPlaying = true;
        player.imageSeen = 0;
        player.startTime = new Date().getTime();
        totalMove = 0;
        $('#totalMove').html(totalMove);
    }

    //Initiate the puzzle board
    init();

    /*********************** ALL THE CLICK EVENTS ******************************/

    //Solve button is clicked
    $('#Solve').click(function () {
        showMask()
        $('#board1').html('');
        initBoard();
        player.isPlaying = false;
    });

    //Shuffle button is clicked
    $('#Shuffle').click(function () {
        console.log('shuffle clicked');
        showMask();
        //shuffleUp();
        //call the shuffle function with a delay, so that the screen doesnot get freezed immediately        
        //the shuffleup should be called only after mask is displayed to prevent screen freezing
        function callShuffleUpOnMask() {
            if ($('.mask').css('display') == 'table') {
                //if mask is shown then only shuffle
                setTimeout(shuffleUp, 50);
            } else {
                //wait and check again
                setTimeout(callShuffleUpOnMask, 50);
            }
        }
        callShuffleUpOnMask();

        $('#resetCounter').trigger('click');
    });

    //Reset Counter button is pressed
    $('#resetCounter').click(function () {
        totalMove = 0;
        timerOn = false;
        $('#startStopTimer').removeClass('stopTimer').addClass('startTimer').val('Timer On');
        totalTime = 0;
        $('#totalMove').html(totalMove);
        $('#totalTime').html(totalTime);
    });

    //Clicking on Start/Stop Timer
    $('#startStopTimer').on('click', function () {
        if($(this).hasClass('startTimer')) {
            if (!timerOn) {
                timerOn = true;
                $(this).removeClass('startTimer').addClass('stopTimer').val('Timer Off');
                setTimeout(increaseTime, 1000);
            }
        } else if ($(this).hasClass('stopTimer')) {
            timerOn = false; 
            $(this).removeClass('stopTimer').addClass('startTimer').val('Timer On');
        }
        
    });   

    //CLICKING ON A CELL
    $('#board1').on('click', '.cell', function () {
        //if ($('.mask').css('display') != 'none') { console.log('cell click not taken'); return; } else { console.log('cell clicked');}
        //Swap this cell with blank cell if this cell is swappable...		
        swapIfSwappable($(this).attr('id'));
        $('#totalMove').html(totalMove);
        if (player.isPlaying) {
            if (isWinner()) {
                populateCongratsBoard();
                $('#statsBoard').css('display', 'table');
                player.isPlaying = false;
            }
        }
    });

    //doneOptions button is clicked
    $('#selectLevel input[type=radio]').on('change', function () {
        showMask();
        m = parseInt($('#selectLevel input[type=radio]:checked').val());
        $('#levelDesc').html("( LEVEL " + (m - 2) + " )");
        diffFactor = imageWidth / m;
        $('#board1').html('');
        //init();
        //wait for the mask to show itself
        window.setTimeout(init, 100);
    })

    //Player wants to change the image with which ot play
    $('#selectImage li img').on('click', function () {
        showMask();
        imageUrl = $(this).attr('src');
        $('#imageHolder img').attr('src', imageUrl);
        $('#board1').html('');
        //init();
        //wait for the mask to show itself
        window.setTimeout(init, 100);
    });

    //Player wants t change the theme
    $('#selectTheme input[type=radio]').on('change', function () {
        var themeClass = $(this).val();
        $('body').removeClass().addClass(themeClass);
    });

    //#optionsPanel is clicked
    $('#showOptionBtn').click(function (e) {
        e.stopPropagation();
        $('#optionsPanel').toggle();
        //if ($('#AllOptions').css('display') == 'none') {
        //    $(this).removeClass('up').addClass('down');
        //} else {
        //    $(this).removeClass('down').addClass('up');
        //}
    });

    $('html').click(function () {
        //console.log('body clicked');
        $('#optionsPanel').hide();
        //$('#optionsPanel').removeClass('up').addClass('down');

        if ($(window).innerWidth() >= 1200) {
            $('#imageHolder').css('display','table');
            $('#imageHolder img').hide();
            $('#imageHolder span').show();
        } else {
            $('#imageHolder').hide();
        }

    });

    //imageHolder is clicked
    $('#imageHolder').click(function (e) {     
        e.stopPropagation();
        if ($(window).innerWidth() > 1200) {
            if ($('#imageHolder img').css('display') == 'none') {
                player.imageSeen++;
            }                
            $('#imageHolder img').toggle();
            $('#imageHolder span').toggle();
        } else {
            $(this).hide();
        }        
    });

    //upload image button is clicked
    $('#uploadImgButton').on('click', function () {        
        pickSinglePhoto();
    });

    //when window is resized
    $(window).resize(function () {
        if ($(window).innerWidth() < 1200) {
            $('#imageHolder').hide();
        }
        //console.log("Width=" + $(this).innerWidth() + " Height=" + $(this).innerHeight());
    });

    $('#showImgBtn').on('click', function (e) {
        e.stopPropagation();
        if ($('#imageHolder').css('display') == 'none') {
            player.imageSeen++;
        }
        $('#imageHolder').toggle();
    });

    $('#closeStatBoard').click(function () {
        $('#statsBoard').hide();
    });

}

//this function will show the mask for some time taking operation
function showMask() {
    console.log('showmask called');
   
    $('.mask').css('display', 'table');
    //$('.mask').show();
}

//this function will hide the mask
function hideMask() {
    console.log('hidemask called');
    
    window.setTimeout(function () {
        $('.mask').hide(500);
    }, 5);
}



