import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sys import argv, exit

if __name__ == '__main__':
    N = int(argv[1])
    ts = np.linspace(0, 2*np.pi, N+1)[0:N]
    R = 4
    r = 1
    x = (R + r*np.cos(ts[:, None]))*np.cos(ts[None, :])
    y = (R + r*np.cos(ts[:, None]))*np.sin(ts[None, :])
    z = r*np.sin(ts[:, None])*np.ones((1, N))
    idx = np.arange(z.size)
    idx = np.reshape(idx, z.shape)

    fout = open("torus%ix%i.off"%(N, N), "w")
    fout.write("OFF\n")
    fout.write("%i %i 0\n"%(N*N, N*N*2))

    # Write out vertices
    for xi, yi, zi in zip(x.flatten(), y.flatten(), z.flatten()):
        fout.write("%.3g %.3g %.3g\n"%(xi, yi, zi))

    # Write out faces
    for i in range(N):
        for j in range(N):
            fout.write("3 %i %i %i\n"%(idx[i, (j+1)%N], idx[(i+1)%N, j], idx[i, j]))
            fout.write("3 %i %i %i\n"%(idx[i, (j+1)%N], idx[(i+1)%N, (j+1)%N], idx[(i+1)%N, j]))

    fout.close()