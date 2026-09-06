%% Load EQ input
grav = 386.4; % acceleration due to gravity (in/s^2)
if 0
dt_ = 1/512; % Sample time in seconds for the input
u_ = table2array(readtable("Cerl_input.txt"))*grav*1.25;
% u_(:,3) = 0;
t_ = (0:size(u_,1)-1)'*dt_;
ud_ = [diff(u_)/dt_; 0 0 0];
else % try some pulses for troubleshooting
    dt_ = 0.001;
    t_ = (0:dt_:8)';
    gamm1 = pi/3;
    gamm2 = -pi/4;
    amp1 = [cos(gamm1) sin(gamm1) 0]*grav*2;
    amp2 = [cos(gamm2) sin(gamm2) 0]*grav;
    wind1 = t_<=0.1;
    t1 = 5; t2 = 6;
    wind2 = (t_>=t1)&(t_<=t2);
    u_ = zeros(length(t_),3);
    ud_ = zeros(length(t_),3);
    u_(wind1,:) = amp1.*(1 - cos(2*pi*10*t_(wind1)))/2;
    ud_(wind1,:) = pi*10*amp1.*sin(2*pi*10*t_(wind1));
    u_(wind2,:) = u_(wind2,:) + amp2.*(1 - cos(2*pi*1*(t_(wind2)-t2)))/2;
    ud_(wind2,:) = ud_(wind2,:) + pi*1*amp2.*sin(2*pi*1*(t_(wind2)-t2));
end
Phi_ = getPhiFromU(u_, 0, dt_, 1);

%% Path
addpath ../dynamics/

%% Set up smooth sign
ssign = @(t_)(smoothstep(t_,1000,0.001,1));

%% BW callback functions
delt0 = 0.1; % preload
uBW0_ = @(t_)(min(delt0*t_,1));
uBWd0_ = @(t_)(delt0*(t_<=1));

BWhyst0 = @(t_,f_)(bellevillemodel(f_,uBW0_(t_),uBWd0_(t_),@nonlin_force_bw));

% Apply preload
[~, X] = ode45(BWhyst0, [0 1], 0);

fh0 = X(end);

BWfe = @(u_)nonlin_force_bw(u_);
BWhyst = @(f_,u_,ud_)(bellevillemodel(f_,u_,ud_,@nonlin_force_bw));

%% Rigid body/rocking paramters
mass = 3*543.86/grav; % mass (lb-s^2/in) 
II = 4*2054.92; % moment of inertia about base (axisymmetric) (lb-s^2-in)
r0 = 12; % outmost radius (in)
hCM = 3*23.34; % height of center of mass (in)
cdamp = 100000; % damping coefficient in rocking regime

%% BW positions
r1 = 10.5; % BW radius
nBW = 12; % number of BW stacks
alphBW = (0:nBW-1)*(2*pi)/nBW; % BW location angles
xBW0 = r1*[cos(alphBW); sin(alphBW)]; % body frame (x, y) coord

%% Solve rocking dynamics
f = @(t_,x_)rocking_dynamics(t_, x_, ...
                             u_, Phi_, dt_, ...
                             ssign, ...
                             mass, II, r0, hCM, cdamp, ...
                             xBW0, BWhyst, BWfe, delt0);
x0 = zeros(2+nBW,1);
x0(3:end) = fh0;

opt = odeset('MaxStep',1e-2,'RelTol',1e-6,'AbsTol',1e-8);

tic
[T, X] = ode15s(f, (0:0.001:50), x0, opt);
toc

figure(101),
    plot(T, X(:,1))

figure(102),
    plot(T, X(:,2))

if 0
figure(103),
    plot(T, X(:,3:14))
end

%% Evaluate xdot at computed X
Xdot = zeros(size(X));
Phi = zeros(size(T));
Delt = zeros(length(T),12);
Deltd = zeros(length(T),12);
for n = 1:length(T)
    [Xdot(n,:), Phi(n), Delt(n,:), Deltd(n,:)] = f(T(n), X(n,:)');
end

figure(201),
    plot(T, Phi)

figure(202),
    hold on
    for n = 1:12
        plot(Delt(:,n), X(:,2+n)+nonlin_force_bw(Delt(:,n)))
    end

return
%% Animate
addpath ../animate/
animate_rigid_body
rmpath ../animate/

%% Path
rmpath ../dynamics/
