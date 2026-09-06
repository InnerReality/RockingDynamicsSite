% x = (-2:1e-5:2)'; % Example 1
x = (-0.1:1e-6:0.1)'; % Example 2

production = true;

addpath ../dynamics/
% smoothstep(x, m, w, c)
% ssign = @(t_)(smoothstep(t_,2,0.5,1)); % Example 1
ssign = @(t_)(smoothstep(t_,100,0.01,1)); % Example 2
[y, yp, ypp] = ssign(x);
%rmpath ../dynamics/

figure(101),
    tiledlayout(3,1)

    nexttile
    plot(x, y, 'LineWidth', 2),
    grid on,
    xlabel('x')
    ylabel('sgn(x)')

    nexttile
    if (~production)
        plot(x, yp, x(2:end), diff(y)./diff(x))
    else
        plot(x, yp, 'LineWidth',2)
    end
    grid on
    xlabel('x')
    ylabel('sgn''(x)')

    nexttile
    if (~production)
        plot(x, ypp, x(2:end), diff(yp)./diff(x))
    else
        plot(x, ypp, 'LineWidth',2)
    end
    grid on
    xlabel('x')
    ylabel('sgn''''(x)')

if production
    % exportgraphics(gcf,'../../doc/RockingDynamics/Figures/SmoothSgn2.pdf') % Example 1
    exportgraphics(gcf,'../../doc/RockingDynamics/Figures/SmoothSgn2.pdf') % Example 2
end

% This is what will be used for the damping term in the dynamics
figure(104)
    plot(x, [1-y.^2, yp/max(yp)])
