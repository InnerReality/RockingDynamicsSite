function [xdot, phi, delt, deltd] = rocking_dynamics_algebraic(t, x, uaccel, udaccel, dtaccel, ssign, kBW, c, xBW0)

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

% Dynamics
thet = x(1);
thetd = x(2);
phi = x(3);

st = sin(thet);
ct = cos(thet);
cp = cos(phi);
sp = sin(phi);

% Smooth sign and derivative
[sgnt, sgntp] = ssign(thet); % sign(thet) and sign'(thet)

% Base acceleration
u = getVal(t, uaccel, dtaccel);
ud = getVal(t, udaccel, dtaccel);

tau = [-sp; cp];
taup = -[cp; sp];

% BW deformation and forces
xtildeBW0 = taup'*xBW0 + r0*sgnt;
delt = xtildeBW0*thet;
deltd = (xtildeBW0 + r0*sgntp*st)*thetd;
fBW = kBW*delt';
fBWd = kBW*deltd';

% Inertia dynamics
Itt = II + m*(r0*sgnt)^2;
rhs = -m*r0^2*sgnt*sgntp*thetd^2 - c*(1-sgnt^2)*thetd - xtildeBW0*fBW ...
      -m*h*(taup'*u(1:2)) + m*u(3)*r0*sgnt;

% phi equation and derivative
% v = m*u(1:2)*(h*st+r0*sgnt*(1-ct)) - xBW0*fBW*st;
% vd = m*ud(1:2)*(h*st+r0*sgnt*(1-ct)) ...
%    + m*u(1:2)*(h*ct+r0*sgnt*st+r0*sgntp*(1-ct))*thetd ...
%    - xBW0*fBWd*st - xBW0*fBW*ct*thetd;
v = u(1:2);
vd = ud(1:2);
denominator = (v(1)*cp+v(2)*sp);
kphi = 1e4;
numerator = -(vd(1)+kphi*v(1))*sp+(vd(2)+kphi*v(2))*cp;

% xdot
xdot = zeros(3,1);
xdot(1) = x(2);
xdot(2) = rhs/Itt;
if (abs(denominator) <= 1e-8)
    xdot(3) = 0;
else
    xdot(3) = numerator/denominator;
end

% fprintf('numerator = %g; denominator = %g; phidot = %g\n',numerator, denominator, xdot(3))
