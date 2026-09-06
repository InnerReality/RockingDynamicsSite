function F_e = nonlin_force_bw(u,disp_scale,fe_scale,a1,b1)

    arguments
       u
       disp_scale = 6 % Series scaling % 3 sets of 2U-2D
       fe_scale = 2 % Parallel scaling % 2 in 2U-2D
       % adjusting factors a1, b1
       a1 = 1 %0.5;
       b1 = 1 %1.13;
    end

%{
NOTE: This function uses optional arguments - need R2022b or higher

This function computes the nonlinear force `F_e` based on the input 
displacement `u`. The force is modeled using the equation derived in 
(Almen,J. O. & a. Laszlo,1936)

The constants (E, mu, M, a, h, t) are defined inside the function
and may be modified as required.

INPUT:
  u - Scalar displacement value (can represent a position or 
      deformation in a mechanical system). It is expected that `u`
      should be a numeric value or array, where the displacement 
      values can be positive or negative.
  disp_scale - scales displacement (Series scaling).
               Eg: For 3 sets of 2U-2D, disp_scale = 6
  fe_scale - scales force (Parallel scaling) Eg: For 2U-2D, fe_scale = 2
  a1, b1 - adjusting factors

OUTPUT:
  F_e - is the value of load calculated using:

        F_e = (E*u). * ( (h - u).*(h - u/2)*t + t^3 )/((1 - mu^2)*M*a^2)

PARAMETERS

% Material and geometric constants (modify as needed)
    E  = 210e9;      % Young's modulus (Pa)
    mu = 0.3;        % Poisson's ratio
    E_mu = E/(1-mu^2);
    h  = 0.1;        % height (mm)
    t  = 0.01;       % thickness (mm)
    OD = 2;          % Outer Diameter (mm)
    ID = 1;          % Inner Diameter (mm)

%}


% Material and geometric constants (obtained from key belleville catalog)
    E_mu = 33*10^6;   % psi
    OD = 2.25;        % Outer Diameter (in)
    ID = 1.13;        % Inner Diameter (in)
    h  = 0.075;       % height (in)
    t  = 0.073;       % thickness (in)
    R = OD/ID;
    a = OD/2;
    M = 6/pi/log(R)*((R-1)^2/R^2); % M parameter
    
    u  = u/disp_scale;


    F_e = fe_scale*E_mu*u.*( a1*(h - u).*(h - u/2)*t + b1*t^3 )/(M*a^2);
