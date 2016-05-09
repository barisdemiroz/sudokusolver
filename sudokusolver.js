"use strict";

var SudokuSolver = function() {
	var that = this;
	this.afterRowProject = function() { };
	this.afterColProject = function() { };
	this.afterBlockProject = function() { };
	this.afterSymbolProject = function() { };
	this.afterIteration = function() { };
	
	this.pauseFlag = false;

	var inputGrid;
	var x;
	var iterNo = 0;
	
	var r09 = math.range(0,9);

	this.getIterNo = function() {
		return iterNo;	
	};

	this.init = function(inputGridState) {
		iterNo = 0;
		inputGrid = inputGridState;
		this.pauseFlag = false;

		x = math.zeros(9,9,9);
		
		// set all cells to 1
		for (var i = 0; i < 9; ++i)
			for (var j = 0; j < 9; ++j)
				x.subset(math.index(i, j, 0), 1);
				
		x = concat4(x,x,x,x);		
	};

	this.solve = function(inputGridState) {
		this.init(inputGridState);
		this.step();
	};

	this.step = function() {
		privateStep();
	}

	function privateStep() {
		var BETA = 1;
		
		var pa = projectDivide(x);
		var pb = projectConcur(x);

		var fa = math.subtract(pa, math.divide(math.subtract(pa, x), BETA));
		var fb =      math.add(pb, math.divide(math.subtract(pb, x), BETA));

		pa = projectDivide(fb);
		pb = projectConcur(fa);

		var delta = math.subtract(pa, pb);
		x = math.add(x, math.multiply(BETA, delta));

		var deltaNorm = 0;
		delta.forEach(function(value) {
			deltaNorm += Math.abs(value);
		});

		iterNo++;
		that.afterIteration(iterNo, deltaNorm);

		if (deltaNorm < 1e-7 || that.pauseFlag)
		{
			paused = true;
			return;
		}

		setTimeout(privateStep, 10);
	}


	function fixCells(x) {
		// fix given cells
		var BIG_VAL = 999;
		for (var i = 0; i < 9; i++)
			for (var j = 0; j < 9; j++)
				if (inputGrid[i][j] != 0)
					x.subset(math.index(i,j,inputGrid[i][j]-1,0), BIG_VAL);
		return x;
	}

	
	function projectDivide(x) {
		var x0 = x.subset(math.index(r09, r09, r09, 0) );
		x0 = fixCells(x0);
		x0 = projectRow(x0);
		that.afterRowProject(toGridState(x0));
		
		var x1 = x.subset(math.index(r09, r09, r09, 1) );
		x1 = fixCells(x1);
		x1 = projectCol(x1);
		that.afterColProject(toGridState(x1));
		
		var x2 = x.subset(math.index(r09, r09, r09, 2) );
		x2 = fixCells(x2);
		x2 = projectBlock(x2);
		that.afterBlockProject(toGridState(x2));
		
		var x3 = x.subset(math.index(r09, r09, r09, 3) );
		x3 = fixCells(x3);
		x3 = projectSymbol(x3);
		that.afterSymbolProject(toGridState(x3));
		
		x = concat4(x0,x1,x2,x3);
		
		return x;
	}
	
	function projectConcur(x) {
		var m = math.mean(x, 3);
		x = concat4(m,m,m,m);
		return x;
	}
	
	function projectRow(x) {
		var arrX = x.valueOf();
		
		for (var i = 0; i < 9; ++i) {
			var w = math.zeros(9,9).valueOf();
			
			for (var j = 0; j < 9; ++j) {
				for (var k = 0; k < 9; ++k) {
					w[j][k] = -arrX[i][j][k];
				}
			}
			
			var munkres = new Munkres();
			var indices = munkres.compute(w);
			
			x.subset(math.index(i,r09,r09,0), math.zeros(1, 9, 9, 1));
			for (var j = 0; j < 9; ++j) {
				x.subset(math.index(i,j,indices[j][1],0), 1);
			}
		}
		
		return x;
	}
	
	function projectCol(x) {
		var arrX = x.valueOf();
		
		for (var j = 0; j < 9; ++j) {
		
			var w = math.zeros(9,9).valueOf();
			
			for (var i = 0; i < 9; ++i) {
				for (var k = 0; k < 9; ++k) {
					w[i][k] = -arrX[i][j][k];
				}
			}
			
			var munkres = new Munkres();
			var indices = munkres.compute(w);
			
			x.subset(math.index(r09,j,r09,0), math.zeros(9, 1, 9, 1));
			for (var i = 0; i < 9; ++i) {
				x.subset(math.index(i,j,indices[i][1],0), 1);
			}
		}
		
		return x;
	}
	
	function projectBlock(x) {
		var arrX = x.valueOf();
		
		for (var j = 0; j < 9; j += 3) {
			for (var i = 0; i < 9; i += 3) {
				var w = math.zeros(9,9).valueOf();

				var ix = 0;
				for (var m = i; m < i+3; ++m) {
					for (var n = j; n < j+3; ++n) {
						for (var k = 0; k < 9; ++k)
							w[ix][k] = -arrX[m][n][k];
						ix++;
					}
				}

				var munkres = new Munkres();
				var indices = munkres.compute(w);

				x.subset(math.index([i, i+1, i+2], [j, j+1, j+2], r09, 0), math.zeros(3, 3, 9, 1));

				var ix = 0;
				for (var m = i; m < i+3; ++m) {
					for (var n = j; n < j+3; ++n) {
						x.subset(math.index(m,n,indices[ix][1],0), 1);
						ix++;
					}
				}
			}
		}

		return x;
	}
	
	function projectSymbol(x) {
		for (var i = 0; i < 9; ++i) {
			for (var j = 0; j < 9; ++j) {
				var y = math.squeeze(x.subset(math.index(i, j, r09, 0))).valueOf();
				
				var maxVal = y[0]; var maxIx = 0;
				for (var k = 1; k < 9; ++k) {
					if (y[k] > maxVal) {
						maxVal = y[k];
						maxIx = k;
					}
				}
				
				x.subset(math.index(i,j,r09,0), math.zeros(1,1,9,1));
				x.subset(math.index(i,j,maxIx,0), 1);
			}
		}
		
		return x;
	}
	
	
	function concat4(a,b,c,d)
	{
		var x = math.zeros(9,9,9,4);
		x.subset(math.index(r09,r09,r09,0), a);
		x.subset(math.index(r09,r09,r09,1), b);
		x.subset(math.index(r09,r09,r09,2), c);
		x.subset(math.index(r09,r09,r09,3), d);
		return x;
	}


	function toGridState(x) {
		var state = math.zeros(9,9);
		
		x.forEach(function(value, ix) {
			if (value === 0)
				return;
			
			state.subset(math.index(ix[0], ix[1]), ix[2]+1);
		});
		
		return math.flatten(state).toArray();
	}
};
