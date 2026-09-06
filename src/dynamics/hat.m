function ahat = hat(a)

% matrix representation of the cross product
% a x b = ahat*b
% a = 3x1 vector

ahat = [0 -a(3) a(2); a(3) 0 -a(1); -a(2) a(1) 0];
