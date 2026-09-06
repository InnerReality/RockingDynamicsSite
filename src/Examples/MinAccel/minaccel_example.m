%% Example - demonstrate minimum acceleration needed to activate rocking
% Uses dynamics code from commit  0d50e330f21d3fc7ea1b08bfd7d55f4a61b472be

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


%% Exitation
grav = 386.4; % acceleration due to gravity (in/s^2)
dt_ = 0.001;
t_ = (0:dt_:8)';
gamm1 = pi/3;
amp1 = [cos(gamm1) sin(gamm1) 0]*grav*accelscale;
wind1 = t_<=0.1;
u_ = zeros(length(t_),3);
u_(wind1,:) = amp1.*(1 - cos(2*pi*10*t_(wind1)))/2;
u_(:,3) = u_(:,3) - grav;
Phi_ = getPhiFromU(u_, 0, dt_, 1);

%% Path
addpath ../../dynamics/

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
                             u_, Phi_, dt_, ...
                             ssign, ...
                             mass, II, r0, hCM, cdamp, ...
                             xBW0, BWhyst, BWfe, delt0);
x0 = zeros(2+nBW,1);
x0(3:end) = fh0;

opt = odeset('MaxStep',1e-2,'RelTol',1e-6,'AbsTol',1e-8);

tic
[T, X] = ode15s(f, (0:0.0001:1), x0, opt);
toc

if plotall
figure(101),
    plot(T, X(:,1))

figure(102),
    plot(T, X(:,2))

if 0
figure(103),
    plot(T, X(:,3:14))
end
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

figure(202),
    hold on
    for n = 1:12
        plot(Delt(:,n), X(:,2+n)+nonlin_force_bw(Delt(:,n)))
    end
end

%% Path
rmpath ../../dynamics/
