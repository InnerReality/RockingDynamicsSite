function [R, dR] = getRot(phi, thet)

% get rotation matrix and derivative
% derivative dR is such that 
% hat(dR(:,1)) = R^T dR/dphi
% hat(dR(:,2)) = R^T dR/dthet

sp = sin(phi);
cp = cos(phi);
st = sin(thet);
ct = cos(thet);

% instantaneous axis of rotation
tau = [-sp; cp; 0];
tauhat = hat(tau);

R = eye(3) + st*tauhat + (1-ct)*tauhat^2;

if nargout>1 % then also compute dR
    taup = [-cp; -sp; 0];
    e3 = [0; 0; 1];
    dR = [st*taup-(1-ct)*e3 tau];
end
