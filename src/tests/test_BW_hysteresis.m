addpath ../dynamics/

u0 = 0.03; % preload
u_ = @(t_)(min(u0*t_,1));
ud_ = @(t_)(u0*(t_<=1));

BWhyst0 = @(t_,f_)(bellevillemodel(f_,u_(t_),ud_(t_),@nonlin_force_bw));

% Apply preload
[T, X] = ode45(BWhyst0, [0 1], 0);

figure(101), 
    plot(u_(T), X+nonlin_force_bw(u_(T)))
    hold on

if 0
umax = 0.05;
u_ = @(t_)(u0 + umax*t_.*(1-cos(2*pi*1*t_))); % linearly ramping amplitude
ud_ = @(t_)(umax*(1-cos(2*pi*1*t_)) + 2*pi*1*umax*t_.*sin(2*pi*1*t_));
else
load DeltHistory.mat
dt = T(2) - T(1);
ddot_ = [diff(d)./diff(T); 0];
u_ = @(t_)(getVal(t_,d,dt,1));
ud_ = @(t_)(getVal(t_,ddot_,dt,1));
end

BWhyst = @(t_,f_)(bellevillemodel(f_,u_(t_),ud_(t_),@nonlin_force_bw));

% Apply harmonic load
[T1, X] = ode45(BWhyst, [0 T(end)], X(end));

u__ = zeros(size(T1));
ud__ = zeros(size(T1));
for n = 1:length(u__)
    u__(n) = u_(T1(n));
    ud__(n) = ud_(T1(n));
end

figure(101),
    plot(u__, X+nonlin_force_bw(u__))
    hold off