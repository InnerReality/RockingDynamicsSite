%% Test if body frame angular velocity calculation is correct

% Take a random phi between 0 and 2*pi
phi = rand(1)*2*pi;

% Take a random thet between -pi/6 and pi/6 (pi/6 is arbitrary, not too
% small or big)
thet = (-1+2*rand(1))*pi/6;

% Increments for finite differences
dphi = 1e-10; 
dthet = 1e-10;

addpath ../dynamics/
[R, dR] = getRot(phi, thet);
Rphi = getRot(phi+dphi,thet);
Rthet = getRot(phi,thet+dthet);

dRFD = zeros(3,2);

dRFD(:,1) = hatinv(R'*(Rphi-R)/dphi);
dRFD(:,2) = hatinv(R'*(Rthet-R)/dthet);
rmpath ../dynamics/

fprintf('phi = %g deg, thet = %g deg\n',phi*180/pi, thet*180/pi);
disp([dR dRFD])

