function fd_=bellevillemodel(f_,x_,v_,nonlin_force,mu,Kh,No)
    
    arguments
        f_ 
        x_ 
        v_ 
        nonlin_force 
        mu = 0.06; % friction coeff
        Kh=13000; % lb/in
        No=3; % influences damping
    end

%{
NOTE: This function uses optional arguments - need R2022b or higher

This function is used to get the rate of frictional force for given input
variables.
 
Cannot be used on an ode solver directly. 


MODEL:
Diagram: (Partially drawn by chatGPT prompt in ditaa format)

            x(t),v(t)  ^  
                       |
                       |
              +---------------+
              |  Top of Spr   | 
              +---------------+ 
                      |
                   +-----+ 
                   | Bel | f(t)
                   | Spr | 
                   +-----+ 
               _______|_______
              ////////////////

INPUTS:
x = x(t) is the displacement at time t
v = v(t) is the velocity at time t
f = f(t) is the friction force at time t
nonlin_force = nonlinear elastic force-displacement function handle

Tuning Parameters:
Kh = friction (hysteretic) spring stiffness - governs spring force update
rate
No = factor deciding smoothness of elastic-hysteretic transition.
mu = friction coefficient

OUTPUT:
fd_ = friction force rate
%}


  F_e = nonlin_force(x_);
  
  fd_=Kh*(1-abs(f_/mu/(f_+max(F_e,1e-4)))^No*(1+sign(v_*f_))/2)*v_; %Bouc-Wen model used here as a friction model


  