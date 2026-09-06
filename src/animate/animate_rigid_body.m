function fig = animate_rigid_body(t, phi_t, theta_t, geom, thetaGain, ssignFcn, mp4filename)
%ANIMATE_RIGID_BODY Animate a 3-stacked-cylinder rigid body over a
% prescribed (phi(t), theta(t)) trajectory.
%
%   fig = ANIMATE_RIGID_BODY(t, phi_t, theta_t, geom, thetaGain, ssignFcn)
%   fig = ANIMATE_RIGID_BODY(t, phi_t, theta_t, geom, thetaGain, ssignFcn, mp4filename)
%
% Animates a rigid body made of 3 stacked, concentric cylinders undergoing
% a prescribed trajectory, via
%
%   x = r(phi,theta) + R(phi,theta) * (x0 - r(phi,theta))
%
% where x0 is a point's coordinate in the body (reference) frame, r is the
% instantaneous pivot point in world coordinates, and R is the rotation
% matrix built from the instantaneous rotation axis tau(phi) via Rodrigues'
% formula (see getRot.m).
%
% Geometry (body/reference frame, z-axis = shared cylinder axis, reference
% orientation aligned with world Z):
%   Cylinder 1 (bottom):  z in [-h1, 0],        diameter d1
%   Cylinder 2 (middle):  z in [0, h2],         diameter d2
%   Cylinder 3 (top):     z in [h2, h2+h3],     diameter d3
%   Body-frame origin (x0 = 0) is the top face of cylinder 1 / interface
%   with cylinder 2.
%
% r(phi,theta)   = r0*ssign(theta)*[cos(phi); sin(phi); 0]   (world coords,
%                   this is a FIXED point in world space at any instant --
%                   the physical pivot/contact point)
% tau(phi)       = [-sin(phi); cos(phi); 0]                  (unit rotation
%                   axis, computed inside getRot.m)
% R(phi,theta)   = expm(hat(tau(phi))*theta), evaluated via Rodrigues'
%                   formula in getRot.m (no matrix exponential needed)
%
% INPUTS
%   t          - nFrames x 1, uniformly sampled time vector
%   phi_t      - nFrames x 1, phi trajectory (radians)
%   theta_t    - nFrames x 1, theta trajectory (radians), TRUE (unscaled)
%   geom       - struct with fields:
%                  h1, d1  - bottom cylinder height, diameter
%                  h2, d2  - middle cylinder height, diameter
%                  h3, d3  - top cylinder height, diameter
%                  r0      - scalar radius used in r(phi,theta)
%   thetaGain  - visual amplification applied ONLY to the theta argument
%                passed into getRot() (i.e. only affects R, the rotation
%                actually drawn). r(phi,theta) always uses the TRUE
%                (unscaled) theta_t, since ssign(theta) should reflect
%                actual physics, not the visual exaggeration.
%   ssignFcn   - handle to your smoothed sign function, called as
%                ssignFcn(theta) -> scalar. e.g. ssignFcn = @(th) tanh(th/eps0)
%   mp4filename - (optional) if provided (non-empty), the animation is
%                also written to this file as an MP4 via VideoWriter.
%                If omitted or empty, no video is saved -- drawnow only.
%
% OUTPUT
%   fig        - handle to the figure used for the animation
%
% DEPENDENCIES (must be on the MATLAB path):
%   hat.m      - skew-symmetric cross-product matrix
%   getRot.m   - Rodrigues-formula rotation matrix R(phi,thet) [+ dR]
% (ssign is passed in directly as ssignFcn -- see above -- not a path dependency)
%
% NOTES / CONVENTIONS
%   - The body-frame origin (x0 = 0) maps to world position
%         x(0) = r + R*(0 - r) = (I - R)*r
%     This is where the optional body-axis triad is drawn. It is NOT the
%     same point as r(phi,theta) itself (which maps to itself, and is the
%     point highlighted with a marker).
%   - Cylinder lateral surfaces only (no end caps) for simplicity.
%
% -------------------------------------------------------------------

if nargin < 7
    mp4filename = '';
end
saveVideo = ~isempty(mp4filename);

