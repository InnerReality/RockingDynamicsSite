%% Parameteric analysis with changing cdamp
% Driver that simply runs minaccel_example at different amplitudes of the
% acceleration pulse
plotall = false;
accelscale = 2;
mssign = 1e5;
wssign = 1/mssign;
cdamp = 1e6;

minaccel_example

bws_to_plot = [3 9];

for n = bws_to_plot
    fn = X(:,2+n)+nonlin_force_bw(Delt(:,n));
    figure(1003),
        plot(T, fn, 'LineWidth',1.5),
        hold on
    figure(1004),
        plot(Delt(:,n), fn, 'LineWidth',1.5),
        hold on
end

%% FORMAT figure for presentation
figure(1003),
    xlabel('Time (s)')
    ylabel('BW stack force (lb)')
    grid on
    legend('BW stack 3 at 60^o','BW stack 9 at 240^o','Location','northeast')

exportgraphics(gcf,'../../../doc/RockingDynamics/Figures/HystExampleTime.pdf')

figure(1004),
    xlabel('BW stack deformation (s)')
    ylabel('BW stack force (lb)')
    grid on
    legend('BW stack 3 at 60^o','BW stack 9 at 240^o','Location','northwest')

exportgraphics(gcf,'../../../doc/RockingDynamics/Figures/HystExampleHyst.pdf')

figure(1005),
    plot(T, Phi, 'LineWidth', 1.5)
    xlabel('Time (s)')
    ylabel('\phi (rad)')
    grid on
    
exportgraphics(gcf,'../../../doc/RockingDynamics/Figures/HystExamplePhi.pdf')

%% Animate
geom.h1 = 24; geom.d1 = 12;
geom.h2 = 1;  geom.d2 = 24;
geom.h3 = 72; geom.d3 = 16;
geom.r0 = 12;

videoFileName = '../../../doc/RockingDynamics/Videos/PulseAt60o.mp4';

fig = animate_rigid_body(T(1:10:end), Phi(1:10:end), X(1:10:end,1), ...
    geom, 100, ssign, videoFileName);
