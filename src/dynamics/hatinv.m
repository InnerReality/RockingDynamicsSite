function a = hatinv(ahat)

% inverse of the hat function: skew symmetric matrix->vector

% if (max(max(abs(ahat+ahat'))) > 1e-10)
%     fprintf('matrix must be skew symmetric\n')
%     a = [];
%     return
% end

a = [ahat(3,2); ahat(1,3); ahat(2,1)];