t       = t(:);
phi_t   = phi_t(:);
theta_t = theta_t(:);
nFrames = numel(t);
dt      = t(2) - t(1);

%% ---------------- GEOMETRY (from geom struct) ----------------
h1 = geom.h1;  d1 = geom.d1;
h2 = geom.h2;  d2 = geom.d2;
h3 = geom.h3;  d3 = geom.d3;
r0 = geom.r0;

%% ---------------- RENDERING DEFAULTS ----------------
N          = 40;                       % angular resolution per cylinder
faceAlpha  = 0.35;                     % translucency of cylinder surfaces
showBodyAxes = true;                   % draw body-frame triad each frame
triadLen   = 0.6*max([d1 d2 d3]);      % triad arrow length
cyl_colors = [0.85 0.33 0.10;          % cylinder 1 color
              0.00 0.45 0.74;          % cylinder 2 color
              0.47 0.67 0.19];         % cylinder 3 color

% Subsample factor for the (one-time) axis-limits prepass, in case the
% trajectory is very long. 1 = use every sample.
axLimSubsample = 1;

%% ---------------- BODY-FRAME CYLINDER GEOMETRY ----------------
zr1 = [-h1, 0];
zr2 = [0, h2];
zr3 = [h2, h2+h3];

[X01,Y01,Z01] = localCylinder(d1/2, zr1, N);
[X02,Y02,Z02] = localCylinder(d2/2, zr2, N);
[X03,Y03,Z03] = localCylinder(d3/2, zr3, N);

cylData = struct('X0',{X01,X02,X03}, 'Y0',{Y01,Y02,Y03}, 'Z0',{Z01,Z02,Z03});

%% ---------------- AXIS LIMITS (ONE-TIME PREPASS) ----------------
axLim = computeAxisLimits(phi_t, theta_t, thetaGain, ssignFcn, r0, cylData, axLimSubsample);

%% ---------------- FIGURE / GRAPHICS SETUP ----------------
fig = figure('Color','w','Position',[100 100 900 700]);
ax = axes(fig); hold(ax,'on'); grid(ax,'on'); axis(ax,'equal');
xlim(ax, axLim(1,:)); ylim(ax, axLim(2,:)); zlim(ax, axLim(3,:));
xlabel(ax,'X'); ylabel(ax,'Y'); zlabel(ax,'Z');
view(ax, 3);                          % default view; tune by trial and error
camlight(ax,'headlight');
lighting(ax,'gouraud');

hSurf = gobjects(1,3);
for k = 1:3
    hSurf(k) = surf(ax, nan(size(cylData(k).X0)), nan(size(cylData(k).Y0)), ...
        nan(size(cylData(k).Z0)), 'FaceColor', cyl_colors(k,:), ...
        'FaceAlpha', faceAlpha, 'EdgeColor', 'none');
end

hMarker = plot3(ax, nan, nan, nan, 'o', 'MarkerFaceColor', 'r', ...
    'MarkerEdgeColor', 'k', 'MarkerSize', 8);

if showBodyAxes
    hQx = quiver3(ax, nan, nan, nan, nan, nan, nan, 0, 'Color','r','LineWidth',2,'MaxHeadSize',0.8);
    hQy = quiver3(ax, nan, nan, nan, nan, nan, nan, 0, 'Color','g','LineWidth',2,'MaxHeadSize',0.8);
    hQz = quiver3(ax, nan, nan, nan, nan, nan, nan, 0, 'Color','b','LineWidth',2,'MaxHeadSize',0.8);
end

hTitle = title(ax, '');

%% ---------------- VIDEO WRITER SETUP (optional) ----------------
if saveVideo
    vidFPS = max(10, min(60, round(1/dt)));   % clamp to a sane MPEG-4 range
    vw = VideoWriter(mp4filename, 'MPEG-4');
    vw.FrameRate = vidFPS;
    vw.Quality = 95;
    open(vw);
end

