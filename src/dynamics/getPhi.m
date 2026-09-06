function phi = getPhi(v)

% Computes the algebraic DOF phi given the vector involved in the algebraic
% equation, v = m*h*u(1:2) - xBW0*fBW;
% This is made into a separate function, so the if-then logic can be
% experimented with without touching rocking_dynamics.m

phi = atan(v(2)/v(1));

if isnan(phi)
    phi = 0;
elseif phi < -pi/2 + 1e-6 % i.e. if phi == -pi/2
    phi = pi/2;
end
