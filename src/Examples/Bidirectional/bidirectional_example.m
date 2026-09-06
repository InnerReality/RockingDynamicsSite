%% Example - demonstrate minimum acceleration needed to activate rocking
% Uses dynamics code from commit  ad6b45474c5bfd8c1f211458417a41d8271239c0

if (~exist('accelscale','var')) % Not set by some driver script
    accelscale = 1.1;
end

if (~exist('plotall','var')) % Not set by some driver script
    plotall = true;
end

if (~exist('mssign','var')) % Not set by some driver script
    mssign = 1e5;
end

if (~exist('wssign','var')) % Not set by some driver script
    wssign = 1e-5;
end

if (~exist('cdamp','var')) % Not set by some driver script
    cdamp = 1e6;
end

%% Path
addpath ../../dynamics/

%% Exitation
grav = 386.4; % acceleration due to gravity (in/s^2)
dt_ = 0.001;
t_ = (0:dt_:10)';
u_ = zeros(length(t_),3);
u_(:,1) = sin(2*pi*1*t_)*grav*2;
u_(:,2) = sin(2*pi*2*t_)*grav*2;
u_(:,3) = u_(:,3) - grav;
Phi_ = getPhiFromU(u_, 0, dt_, 1);
Phidot_ = [diff(unwrap(Phi_))./diff(t_); 0];
Phidot_(1) = 0;

%% Set up smooth sign
ssign = @(t_)(smoothstep(t_,mssign,wssign,1));

%% BW callback functions
delt0 = 0.03; % preload
uBW0_ = @(t_)(min(delt0*t_,1));
uBWd0_ = @(t_)(delt0*(t_<=1));

BWhyst0 = @(t_,f_)(bellevillemodel(f_,uBW0_(t_),uBWd0_(t_),@nonlin_force_bw));

% Apply preload
[~, X] = ode45(BWhyst0, [0 1], 0);

fh0 = X(end);
fBW = fh0 + nonlin_force_bw(delt0);
fprintf('BW preload = %g lb\n',fBW)

BWfe = @(u_)nonlin_force_bw(u_);
BWhyst = @(f_,u_,ud_)(bellevillemodel(f_,u_,ud_,@nonlin_force_bw));

%% Rigid body/rocking paramters
mass = 1000/grav; % mass (lb-s^2/in) 
II = 4000; % moment of inertia about base (axisymmetric) (lb-s^2-in)
r0 = 12; % outmost radius (in)
hCM = 40; % height of center of mass (in)

%% BW positions
r1 = 10.5; % BW radius
nBW = 12; % number of BW stacks
alphBW = (0:nBW-1)*(2*pi)/nBW; % BW location angles
xBW0 = r1*[cos(alphBW); sin(alphBW)]; % body frame (x, y) coord

%% Solve rocking dynamics
f = @(t_,x_)rocking_dynamics(t_, x_, ...
                             u_, Phi_, Phidot_, dt_, ...
                             ssign, ...
                             mass, II, r0, hCM, cdamp, ...
                             xBW0, BWhyst, BWfe, delt0);
x0 = zeros(2+nBW,1);
x0(3:end) = fh0;

opt = odeset('MaxStep',1e-2,'RelTol',1e-6,'AbsTol',1e-8);

tic
[T, X] = ode15s(f, (0:0.001:11), x0, opt);
toc

if plotall
figure(101),
    plot(T, X(:,1))

figure(102),
    plot(T, X(:,2))
end

%% Evaluate xdot at computed X
Xdot = zeros(size(X));
Phi = zeros(size(T));
Delt = zeros(length(T),12);
Deltd = zeros(length(T),12);
for n = 1:length(T)
    [Xdot(n,:), Phi(n), Delt(n,:), Deltd(n,:)] = f(T(n), X(n,:)');
end

if plotall
figure(201),
    plot(T, Phi)

for n = [1 7]
    figure(202), plot(T, X(:,2+n)+nonlin_force_bw(Delt(:,n))), hold on
    figure(203), plot(Delt(:,n), X(:,2+n)+nonlin_force_bw(Delt(:,n))), hold on
end
figure(202), hold off
figure(203), hold off
end
return
%% Animate
addpath ../../animate/

geom.h1 = 24; geom.d1 = 12;
geom.h2 = 1;  geom.d2 = 24;
geom.h3 = 72; geom.d3 = 16;
geom.r0 = 12;

videoFileName = '../../../doc/RockingDynamics/Videos/Bidirectional.mp4';

fig = animate_rigid_body(T(1:10:end), Phi(1:10:end), X(1:10:end,1), ...
    geom, 50, ssign, videoFileName);

rmpath ../../animate/

%% Path
rmpath ../../dynamics/

%% Plots for presentation
figure(101),
    xlabel('Time (s)'),
    ylabel('Rotation,\theta (rad)')
    grid on
    h = get(gca, 'Children');
    set(h(1),'Linewidth',1.5)

exportgraphics(gca,'../../../doc/RockingDynamics/Figures/BidirectExampleTheta.pdf')

figure(201),
    xlabel('Time (s)'),
    ylabel('Tipping point, \phi (rad)')
    grid on
    h = get(gca, 'Children');
    set(h(1),'Linewidth',1.5)

exportgraphics(gca,'../../../doc/RockingDynamics/Figures/BidirectExamplePhi.pdf')

figure(202),
    xlabel('Time (s)'),
    ylabel('BW stack force (lb)')
    grid on
    legend('BW stack 1', 'BW stack 7', 'Location','northeast')

exportgraphics(gca,'../../../doc/RockingDynamics/Figures/BidirectExampleForce.pdf')

figure(203),
    xlabel('BW stack deformation (in)'),
    ylabel('BW stack force (lb)')
    grid on
    legend('BW stack 1', 'BW stack 7', 'Location','northwest')

exportgraphics(gca,'../../../doc/RockingDynamics/Figures/BidirectExampleHyst.pdf')

figure(301),
    plot(u_(:,1)/grav,u_(:,2)/grav,'LineWidth',1.5)
    grid on
    xlabel('Base acceleration in X (g)')
    ylabel('Base acceleration in Y (g)')
    daspect([1 1 1])

exportgraphics(gca,'../../../doc/RockingDynamics/Figures/BidirectExampleExcitation.pdf')
