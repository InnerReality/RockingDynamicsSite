function [xdot, phi, delt, deltd] = rocking_dynamics_precomputed_phi(t, x, uaccel, phi_, dtaccel, ssign, kBW, c, xBW0)

% INPUTS
% t, x, uaccel, dtaccel, ssign, BWhysteresis
% c = damping coefficient for the rocking regime
% xBW0 = [2xnBW] array of (x,y) positions of BWs

% State indices
% 1 = theta, 2 = thetadot, 3:end = BW forces

% Parameters
grav = 386.4;
m = 543.86/grav; % mass (lb-s^2/in) 
II = 2054.92; % moment of inertia about base (axisymmetric) (lb-s^2-in)
r0 = 12; % outmost radius (in)
h = 23.34; % height of center of mass (in)
nBW = size(xBW0, 2);

delt0 = 0; %#ok<NASGU> BW preload [NOT USED]

% States
thet = x(1);
thetd = x(2);

% Base acceleration and phi
u = getVal(t, uaccel, dtaccel);
phi = getVal(t, phi_, dtaccel);

% Smooth sign and derivative
[sgnt, sgntp] = ssign(thet); % sign(thet) and sign'(thet)

taup = -[cos(phi); sin(phi)];

% BW deformation and forces
xtildeBW0 = taup'*xBW0 + r0*sgnt;
delt = xtildeBW0*thet;
deltd = (xtildeBW0 + r0*sgntp*sin(thet))*thetd;
fBW = kBW*delt';

% Inertia dynamics
Itt = II + m*(r0*sgnt)^2;
rhs = -m*r0^2*sgnt*sgntp*thetd^2 - c*(1-sgnt^2)*thetd - xtildeBW0*fBW ...
      -m*h*(taup'*u(1:2)) + m*u(3)*r0*sgnt;

% xdot
xdot = zeros(2,1);
xdot(1) = x(2);
xdot(2) = rhs/Itt;
