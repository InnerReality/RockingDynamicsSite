%% Parameteric analysis with changing ssign parameters
% Driver that simply runs minaccel_example at different amplitudes of the
% acceleration pulse
accelscale_ = 0.1:0.1:2;
plotall = false;

% RUN 1
mssign = 1e4;
wssign = 1/mssign;
thetmax_ = zeros(size(accelscale_));
nrun = 1;
for accelscale = accelscale_
    minaccel_example
    thetmax_(nrun) = max(abs(X(:,1)));
    nrun = nrun + 1;
end

figure(1001),
    plot(accelscale_, thetmax_),
    hold on

% RUN 2
mssign = 1e5;
wssign = 1/mssign;
thetmax_ = zeros(size(accelscale_));
nrun = 1;
for accelscale = accelscale_
    minaccel_example
    thetmax_(nrun) = max(abs(X(:,1)));
    nrun = nrun + 1;
end

figure(1001),
    plot(accelscale_, thetmax_),

% RUN 3
mssign = 1e6;
wssign = 1/mssign;
thetmax_ = zeros(size(accelscale_));
nrun = 1;
for accelscale = accelscale_
    minaccel_example
    thetmax_(nrun) = max(abs(X(:,1)));
    nrun = nrun + 1;
end

figure(1001),
    plot(accelscale_, thetmax_),

%% FORMAT figure for presentation
figure(1001),
    xlabel('Peak base acceleration (g)')
    ylabel('Maximum rocking angle (rad)')
    grid on
    legend('m_{sgn} = 10^4','m_{sgn} = 10^5','m_{sgn} = 10^6',...
           'location','northwest')
    h = get(gca,'Children');
    set(h(1),'Color','b','LineWidth',1.5,'LineStyle','--')
    set(h(2),'Color','r','LineWidth',1.5)
    set(h(3),'Color','m','LineWidth',1.5)

exportgraphics(gca,'../../../doc/RockingDynamics/Figures/MinAccelExample.pdf')
