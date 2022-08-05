import { Canvas2dRenderer } from 'soundworks/client';
import { getScaler } from 'soundworks/utils/math';

// import * as soundworks from 'soundworks/client';

class Circle {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;

    this.opacity = options.opacity || 1;
    this.color = options.color;
    this.fill = options.fill;

    this.growthVelocity = options.velocity || 50; // pixels / sec
    this.minVelocity = 50; // if gain is < 0.25 => constant growth
    this.friction = -50; // pixels / sec

    this.setDuration(options.duration);

    this.radius = 0;
    this.coords = {};
    this.isDead = false;
  }

  setDuration(time) {
    this.lifeTime = time;
    this.opacityScale = getScaler(this.lifeTime, 0, this.opacity, 0);
  }

  update(dt, w, h) {
    this.coords.x = this.x * w;
    this.coords.y = this.y * h;

    this.lifeTime -= dt;
    this.opacity = this.opacityScale(this.lifeTime);

    if (this.growthVelocity > this.minVelocity) {
      this.growthVelocity += (this.friction * dt);
      this.growthVelocity = Math.max(0, this.growthVelocity);
    }

    this.radius += this.growthVelocity * dt;

    if (this.lifeTime < 0 || this.radius === 0)
      this.isDead = true;
  }

  draw(ctx) {
    console.log()
    if (this.isDead)
      return;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.coords.x, this.coords.y, Math.round(this.radius), 0, Math.PI * 2, false);

    if (this.fill)
      ctx.fill();
    else
      ctx.stroke();

    ctx.closePath();
    ctx.restore();
  }
}

class CirclesRenderer extends Canvas2dRenderer {
  constructor() {
    super();

    this.circles = [];
    this.enableRecording = true;
    this.analyser = null;
    this.bufferLength = null;
    this.dataArray = null;
    this.volume = 0;
    this.averaging = 0.95;
    this.sharedParams = null;
    this.rms_update_count = 0;
    this.peak_freq = 0;
  }

  update(dt) {
    if(this.analyser != null && this.enableRecording){
      this.analyser.getByteFrequencyData(this.dataArray);

      // var sum = 0;
      // var x;
      // for (var i = 0; i < this.bufferLength; ++i) {
      //   x = this.dataArray[i];
      // 	sum += x * x;
      // }

      // ... then take the square root of the sum.
      // var rms =  Math.sqrt(sum / this.bufferLength);
      // Now smooth this out with the averaging factor applied
      // to the previous sample - take the max here because we
      // want "fast attack, slow release."
      // this.volume = Math.max(rms, this.volume*this.averaging);
      // this.volume = rms*this.averaging + (1-this.averaging) * this.volume;

      // var peak_freq = Math.max.apply(Math, this.dataArray);
      let new_peak_freq = this.dataArray.indexOf(Math.max(...this.dataArray));
      this.peak_freq = new_peak_freq*this.averaging + (1-this.averaging) * this.peak_freq;

      if (this.sharedParams != null){
        // if (this.rms_update_count > 5){
        var distance_0 = Math.round((this.peak_freq * 44100) / 8192.0) - 100
        var min_feq = 0;
        if (between(distance_0, min_feq*0, (min_feq*0)+400))
          this.sharedParams.update('distance_0', distance_0);
        if (between(distance_0, min_feq+(400*1), min_feq+(400*1)+400))
          this.sharedParams.update('distance_1', distance_0);
        if (between(distance_0, min_feq+(400*2), min_feq+(400*2)+400))
          this.sharedParams.update('distance_2', distance_0);
        if (between(distance_0, min_feq+(400*3), min_feq+(400*3)+400))
          this.sharedParams.update('distance_3', distance_0);

        this.rms_update_count = 0;
        }
      }
    // }
    // update and remove dead circles
    for (let i = this.circles.length - 1; i >= 0; i--) {
      const circle = this.circles[i];
      circle.update(dt, this.canvasWidth, this.canvasHeight);

      if (circle.isDead)
        this.circles.splice(i, 1);
    }
  }

  render(ctx) {
    for (var i = 0; i < this.circles.length; i++)
      this.circles[i].draw(ctx);
  }

  trigger(soundParams, duration, fill) {
    const options = {
      x: soundParams.x,
      y: soundParams.y,
      color: soundParams.color,
      opacity: Math.sqrt(soundParams.gain),
      velocity: 40 + soundParams.gain * 80,
      duration: duration,
      fill: fill,
    };

    const circle = new Circle(options);
    this.circles.push(circle);
  }
}

function between(x, min, max) {
  return x >= min && x <= max;
}

export default CirclesRenderer;
