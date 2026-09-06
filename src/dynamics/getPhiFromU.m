function Phi = getPhiFromU(u, phi0, dt_, algflag)

% u = nsamples x 2 array of base acceleration (X and Y) (columns>2 not
%     used)
% phi0 = initial phi
% dt_ = time step for u samples
% algflag = 1: compute algebraically, 0: compute as a diffeq

if algflag % Compute algebraically

Phi = atan2(u(:,2), u(:,1));

% Phi = atan(u(:,2)./u(:,1));
% Phi(isnan(Phi)) = 0;
% Phi(Phi < -pi/2 + 1e-6) = pi/2;

inputTol = 1e-8; % if norm(u) < this, input accel is take as zero there

if (norm(u(1,[1 2])) < inputTol) % i.e 0
    Phi(1) = phi0;
end
for n = 2:length(Phi)
    if (norm(u(n,[1 2])) < inputTol)
        Phi(n) = Phi(n-1);
    end
end

else % Compute as a differential equation

K = 20;
T = (0:size(u,1)-1)*dt_;
[~,Phi] = ode45(@phidot, T, phi0);
end

    function xdot = phidot(t, x)
        u_ = getVal(t,u,dt_);
        xdot = -K*tan(x + atan2(u_(2),u_(1)));
    end


end