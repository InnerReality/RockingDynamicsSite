## Geometric derivation

Let

$$
r(\theta) = r_0\,\operatorname{sgn}(\theta).
$$

Since

$$
\frac{dy}{dr} = \tan(\theta),
$$

the smooth part of the path satisfies

$$
\frac{dy}{d\theta}
= \frac{dy}{dr}\frac{dr}{d\theta}
= r_0\,\operatorname{sgn}'(\theta)\tan(\theta).
$$

Starting from the upright position, the height is obtained by integrating through the full contact-angle range up to 90 degrees:

$$
y\!\left(\frac{\pi}{2}\right)
= \int_0^{\pi/2}
 r_0\,\operatorname{sgn}'(u)\tan(u)\,du.
$$

For a selected contact angle, the horizontal position used to place the contact point is the arc length along the same path:

$$
r_{\mathrm{contact}}(\theta)
= \int_0^\theta
 r_0\,\operatorname{sgn}'(u)\sqrt{1+\tan^2(u)}\,du.
$$

Once $\operatorname{sgn}'(\theta)=0$, the contact radius is constant at $\pm r_0$ and the path continues vertically. The mirrored branches and the two side walls then form the closed tipping object shown above.
