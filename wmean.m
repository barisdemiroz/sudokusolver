function wm = wmean(X,W,dim)
    % wmean: compute a weighted mean along a given dimension
    % Usage: wm = wmean(X,W,dim)
    %
    % Arguments: (input)
    % X - vector or array of any dimension
    %
    % W - (OPTIONAL) vector of weights, must be the same length
    % as the size of X in the specified dimension. If W is
    % not supplied or is left empty, then the built-in mean
    % is called.
    %
    % At least one weight must be a positive number, all
    % must be non-negative.
    %
    % dim - (OPTIONAL) positive integer scalar - denotes the
    % dimension to compute the weighted mean over.
    %
    % If dim is not specified, then it will be the first
    % dimension that matches the length of W.
    %
    % Arguments: (output)
    % wm - weighted mean array (or vector). wm will be
    % the same shape/size as X, except in the specified
    % dimension.
    %
    % Example:
    % X = rand(3,5);
    % wmean(X,[0 1 3.5],1)
    % ans =
    % 0.19754 0.53772 0.49303 0.61549 0.13113
    %
    % See also: mean, median, mode, var, std
    %
    % Author: John D'Errico
    % e-mail: woodchips@rochester.rr.com
    % Release: 1.0
    % Release date: 7/7/08
    
    if (nargin==1) || (isempty(W) && (nargin<3))
        % no weights, no dim
        wm = mean(X);
        return
    elseif isempty(W)
        % no weights, dim provided
        wm = mean(X,dim);
        return
    end
    
    % weights were provided, and were not empty
    if ~isvector(W)
        error('W must be a vector.')
    end
    W = W(:);
    if any(W<0)
        error('All weights must be non-negative')
    elseif all(W==0)
        error('At least one must be positive')
    end
    nw = length(W);
    nx = size(X);
    
    % Normalize the weight vector to unit 1-norm
    W = W/norm(W,1);
    
    % we need to find dim?
    if (nargin<3) || isempty(dim)
        dim = find(nx==nw,1,'first');
        if isempty(dim)
            dim = 1;
        end
    elseif (dim<=0) || ~isscalar(dim) || dim~=round(dim)
        error('dim must be a positive integer scalar')
    end
    if nx(dim) ~= nw
        error('Weight vector is incompatible with size of X')
    end
    
    % compute the weighted mean - use bsxfun, then
    % just sum down the specified dimension.
    Wshape = ones(1,length(nx));
    Wshape(dim) = nw;
    wm = sum(bsxfun(@times,X,reshape(W,Wshape)),dim);