function u = getVal(t, u_, dt_, endopt)

% Compute interpolated value
% INPUT
% t = time at which interpolated value is computed
% u_ = nsamples x nchannels of data
% dt_ = sample time of data
% endopt - 0: set value beyond range of u_ data to 0; 1: set value to
%         u(end)

ind = floor(t/dt_) + 1;

if nargin < 4
    endopt = 0; % default - set value beyond range of u_ data to 0
end

if (ind+1 > size(u_,1))
    if (endopt == 0)
        u = zeros(size(u_,2),1);
    else
        u = u_(end,:);
    end
    return
end

u1 = u_(ind,:)';
u2 = u_(ind+1, :)';

dt = t - (ind-1)*dt_;

u = (1-dt/dt_)*u1 + (dt/dt_)*u2;
