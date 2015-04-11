$(function () {

    initGame();

});

function initGame() {
    // NOTE: I have started the Cell Array from 1... Hence the 0th location is blank

    var imageWidth = 480	            //	$('#puzzleImg').height(); //Since I have decided to take only 240x240 size image, So can be hard coded
    if ($('body').hasClass('phone')) {
        imageWidth = 240;
    }

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
    player.startTime = new Date().getTime();        //this will hold last shuffling time
    player.imageSeen = 0;

    blank = {};
    blank.id = '';

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

        //console.log(cells);
        for (var i = 1; i < cells.length; i++) {
            //console.log(i);
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

    //this function will shuffle the puzzle for playing again
    //function shuffleUp() {
    //    var maxCellIndex = cells.length - 1;
    //    var swapCount = 0;
    //    var shufflingCount = 300;
    //    console.log('shuffleUp start sec = ' + new Date().getSeconds());
    //    while (swapCount < shufflingCount) {
    //        var randomCellIndex = Math.floor(Math.random() * maxCellIndex) + 1;
    //        if (swapIfSwappable('cell_' + randomCellIndex)) {
    //            swapCount++;
    //            console.log('loop = ' + swapCount + ' of ' + shufflingCount);
    //        }
    //    }
    //    console.log('shuffleUp end sec = ' + new Date().getSeconds());
    //    hideMask();
    //    resetPlayerStats();
    //}


    //in this new shuffle function we will concentrate on mainly moving the blank cell
    //to random directions, thus shuffling the puzzle
    //function shuffleUp2() {
    //    //checking the position of black cell, determine in which direction the blank cell 
    //    //can move
    //    //say we want to move it 300 times

    //    //record the prev move, if prev move is right, blank should not go to left and vice versa... 
    //    //and prev up should restrict down on this move and vice versa
    //    var prev = -1;
    //    var shufflingLoop = 300; //50 * m;

    //    console.log('shuffleUp2 loop start time = ' + (new Date().getSeconds()));
    //    for (var i = 0; i < shufflingLoop; i++) {
    //        console.log('loop = ' + i + ' of ' + shufflingLoop);
    //        //1=up, 2=right, 3=down, 4=left
    //        var tempDirections = [];

    //        //console.log(tempDirections);

    //        //restrict vertical movement
    //        if ($('#' + blank.id).css('top') == '0px' && prev != 1) {
    //            //can move towards down
    //            tempDirections.push(3);
    //        }
    //        else if ($('#' + blank.id).css('top') == ((imageWidth - diffFactor) + 'px') && prev != 3) {
    //            //can move towards up
    //            tempDirections.push(1);
    //        }
    //        else {
    //            //free to move both up and down
    //            if (prev != 1) { tempDirections.push(3); }
    //            if (prev != 3) { tempDirections.push(1); }
    //        }

    //        //restrict horizontal movement
    //        if ($('#' + blank.id).css('left') == '0px' && prev != 4) {
    //            //can move towards right
    //            tempDirections.push(2);
    //        }
    //        else if ($('#' + blank.id).css('left') == ((imageWidth - diffFactor) + 'px') && prev != 2) {
    //            //can move towards left
    //            tempDirections.push(4);
    //        }
    //        else {
    //            //free to move both left and right
    //            if (prev != 2) { tempDirections.push(4); }
    //            if (prev != 4) { tempDirections.push(2); }
    //        }

    //        //console.log(tempDirections);

    //        //pick a random direction from tempDirections array
    //        var ranDir = Math.floor(Math.random() * tempDirections.length);
    //        prev = tempDirections[ranDir];

    //        var blankLeft = parseInt($('#' + blank.id).css('left'));
    //        var blankTop = parseInt($('#' + blank.id).css('top'));
    //        var totalCells = $('.cell').length;
    //        //console.log(tempDirections[ranDir]);

    //        if (tempDirections[ranDir] == 1) { //top is chosen
    //            //console.log('to be moved up');
    //            //$('.cell').each(function () {
    //            for (var k = 1; k < totalCells; k++) {
    //                var thisCell = $('#cell_' + k);
    //                var thisLeft = parseInt(thisCell.css('left'));
    //                var thisTop = parseInt(thisCell.css('top'));
    //                if (thisLeft == blankLeft && (thisTop + diffFactor) == blankTop) {
    //                    var temp = $('#' + blank.id).css('top');
    //                    $('#' + blank.id).css('top', thisCell.css('top'));
    //                    thisCell.css('top', temp);
    //                    break;
    //                }
    //            }
    //            //})
    //        }
    //        else if (tempDirections[ranDir] == 2) { //right is chosen
    //            //console.log('to be moved right');
    //            //$('.cell').each(function () {
    //            for (var k = 1; k < totalCells; k++) {
    //                var thisCell = $('#cell_' + k);
    //                var thisLeft = parseInt(thisCell.css('left'));
    //                var thisTop = parseInt(thisCell.css('top'));
    //                if ((thisLeft - diffFactor) == blankLeft && thisTop == blankTop) {
    //                    var temp = $('#' + blank.id).css('left');
    //                    $('#' + blank.id).css('left', thisCell.css('left'));
    //                    thisCell.css('left', temp);
    //                    break;
    //                }
    //            }
    //            //})
    //        }
    //        else if (tempDirections[ranDir] == 3) { //down is chosen
    //            //console.log('to be moved down');
    //            //$('.cell').each(function () {
    //            for (var k = 1; k < totalCells; k++) {
    //                var thisCell = $('#cell_' + k);
    //                var thisLeft = parseInt(thisCell.css('left'));
    //                var thisTop = parseInt(thisCell.css('top'));
    //                if (thisLeft == blankLeft && (thisTop - diffFactor) == blankTop) {
    //                    var temp = $('#' + blank.id).css('top');
    //                    $('#' + blank.id).css('top', thisCell.css('top'));
    //                    thisCell.css('top', temp);
    //                    break;
    //                }
    //            }
    //            //})
    //        }
    //        else if (tempDirections[ranDir] == 4) { //left is chosen 
    //            //console.log('to be moved left');
    //            //$('.cell').each(function () {
    //            for (var k = 1; k < totalCells; k++) {
    //                var thisCell = $('#cell_' + k);
    //                var thisLeft = parseInt(thisCell.css('left'));
    //                var thisTop = parseInt(thisCell.css('top'));
    //                if ((thisLeft + diffFactor) == blankLeft && thisTop == blankTop) {
    //                    var temp = $('#' + blank.id).css('left');
    //                    $('#' + blank.id).css('left', thisCell.css('left'));
    //                    thisCell.css('left', temp);
    //                    break;
    //                }
    //            }
    //            //})
    //        }
    //    }
    //    console.log('shuffleUp2 loop end time = ' + (new Date().getSeconds()));
    //    hideMask();
    //    resetPlayerStats();
    //}

    function shuffleUp3() {
        //checking the position of black cell, determine in which direction the blank cell 
        //can move
        //say we want to move it 300 times

        //record the prev move, if prev move is right, blank should not go to left and vice versa... 
        //and prev up should restrict down on this move and vice versa
        var prev = -1;
        var shufflingLoop = 17 * m;
        var tempo;
        console.log('shuffleUp3 loop start time = ' + (new Date().getSeconds()));
        var targetCellId;

        for (var i = 0; i < shufflingLoop; i++) {
            console.log('loop = ' + i + ' of ' + shufflingLoop);
            //1=up, 2=right, 3=down, 4=left
            var tempDirections = [];
            var blankTopPx = $('#' + blank.id).css('top');
            var blankLeftPx = $('#' + blank.id).css('left');
            //console.log(tempDirections);

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

            //console.log(tempDirections);

            //pick a random direction from tempDirections array
            var ranDir = Math.floor(Math.random() * tempDirections.length);
            prev = tempDirections[ranDir];

            var blankLeft = parseInt(blankLeftPx);
            var blankTop = parseInt(blankTopPx);
            var blankOnRow = parseInt($('#' + blank.id).attr('data-cellid').toString().split('_')[0])   //row starting from 0
            var totalCells = $('.cell').length;
            //console.log(tempDirections[ranDir]);

            if (tempDirections[ranDir] == 1) { //up is chosen
                //console.log('to be moved up');
                var targetDataCellId = (blankOnRow - 1) + '_' + ((blankTop - diffFactor) + blankLeft);
                //console.log(targetDataCellId);
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                //console.log(targetCellId);
                //console.log($(targetCellId).css('top'));
                $('#' + blank.id).css('top', $(targetCellId).css('top'));
                $(targetCellId).css('top', blankTopPx);
            }
            else if (tempDirections[ranDir] == 2) { //right is chosen
                //console.log('to be moved right');
                var targetDataCellId = blankOnRow + '_' + (blankTop + (blankLeft + diffFactor));
                //console.log(targetDataCellId);
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                //console.log(targetCellId);
                $('#' + blank.id).css('left', $(targetCellId).css('left'));
                $(targetCellId).css('left', blankLeftPx);
            }
            else if (tempDirections[ranDir] == 3) { //down is chosen
                //console.log('to be moved down');
                var targetDataCellId = (blankOnRow + 1) + '_' + ((blankTop + diffFactor) + blankLeft);
                //console.log(targetDataCellId);
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                //console.log(targetCellId);
                $('#' + blank.id).css('top', $(targetCellId).css('top'));
                $(targetCellId).css('top', blankTopPx);
            }
            else if (tempDirections[ranDir] == 4) { //left is chosen 
                //console.log('to be moved left');
                var targetDataCellId = blankOnRow + '_' + (blankTop + (blankLeft - diffFactor));
                //console.log(targetDataCellId);
                targetCellId = '#' + $('.cell[data-cellid=' + targetDataCellId + ']').attr('id');
                //console.log(targetCellId);
                $('#' + blank.id).css('left', $(targetCellId).css('left'));
                $(targetCellId).css('left', blankLeftPx);
            }

            //swap the data-cellIDs between targetCell and Blankcell
            tempo = $(targetCellId).attr('data-cellid');
            $(targetCellId).attr('data-cellid', $('#' + blank.id).attr('data-cellid'));
            $('#' + blank.id).attr('data-cellid', tempo);
        }
        console.log('shuffleUp3 loop end time = ' + (new Date().getSeconds()));
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
        //console.log('shuffle clicked');
        showMask();
        //shuffleUp();
        //call the shuffle function with a delay, so that the screen doesnot get freezed immediately        
        //the shuffleup should be called only after mask is displayed to prevent screen freezing
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
            $('#imageHolder').css('display', 'table');
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
    //console.log('showmask called');

    $('.mask').css('display', 'table');
    //$('.mask').show();
}

//this function will hide the mask
function hideMask() {
    //console.log('hidemask called');

    window.setTimeout(function () {
        $('.mask').hide(500);
    }, 5);
}