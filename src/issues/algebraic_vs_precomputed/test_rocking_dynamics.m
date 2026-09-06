%% Load EQ input
grav = 386.4; % acceleration due to gravity (in/s^2)
if 1
dt_ = 1/512; % Sample time in seconds for the input
u_ = table2array(readtable("Cerl_input.txt"))*grav*1;
% u_(:,3) = 0;
t_ = (0:size(u_,1)-1)'*dt_;
ud_ = [diff(u_)/dt_; 0 0 0];
else % try some pulses for troubleshooting
    dt_ = 0.001;
    t_ = (0:dt_:8)';
    gamm1 = pi/3;
    gamm2 = -pi/4;
    amp1 = [cos(gamm1) sin(gamm1) 0]*grav;
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
Phi_ = getPhiFromU(u_, 0);

%% Path
addpath ../dynamics/

%% Set up smooth sign
ssign = @(t_)(smoothstep(t_,1000,0.001,1));

%% Test BW hysteresis by itself
kBW = 1000; % lb/in
fyBW = 100; % lb
dyBW = fyBW/kBW; % yield displacement
% BWhysteresis=@(f_,x_,xd_)(kBW*(1-abs(f_/fyBW)^20*(1+sign(f_*xd_))/2)*xd_);
BWhysteresis=@(f_,x_,xd_)(kBW*xd_);

dBW = @(t_)(2*dyBW)*sin(2*pi*1*t_);
vBW = @(t_)(2*pi*1*(2*dyBW))*cos(2*pi*1*t_);
BWhysteresis_test = @(t_,x_)(BWhysteresis(x_,dBW(t_),vBW(t_)));
[TBW,FBW] = ode15s(BWhysteresis_test, [0 3], 0);
if 0, figure, plot(dBW(TBW), FBW), end

%% Rigid body/rocking paramters
cdamp = 10000;

%% BW positions
r1 = 10.5; % BW radius
nBW = 12; % number of BW stacks
alphBW = (0:nBW-1)*(2*pi)/nBW; % BW location angles
xBW0 = r1*[cos(alphBW); sin(alphBW)]; % body frame (x, y) coord

%% Solve rocking dynamics
if 0
f = @(t_,x_)rocking_dynamics(t_, x_, u_, dt_, ssign, BWhysteresis, cdamp, xBW0);
x0 = zeros(14,1); % (thet, thetdot, 12BW forces);
% x0(2) = 0.1;
else
% f = @(t_,x_)rocking_dynamics_algebraic(t_, x_, u_, ud_, dt_, ssign, kBW, cdamp, xBW0);
% x0 = zeros(3,1);
f = @(t_,x_)rocking_dynamics_precomputed_phi(t_, x_, u_, Phi_, dt_, ssign, kBW, cdamp, xBW0);
x0 = zeros(2,1);
end
opt = odeset('MaxStep',1e-2);
tic
[T, X] = ode15s(f, (0:0.05:50), x0, opt);
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

if 0
figure(202), 
    plot(Delt(:,1), X(:,3))
end
return
%% Animate
addpath ../animate/
animate_rigid_body
rmpath ../animate/

%% Path
rmpath ../dynamics/
