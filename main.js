"use strict";
		
window.onload = function() {
	$('#inputTable').clone().prop({ id: 'rowProjectionTable' }).appendTo('#rowProjectionContainer');
	$('#inputTable').clone().prop({ id: 'colProjectionTable' }).appendTo('#colProjectionContainer');
	$('#inputTable').clone().prop({ id: 'blockProjectionTable' }).appendTo('#blockProjectionContainer');
	$('#inputTable').clone().prop({ id: 'symbolProjectionTable' }).appendTo('#symbolProjectionContainer');
	
	var solver = new SudokuSolver();
	solver.afterRowProject = function(state) { displayGrid($('#rowProjectionTable'), state); };
	solver.afterColProject = function(state) { displayGrid($('#colProjectionTable'), state); };
	solver.afterBlockProject = function(state) { displayGrid($('#blockProjectionTable'), state); };
	solver.afterSymbolProject = function(state) { displayGrid($('#symbolProjectionTable'), state); };
	solver.afterIteration = function(iterNo, deltaNorm) { $('#iterNo').text(iterNo); $('#deltaNorm').text(deltaNorm.toFixed(2)); };
	

	$('#easyExample').click(fillEasyExample);
	$('#hardExample').click(fillHardExample);
	

	$('#goButton').click(function() {
		if (solver.getIterNo() == 0) {
			var grid = getInputGrid();
			solver.init(grid);
		}

		solver.pauseFlag = false;
		solver.step();

		$('#goButton').prop('disabled', true);
		$('#pauseButton').prop('disabled', false);
		$('#stepButton').prop('disabled', true);
		$('#stopButton').prop('disabled', false);
	});

	$('#pauseButton').click(function() {
		solver.pauseFlag = true;

		$('#goButton').prop('disabled', false);
		$('#pauseButton').prop('disabled', true);
		$('#stepButton').prop('disabled', false);
	});

	$('#stepButton').click(function() {
		if (solver.getIterNo() == 0) {
			var grid = getInputGrid();
			solver.init(grid);
		}
		
		solver.pauseFlag = true;
		solver.step();
		
		$('#goButton').prop('disabled', false);
		$('#pauseButton').prop('disabled', true);
		$('#stepButton').prop('disabled', false);
	});

	$('#stopButton').click(function() {
		solver.pauseFlag = true;
		
		clearUI();

		solver.init([]);

		$('#goButton').prop('disabled', false);
		$('#pauseButton').prop('disabled', true);
		$('#stepButton').prop('disabled', false);
		$('#stopButton').prop('disabled', true);
	});
}

function clearUI() {
	$('#iterNo').text('');
	$('#deltaNorm').text('');
	clearGrid($('#rowProjectionTable'));
	clearGrid($('#colProjectionTable'));
	clearGrid($('#blockProjectionTable'));
	clearGrid($('#symbolProjectionTable'));
}

function clearGrid(grid) {
	grid.find('input').each(function (index, e) {
		$(e).val('');
	});
}

function fillEasyExample() {
	var grid = [0,8,0,0,0,2,0,5,3,
				3,5,0,0,8,0,0,4,1,
				0,4,1,7,0,0,9,0,0,
				5,0,0,0,0,0,0,9,0,
				1,0,3,0,6,0,8,0,5,
				0,6,0,0,0,0,0,0,2,
				0,0,5,0,0,1,6,8,0,
				8,1,0,0,7,0,0,2,9,
				7,2,0,8,0,0,0,3,0];

	fillInputGrid(grid);
}

function fillHardExample() {
	var grid = [0,0,0,0,7,2,0,6,0,
				0,0,6,0,0,0,1,0,0,
				5,0,0,6,0,0,0,0,0,
				0,3,0,0,9,0,0,0,8,
				2,0,5,0,3,0,6,0,1,
				6,0,0,0,5,0,0,7,0,
				0,0,0,0,0,8,0,0,4,
				0,0,9,0,0,0,3,0,0,
				0,8,0,9,6,0,0,0,0];
	
	fillInputGrid(grid);
}


function fillInputGrid(grid) {
	$('#inputTable').find('input').each(function(index, e) {
		if (grid[index] === 0)
			$(e).val('');
		else
			$(e).val(grid[index]);
	});
}

function getInputGrid() {
	var arr = $('#inputTable').find('input').map(function(i, e) {
		var val = $(e).val();
		if (!val)
			return 0;

		return val;
	});

	var grid = [];
	while(arr.length)
		grid.push(arr.splice(0,9));

	return grid;
}

function displayGrid(grid, state) {
	grid.find('input').each(function (index, e) {
		$(e).val(state[index]);
	});
}