%% ---------------- MAIN ANIMATION LOOP ----------------
for i = 1:nFrames
    phi_i   = phi_t(i);
    theta_i = theta_t(i);              % TRUE theta -> used in r via ssign
    theta_vis = thetaGain*theta_i;     % SCALED theta -> used only in R

    r_i = r0*ssignFcn(theta_i)*[cos(phi_i); sin(phi_i); 0];
    R_i = getRot(phi_i, theta_vis);    % Rodrigues-based rotation matrix

    for k = 1:3
        [Xw,Yw,Zw] = transformSurf(cylData(k).X0, cylData(k).Y0, cylData(k).Z0, r_i, R_i);
        set(hSurf(k), 'XData', Xw, 'YData', Yw, 'ZData', Zw);
    end

    set(hMarker, 'XData', r_i(1), 'YData', r_i(2), 'ZData', r_i(3));

    if showBodyAxes
        origin_body = (eye(3) - R_i)*r_i;   % world position of x0 = 0
        axesDirs = R_i*triadLen;            % columns: rotated x,y,z dirs

        set(hQx, 'XData', origin_body(1), 'YData', origin_body(2), 'ZData', origin_body(3), ...
                 'UData', axesDirs(1,1), 'VData', axesDirs(2,1), 'WData', axesDirs(3,1));
        set(hQy, 'XData', origin_body(1), 'YData', origin_body(2), 'ZData', origin_body(3), ...
                 'UData', axesDirs(1,2), 'VData', axesDirs(2,2), 'WData', axesDirs(3,2));
        set(hQz, 'XData', origin_body(1), 'YData', origin_body(2), 'ZData', origin_body(3), ...
                 'UData', axesDirs(1,3), 'VData', axesDirs(2,3), 'WData', axesDirs(3,3));
    end

    set(hTitle, 'String', sprintf('t = %.2f s   (\\phi = %.1f^\\circ, \\theta = %.3f^\\circ, \\theta_{vis} = %.1f^\\circ)', ...
        t(i), rad2deg(phi_i), rad2deg(theta_i), rad2deg(theta_vis)));

    drawnow;

    if saveVideo
        frame = getframe(fig);
        writeVideo(vw, frame);
    end
end

if saveVideo
    close(vw);
end

end % ===================== end of main function =====================

%% =====================================================================
%  LOCAL FUNCTIONS
%  =====================================================================

function [X,Y,Z] = localCylinder(radius, zrange, N)
% Body-frame lateral-surface coordinates of a cylinder of given radius,
% spanning z in [zrange(1), zrange(2)], with N angular facets.
    [Xu,Yu,Zu] = cylinder(radius, N);   % Zu in [0,1] by default
    X = Xu;
    Y = Yu;
    Z = zrange(1) + Zu*(zrange(2) - zrange(1));
end

function [Xw,Yw,Zw] = transformSurf(X0,Y0,Z0,r,R)
% Applies x = r + R*(x0 - r) to every point of a surface grid.
    sz = size(X0);
    P0 = [X0(:)'; Y0(:)'; Z0(:)'];
    Pw = R*(P0 - r) + r;
    Xw = reshape(Pw(1,:), sz);
    Yw = reshape(Pw(2,:), sz);
    Zw = reshape(Pw(3,:), sz);
end

function axLim = computeAxisLimits(phi_t, theta_t, thetaGain, ssignFcn, r0, cylData, subsample)
% One-time pass over the (possibly subsampled) trajectory, transforming
% just the cylinder surface points, to get a fixed bounding box with a
% margin so the animation doesn't jitter/rescale frame to frame.
    idx = 1:subsample:numel(phi_t);
    allPts = [];
    for i = idx
        phi_i = phi_t(i);
        theta_i = theta_t(i);
        theta_vis = thetaGain*theta_i;
        r_i = r0*ssignFcn(theta_i)*[cos(phi_i); sin(phi_i); 0];
        R_i = getRot(phi_i, theta_vis);
        for k = 1:3
            X0 = cylData(k).X0; Y0 = cylData(k).Y0; Z0 = cylData(k).Z0;
            P0 = [X0(:)'; Y0(:)'; Z0(:)'];
            Pw = R_i*(P0 - r_i) + r_i;
            allPts = [allPts, Pw]; %#ok<AGROW>
        end
    end
    lo = min(allPts,[],2);
    hi = max(allPts,[],2);
    pad = 0.1*max(hi - lo);
    if pad == 0, pad = 1; end
    axLim = [lo - pad, hi + pad];
end
