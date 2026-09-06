% Load EQ input
u_ = table2array(readtable("Cerl_input.txt"));
dt_ = 1/512; % Sample time in seconds for the input

u = getVal(10, u_, dt_);
disp(u);