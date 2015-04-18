$(function () {

    initGame();

});

function initGame() {
    // NOTE: I have started the Cell Array from 1... Hence the 0th location is blank

    var imageWidth = 240;	            //	$('#puzzleImg').height(); //Since I have decided to take only 240x240 size image, So can be hard coded
   
    //an array of cell bojects to hold information about all the cells
    var cells = [];
    // say it is a m x m square puzzle
    var m = 3;
    //total width of the borad divided by number of cell in each line i.e 231/3 = 77
    var diffFactor = imageWidth / m;
    var blankCellId;
    var totalMove = 0;
    var totalTime = 0;
    var timerOn = false;
    var imageUrl = 'images/1.jpg';

    var player = {};
    player.isPlaying = false;
    //this will hold last shuffling time
    player.startTime = new Date().getTime();
    player.imageSeen = 0;

    blank = {};
    blank.id = '';

    //set height and width of all necessary components
    $('#imageHolder, #board1, #boardContainer').css({
        height: imageWidth + 'px',
        width: imageWidth + 'px'
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
                cells[cellNo].dataCellId = i + '_' + ((i * diffFactor) + (j * diffFactor));
                //cells[cellNo].correctTop = cells[cellNo].top;
                //cells[cellNo].correctLeft = cells[cellNo].left;

                $('<div class="cell" id="' + cells[cellNo].id + '" data-cellId="' + cells[cellNo].dataCellId + '"></div>').appendTo('#board1');
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
        blank.id = blankCellId;
        //hide the mask if visible
        hideMask();
    }

    //Check if player has won
    function isWinner() {
        for (var i = 1; i < cells.length; i++) {
            if (cells[i].left != $('#cell_' + i).css('left') || cells[i].top != $('#cell_' + i).css('top')) {
                //console.log('Not Winner');
                return (false);
            }

            if (i == (cells.length - 1)) {
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
        var tempoDataCellID;

        if ((thisLeft === blankLeft && Math.abs(thisTop - blankTop) === diffFactor) || (thisTop === blankTop && Math.abs(thisLeft - blankLeft) === diffFactor)) {

            $('#' + cellID).css('left', $('#' + blankCellId).css('left'));
            $('#' + cellID).css('top', $('#' + blankCellId).css('top'));
            $('#' + blankCellId).css('left', thisLeft);
            $('#' + blankCellId).css('top', thisTop);
            tempoDataCellID = $('#' + cellID).attr('data-cellid');
            $('#' + cellID).attr('data-cellid', $('#' + blankCellId).attr('data-cellid'));
            $('#' + blankCellId).attr('data-cellid', tempoDataCellID);
            swapSuccessful = true;
            totalMove++;
        }
        else {
            //console.log('this is a non swappable block...');
        }

        return (swapSuccessful);
    }     

    function shuffleUp3() {
        //checking the position of black cell, determine in which direction the blank cell 
        //can move

        //record the prev move, if prev move is right, blank should not go to left and vice versa... 
        //and prev up should restrict down on this move and vice versa
        var prev = -1;
        var shufflingLoop = 17 * m;
        var tempo;
        var targetCellId;

        for (var i = 0; i < shufflingLoop; i++) {
            //1=up, 2=right, 3=down, 4=left
            var tempDirections = [];
            var blankTopPx = $('#' + blank.id).css('top');
            var blankLeftPx = $('#' + blank.id).css('left');

            //restrict vertical movement
            if (blankTopPx == '0px' && prev != 1) {
                //can move towards down
                tempDirections.push(3);
            }
            else if (blankTopPx == ((imageWidth - diffFactor) + 'px') && prev != 3) {
                //can move towards up
                tempDirections.push(1);
            }
            else {
                //free to move both up and down
                if (prev != 1) { tempDirections.push(3); }
                if (prev != 3) { tempDirections.push(1); }
            }

            //restrict horizontal movement
            if (blankLeftPx == '0px' && prev != 4) {
                //can move towards right
                tempDirections.push(2);
            }
            else if (blankLeftPx == ((imageWidth - diffFactor) + 'px') && prev != 2) {
                //can move towards left
                tempDirections.push(4);
            }
            else {
                //free to move both left and right
                if (prev != 2) { tempDirections.push(4); }
                if (prev != 4) { tempDirections.push(2); }
            }

            //pick a random direction from tempDirections array
            var ranDir = Math.floor(Math.random() * tempDirections.length);
            prev = tempDirections[ranDir];

            var blankLeft = parseInt(blankLeftPx);
            var blankTop = parseInt(blankTopPx);
            var blankOnRow = parseInt($('#' + blank.id).attr('data-cellid').toString().split('_')[0])   //row starting from 0
            var totalCells = $('.cell').length;

            if (tempDirections[ranDir] == 1) { //up is chosen
                var targetDataCellId = (blankOnRow - 1) + '_' + ((blankTop - diffFactor) + blankLeft);
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                $('#' + blank.id).css('top', $(targetCellId).css('top'));
                $(targetCellId).css('top', blankTopPx);
            }
            else if (tempDirections[ranDir] == 2) { //right is chosen
                var targetDataCellId = blankOnRow + '_' + (blankTop + (blankLeft + diffFactor));
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                $('#' + blank.id).css('left', $(targetCellId).css('left'));
                $(targetCellId).css('left', blankLeftPx);
            }
            else if (tempDirections[ranDir] == 3) { //down is chosen
                var targetDataCellId = (blankOnRow + 1) + '_' + ((blankTop + diffFactor) + blankLeft);
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                $('#' + blank.id).css('top', $(targetCellId).css('top'));
                $(targetCellId).css('top', blankTopPx);
            }
            else if (tempDirections[ranDir] == 4) { //left is chosen               
                var targetDataCellId = blankOnRow + '_' + (blankTop + (blankLeft - diffFactor));               
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');                
                $('#' + blank.id).css('left', $(targetCellId).css('left'));
                $(targetCellId).css('left', blankLeftPx);
            }

            //swap the data-cellIDs between targetCell and Blankcell
            tempo = $(targetCellId).attr('data-cellid');
            $(targetCellId).attr('data-cellid', $('#' + blank.id).attr('data-cellid'));
            $('#' + blank.id).attr('data-cellid', tempo);
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
        var timeTaken = Math.round(((new Date().getTime()) - player.startTime) / 1000);
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
        showMask();
        function callShuffleUpOnMask() {
            if ($('.mask').css('display') == 'table') {
                //if mask is shown then only shuffle
                setTimeout(shuffleUp3, 50);
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
        if ($(this).hasClass('startTimer')) {
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
        
        //wait for the mask to show itself
        window.setTimeout(init, 100);
    })

    //Player wants to change the image with which to play
    $('#selectImage li img').on('click', function () {
        showMask();
        imageUrl = $(this).attr('src');
        $('#puzzleImg').attr('src', imageUrl);
        $('#board1').html('');

        //wait for the mask to show itself
        window.setTimeout(init, 100);
    });

    //Player wants t change the theme
    $('#selectTheme input[type=radio]').on('change', function () {
        var themeClass = $(this).val();
        $('body').removeClass().addClass(themeClass);
    });

    $('html').click(function () {
        $('.dropPanel').hide();
    });

    //upload image button is clicked
    $('#uploadImgButton').on('click', function () {
        pickSinglePhoto();
    });

    $('#closeStatBoard').click(function () {
        $('#statsBoard').hide();
    });


    /////////////////////////// TOP BUTTON PANEL BUTTON CLICK EVENTS //////////////////////////////////////////////////
    $('#topButtonPanel').on('click', 'span.fa', function (e) {
        e.stopPropagation();
        var panelID = $(this).attr('id') + 'Panel';

        //if show image panel was clicked and the image was not visible, then increment imageSeen count
        if (panelID == 'showImgPanel' && $('#' + panelID).css('display') == 'none') {
            player.imageSeen++;
        }

        //close all other dropPanels and show this one
        $('.dropPanel:not(#' + panelID + ')').hide();
        $('#' + panelID).toggle();
    });

}

//this function will show the mask for some time taking operation
function showMask() {
    $('.mask').css('display', 'table');
}

//this function will hide the mask
function hideMask() {
    window.setTimeout(function () {
        $('.mask').hide(500);
    }, 5);
}