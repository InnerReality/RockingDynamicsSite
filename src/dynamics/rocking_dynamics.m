function [xdot, phi, delt, deltd] = rocking_dynamics(t, x, ...
    uaccel, phi_, phidot_, dtaccel, ...
    ssign, ...
    m, II, r0, h, c, ...
    xBW0, BWhyst, BWfe, delt0)

% INPUTS
% t, x - standard ode inputs (time and state)
% uaccel - nsamples x 3 array of base accel comppnents (X, Y, Z)
% phi - precomputed phi DOF (nsamples x 1)
% dtaccel - sampling time for uaccel and phi
% ssign - callback for computing smooth sine
% m - mass of rocking body
% II - mass moment of inertia of rocking body about center of base
% r0 - outermost radius of rocking body
% h - height of center of mass of rocking body
% c = damping coefficient for the rocking regime
% xBW0 = [2xnBW] array of (x,y) positions of BWs
% BWhyst = callback to compute diff eq for friction component of BW force
% BWfe = callback to compute elastic component of BW force
% delt0 = BW preload deformation
% OUTPUTS
% xdot and auxilliary outputs

% State indices
% 1 = theta, 2 = thetadot

% Parameters
nBW = size(xBW0, 2);

% States
thet = x(1);
thetd = x(2);
fBWh = x(3:end); % friction (hysteretic part of BW force)

% Base acceleration and phi
u = getVal(t, uaccel, dtaccel);
phi = getVal(t, phi_, dtaccel, 1);
phidot = getVal(t, phidot_, dtaccel, 1);

% Smooth sign and derivative
[sgnt, sgntp] = ssign(thet); % sign(thet) and sign'(thet)
st = sin(thet);
ct = cos(thet);

tau = [-sin(phi); cos(phi)];
taup = -[cos(phi); sin(phi)];

% BW deformation and forces
xtildeBW0 = taup'*xBW0 + r0*sgnt;
delt = delt0 + xtildeBW0*st;
deltd = (xtildeBW0*ct + r0*sgntp*st)*thetd - (tau'*xBW0)*st*phidot;
fBW = BWfe(delt') + fBWh;

% Inertia dynamics
Itt = II + m*(r0*sgnt)^2;
rhs = -m*r0^2*sgnt*sgntp*thetd^2 - c*(1-sgnt^2)*thetd - xtildeBW0*fBW ...
      -m*h*(taup'*u(1:2)) + m*u(3)*r0*sgnt;

% xdot
xdot = zeros(size(x));
xdot(1) = x(2);
xdot(2) = rhs/Itt;
for n = 1:nBW
    xdot(2+n) = BWhyst(x(2+n),delt(n),deltd(n));
end
