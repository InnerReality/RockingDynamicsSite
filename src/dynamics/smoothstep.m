function [y, dy, d2y] = smoothstep(x, m, w, c)
%SMOOTHSTEP  C^3 patch of the line y = m*x into the flat plateaus y = +/-c.
%
%   [Y, DY, D2Y] = SMOOTHSTEP(X, M, W, C) evaluates, elementwise on X, the
%   odd, piecewise-defined function
%
%       y = -c                          for x <= -(x0+w)
%       y = -h(-x)                      for -(x0+w) <= x <= -x0
%       y = m*x                         for   -x0   <  x <    x0
%       y =  h(x)                       for    x0   <= x <=  x0+w
%       y =  c                          for x >=   x0+w
%
%   where x0 = c/m - w/2 and
%
%       h(x) = alpha*g((x-x0)/w) + beta,   alpha = m*w/2,  beta = c - m*w/2
%
%   g is the C^3 base blend on [0,1] satisfying
%       g(0)=0, g'(0)=2, g''(0)=0, g'''(0)=0
%       g(1)=1, g'(1)=0, g''(1)=0, g'''(1)=0
%       g'(t)>0 and g''(t)<0 for t in (0,1)
%
%   so that h smoothly (C^3) connects the line m*x at x=x0 to the flat
%   value c at x=x0+w, and the whole assembly is C^3 everywhere,
%   including at the two outer joins and, by oddness, at the origin.
%
%   INPUTS
%       x - array of evaluation points (any size)
%       m - slope of the central linear segment (m > 0)
%       w - width of each blend region (0 < w < 2*c/m)
%       c - plateau height (c > 0)
%
%   OUTPUTS
%       y   - function value,        same size as x
%       dy  - first derivative,      same size as x  (optional)
%       d2y - second derivative,     same size as x  (optional)
%
%   Example:
%       x = linspace(-3,3,1000);
%       [y,dy,d2y] = smoothstep(x, 2, 0.5, 1);
%       plot(x,y); hold on; plot(x,dy); plot(x,d2y);

    if m <= 0 || w <= 0 || c <= 0
        error('smoothstep:badInput', 'Require m > 0, w > 0, c > 0.');
    end

    x0 = c/m - w/2;
    x1 = x0 + w;

    if x0 <= 0
        error('smoothstep:badWidth', ...
            'Require w < 2*c/m (got w = %.6g, 2*c/m = %.6g) so that x0 > 0.', ...
            w, 2*c/m);
    end

    alpha = m*w/2;
    beta  = c - m*w/2;

    y   = zeros(size(x));
    dy  = zeros(size(x));
    d2y = zeros(size(x));

    % --- Outer flat plateaus ---
    maskNeg = x <= -x1;
    y(maskNeg)   = -c;

    maskPos = x >= x1;
    y(maskPos)   = c;

    % --- Central linear segment ---
    maskLin = (x > -x0) & (x < x0);
    y(maskLin)   = m*x(maskLin);
    dy(maskLin)  = m;

    % --- Right blend region: h(x) on [x0, x1] ---
    maskR = (x >= x0) & (x <= x1);
    t = (x(maskR) - x0)/w;
    [gv, gpv, gppv] = gbase(t);
    y(maskR)   = alpha*gv + beta;
    dy(maskR)  = (m/2)*gpv;
    d2y(maskR) = (m/(2*w))*gppv;

    % --- Left blend region: -h(-x) on [-x1, -x0] ---
    maskL = (x >= -x1) & (x <= -x0);
    xm = -x(maskL);
    t = (xm - x0)/w;
    [gv, gpv, gppv] = gbase(t);
    hv   = alpha*gv + beta;
    hpv  = (m/2)*gpv;
    hppv = (m/(2*w))*gppv;
    y(maskL)   = -hv;
    dy(maskL)  = hpv;
    d2y(maskL) = -hppv;

end

function [g, gp, gpp] = gbase(t)
%GBASE  C^3 base blend on [0,1]: g(0)=0,g'(0)=2,g''(0)=0,g'''(0)=0,
%       g(1)=1,g'(1)=0,g''(1)=0,g'''(1)=0, g'>0 and g''<0 on (0,1).
    g   = 2*t - 5*t.^4 + 6*t.^5 - 2*t.^6;
    gp  = 2 - 20*t.^3 + 30*t.^4 - 12*t.^5;
    gpp = -60*t.^2.*(t-1).^2;
end
