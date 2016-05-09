% Example sudoku solver implementation using divide and concur approach.
% Also related to Difference Map method.
%
% References:
%   - Gravel, Simon, and Veit Elser. "Divide and concur: A general approach to constraint satisfaction." Physical Review E 78.3 (2008): 036706.
%   - Elser, Veit, I. Rankenburg, and P. Thibault. "Searching with iterated maps." Proceedings of the National Academy of Sciences 104.2 (2007): 418-423.
%
% Author: Baris Evrim Demiroz (b.evrim at gmail dot com)

function runSudokuSolver()
    global board;
    
    % http://www.websudoku.com/?level=1&set_id=6560264061
    board = [0,8,0,0,0,2,0,5,3;
        3,5,0,0,8,0,0,4,1;
        0,4,1,7,0,0,9,0,0;
        5,0,0,0,0,0,0,9,0;
        1,0,3,0,6,0,8,0,5;
        0,6,0,0,0,0,0,0,2;
        0,0,5,0,0,1,6,8,0;
        8,1,0,0,7,0,0,2,9;
        7,2,0,8,0,0,0,3,0];
    
    % http://www.websudoku.com/?level=4&set_id=5260522677
    board = [0,0,0,0,7,2,0,6,0;
        0,0,6,0,0,0,1,0,0;
        5,0,0,6,0,0,0,0,0;
        0,3,0,0,9,0,0,0,8;
        2,0,5,0,3,0,6,0,1;
        6,0,0,0,5,0,0,7,0;
        0,0,0,0,0,8,0,0,4;
        0,0,9,0,0,0,3,0,0;
        0,8,0,9,6,0,0,0,0];
    
        board = [0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0;
        0,0,0,0,0,0,0,0,0];
    
    BETA = 1;
    projectA = @projectDivide;
    projectB = @projectConcur;
    
    x = zeros(9,9,9);
    
    % set all cells to 1
    x(:,:,1) = 1;
    
    x = cat(4, x, x, x, x);
    
    prevX = x;
    
    for iterNo=1:10000
        pa = projectA(x);
        pb = projectB(x);
        
        fa = pa - (pa - x) / BETA;
        fb = pb + (pb - x) / BETA;
        
        pa = projectA(fb);
        pb = projectB(fa);
        
        x = x + BETA * (pa - pb);
        
        delta = sum(abs(x(:)-prevX(:)));
        fprintf('delta: %f \t iter #%d finished\n', delta, iterNo);
        
        if delta < 1e-7
            break;
        end
        
        prevX = x;
    end
    
    printBoard(pa(:,:,:,1));
end

function printBoard(x)
    board = zeros(9);
    for i = 1:9
        for j = 1:9
            board(i,j) = find(x(i,j,:));
        end
    end
    
    disp(board);
end


function x = fixCells(board, x)
    BIG_VAL = 99;
    for i = 1:9
        for j = 1:9
            if board(i,j) == 0
                continue;
            end
            
            x(i,j,board(i,j)) = BIG_VAL;
        end
    end
end


function x = projectDivide(x)
    global board
    
    fixedX = fixCells(board, x(:,:,:,1));
    x1 = projectRow(fixedX);
    
    fixedX = fixCells(board, x(:,:,:,2));
    x2 = projectCol(fixedX);
    
    fixedX = fixCells(board, x(:,:,:,3));
    x3 = projectSymbol(fixedX);
    
    fixedX = fixCells(board, x(:,:,:,4));
    x4 = projectBlock(fixedX);
    
    x = cat(4, x1, x2, x3, x4);
end


function x = projectConcur(x)
    m = wmean(x, [1 1 1 1], 4);
    x = cat(4, m, m, m, m);
end


function x = projectRow(x)
    for i=1:9
        w = -squeeze(x(i,:,:));
        
        ind = munkres(w);
        
        x(i,:,:) = 0;
        for j=1:9
            x(i, j, ind(j)) = 1;
        end
    end
end


function x = projectCol(x)
    for j=1:9
        w = -squeeze(x(:,j,:));
        
        ind = munkres(w);
        
        x(:,j,:) = 0;
        for i=1:9
            x(i, j, ind(i)) = 1;
        end
    end
end


function x = projectSymbol(x)
    [~, ind] = min(-x, [], 3);
    
    x = zeros(9,9,9);
    
    for i=1:9
        for j=1:9
            x(i,j,ind(i,j)) = 1;
        end
    end
end


% probably can be vectorized further
function x = projectBlock(x)
    for i=1:3:9
        for j=1:3:9
            w = -reshape(x(i:i+2,j:j+2,:), 9, 9);
            
            ind = munkres(w);
            
            x(i:i+2,j:j+2,:) = 0;
            c = 1;
            for n=j:j+2
                for m=i:i+2
                    x(m,n,ind(c)) = 1;
                    c = c+1;
                end
            end
        end
    end
end