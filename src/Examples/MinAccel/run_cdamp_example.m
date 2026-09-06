%% Parameteric analysis with changing cdamp
% Driver that simply runs minaccel_example at different amplitudes of the
% acceleration pulse
accelscale = 2;
mssign = 1e5;
wssign = 1/mssign;

cdamp_ = [1e4 1e5 1e6 1e7];
cdamplabel_ = {'10^4','10^5','10^6','10^7'};

plotall = false;

figure(1002), tiledlayout(2,2,'TileSpacing','tight','Padding','tight')
nrun = 1;
for cdamp = cdamp_
    minaccel_example
    nexttile
        plot(T, X(:,1)),
        xlabel('Time (s)')
        ylabel('Rotation (rad)')
        title(sprintf('c_{damp} = %s lb-s/in',cdamplabel_{nrun}))
        grid on
    nrun = nrun + 1;
end

return

%% FORMAT figure for presentation
exportgraphics(gcf,'../../../doc/RockingDynamics/Figures/CdampExample.pdf')
